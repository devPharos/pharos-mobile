import React, { useEffect, useState, useRef } from 'react';
import { Text, View, TouchableOpacity, Alert, SafeAreaView, ScrollView, Platform, FlatList, Modal, Image, KeyboardAvoidingView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRegister } from '../../../../hooks/register';
import HeaderLogin from '../../../../components/HeaderLogin';
import { Page } from '../../Rotina/styles';
import Button from '../../../../components/Button';
import PageTitle from '../../../../components/PageTitle';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { BarCodeScanner } from 'expo-barcode-scanner';
import theme from '../../../../global/styles/theme';
import Loading from '../../../../components/Loading';
import { CircularProgressBase } from 'react-native-circular-progress-indicator';
import api from '../../../../services/api';
import { MyInput } from '../../../../components/Forms/InputBarcode/styles';
import { useForm } from 'react-hook-form';
import axios from 'axios';

export default function SeparacaoItens({ navigation, route }) {
    const { empresa, usuario } = useRegister();
    const inputRef = useRef();
    const [openCameraReader, setOpenCameraReader] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const { separacao, titulo, itens } = route.params;
    const [find, setFind] = useState(null);
    const [loading, setLoading] = useState(false)
    const [reloadPosition, setReloadPosition] = useState(true);
    const { rotina } = route.params;
    const itemsFlatListRef = useRef();

    const { register } = useForm();

    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
          const { status } = await BarCodeScanner.requestPermissionsAsync();
          setHasPermission(status === 'granted');
        };
    
        getBarCodeScannerPermissions();
    }, []);

    const props = {
        activeStrokeWidth: 10,
        inActiveStrokeWidth: 10,
        inActiveStrokeOpacity: 0.05
    };

    useEffect(() => {
        if(reloadPosition && itens && itens.length > 0) {
            let found = false;
            for(let i = 0; i < itens.length; i++) {
                // console.log(i,itens[i].ocorrencia)
                // itens[i].ocorrencia = null
                if(itens[i].SALDOSEPARADO > 0 && !found && !itens[i].ocorrencia) {
                    found = true;
                    setTimeout(() => {
                        itemsFlatListRef.current.scrollToOffset({
                            anmated: true, offset: i * 343
                        })
                    },2000)
                    setReloadPosition(false)
                }
            }
        }
    },[reloadPosition])


    async function handleBarCodeScanned({ type, data }) {
        // console.log({type, data})
        const qtdItens = find.QUANTIDADE / find.QTDEMB;

        if(loading) {
            return;
        }
        setLoading(true);
        try {
            const { data: etiqueta } = await api.get(`${empresa.apiUrl}/Etiqueta?Etiqueta=${data}&Usuario=${usuario.usuario}`);

            if(!etiqueta.PRODUTOS || etiqueta.PRODUTOS.length === 0) {
                setOpenCameraReader(false);
                Alert.alert("Atenção!","Etiqueta não localizada. Certifique-se de que ela existe no sistema.")
                setLoading(false);
                return;
            }

            if(etiqueta.PRODUTOS[0].CODIGO.trim() !== find.PRODUTO.trim()) {
                setOpenCameraReader(false);
                Alert.alert("Produto incorreto!","A etiqueta deve ser do produto: "+find.PRODUTO.trim())
                api.post(`${empresa.apiUrl}/Erros`, {
                    Usuario: usuario.usuario,
                    Rotina: 'Separação',
                    Tipo: 'Leitura',
                    Descricao: 'Produto incorreto! A etiqueta deve ser do produto: '+find.PRODUTO.trim()+' porém foi lido produto: '+etiqueta.PRODUTOS[0].CODIGO.trim()+' da etiqueta: '+data.trim(),
                    Codigo: separacao
                })
                setLoading(false);
                return;
            }

            if(etiqueta.PRODUTOS[0].ARMAZEM.trim() !== find.ARMAZEM.trim()) {
                setOpenCameraReader(false);
                Alert.alert("Armazém incorreto!","A etiqueta deve ser do armazém: "+find.ARMAZEM.trim())
                setLoading(false);
                return;
            }

            const totalEtiquetas = etiqueta.PRODUTOS.reduce((qtdNaEtiq, item) => qtdNaEtiq + (item.QUANTIDADE / item.QTDPOREMB), 0)

            if(totalEtiquetas > qtdItens) {
                setOpenCameraReader(false);
                Alert.alert("Quantidade superior!","A etiqueta bipada contém mais caixas do que solicitado, faça manutenção de pallet!")
                setLoading(false);
                return;
            }

            const { data: separado } = await api.post(`${empresa.apiUrl}/SeparacaoPV/separar?Usuario=${usuario.usuario}`, {
                Usuario: usuario.usuario,
                OrdemSeparacao: separacao,
                Etiqueta: etiqueta.CODIGO.trim() || etiqueta.PALLET.trim()
            });

            if(separado && separado.Message && (separado.Message === 'Item separado.' || separado.Message === 'Separação Concluída.')) {
                
                itens.map((item) => {
                    if(etiqueta.PRODUTOS[0].ARMAZEM.trim() === find.ARMAZEM.trim() && find.ARMAZEM.trim() === item.ARMAZEM.trim() &&
                    etiqueta.PRODUTOS[0].CODIGO.trim() === find.PRODUTO.trim() && find.PRODUTO.trim() === item.PRODUTO.trim()) {
                        // console.log(etiqueta)
                        etiqueta.PRODUTOS.map(etq => {
                            item.SALDOSEPARADO = item.SALDOSEPARADO - etq.QUANTIDADE;
                            item.SEPARADOS.push({ ETIQUETA: etq.ETIQUETA, QUANTIDADE: etq.QUANTIDADE })
                        })
                        setOpenCameraReader(false);
                        setLoading(false);

                        if(separado.Message === 'Separação Concluída.') {
                            Alert.alert("Atenção!","Ordem de Separação: "+separacao+" concluída.");
                            navigation.goBack();
                            return
                        }
                        setReloadPosition(true)
                        return;
                    }
                })

            } else {
                if(separado && separado.Message) {
                    Alert.alert("Atenção",separado.Message );
                } else {
                    Alert.alert("Atenção","Não foi possível a leitura da etiqueta, tente novamente.");
                }
                setOpenCameraReader(false);
                setLoading(false);
                return;

            }
        } catch(err) {
            Alert.alert("Erro",err);
            setLoading(false);
        }
    };

    function handleOpenCamera(item) {
        setFind(item)
        setOpenCameraReader(!openCameraReader)
    }

    function handleOcorrencia(item) {
        Alert.alert("Informar Ocorrência","Tem certeza de que deseja informar ocorrência para este item?",[
            {
                text: "Sim",
                onPress: async () => {
                    // console.log({
                    //     Usuario: usuario.usuario,
                    //     OrdemSeparacao: separacao,
                    //     Item: item.ITEM,
                    //     ocorrencia: "000001"
                    // })
                    const { data } = await api.post(`${empresa.apiUrl}/Ocorrencia?Usuario=${usuario.usuario}`, {
                        Usuario: usuario.usuario,
                        OrdemSeparacao: separacao,
                        Item: item.ITEM,
                        ocorrencia: "000001"
                    });

                    itens.map((it) => {
                        if(it.ITEM === item.ITEM) {
                            // console.log(it.ITEM, item.ITEM)
                            it.ocorrencia = "000001"
                            setOpenCameraReader(false);
                            setLoading(false);
                            return;
                        }
                    })

                    if(data.Message === 'Separação Concluída.') {
                        Alert.alert("Atenção!","Ordem de Separação: "+separacao+" concluída.");
                        navigation.goBack();
                        return
                    } else {
                        Alert.alert("Atenção",data.Message);
                        setOpenCameraReader(false);
                        setLoading(false);
                        setReloadPosition(true)
                        return;
        
                    }
                },
                isPreferred: true
            },{
                text: "Não"
            }
        ])
    }

    const Item = ({item,um,segum,qtdemb = 1, index = 1}) => {
        return (
        <View key={index} style={{ flex: 1, opacity: 1, width: '100%', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#ccc", display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ width: 42, height: 42, borderRadius: 16, backgroundColor: "#C00", flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialCommunityIcons style={{ color: "#FFF" }} name="barcode-scan" size={26} />
            </View>
            <View style={{ paddingHorizontal: 16, flex: 1 }}>
                <View>
                    {/* <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{item.ETIQUETA}</Text> */}
                    <Text style={{ fontSize: 12 }}>Etiq.: {item.ETIQUETA}</Text>
                    {/* <Text style={{ fontSize: 12 }}>{item.descricao}</Text> */}
                </View>
            </View>
            <View style={{ backgroundColor: "#efefef", borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                {rotina === 'SeparacaoPV' ?
                    <Text style={{ color: "#868686" }}>{(item.QUANTIDADE / qtdemb).toFixed(1)} {segum}</Text>
                :
                    <Text style={{ color: "#868686" }}>{item.QUANTIDADE.toFixed(1)} {um}</Text>
                }
            </View>
        </View>
      )};
    return(
        <SafeAreaView style={{ flex:1,borderWidth: 1 }}>
            <HeaderLogin full={false} />
            <Page style={{ height: RFPercentage(100) }}>
                    <ScrollView style={{ width: '100%', paddingVertical: 0, marginVertical: 36 }}>
                        <PageTitle titulo={titulo ? titulo.toUpperCase() : 'Separacação'} />
                        <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ width: '90%' }}>
                            <FlatList
                                ref={itemsFlatListRef}
                                style={{ width: '100%', flex: 1 }}
                                nestedScrollEnabled={true}
                                horizontal={true}
                                ItemSeparatorComponent={
                                    Platform.OS !== 'android' &&
                                    (({highlighted}) => (
                                    <View
                                        style={[highlighted && {marginLeft: 0}]}
                                    />
                                    ))
                                }
                                pagingEnabled
                                data={itens}
                                viewabilityConfig={{
                                    itemVisiblePercentThreshold: 100,
                                  }}
                                renderItem={({item, index, separators}) => (
                                    <View style={{width: 339.5, padding: 18, backgroundColor: "#FFF", borderRadius: 8, marginHorizontal: 2, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center'}}>
                                        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <View style={{ backgroundColor: "#efefef", borderRadius: 16, width: 120,height: 120, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 32, textAlign: 'center', color: "#aaa", fontWeight: 'bold' }}>{item.ENDERECO.trim() !== '' ? item.ENDERECO.trim() : item.ARMAZEM.trim()}</Text>
                                            </View>
                                            <CircularProgressBase
                                                {...props}
                                                value={((item.QUANTIDADE - item.SALDOSEPARADO) / item.QUANTIDADE * 100).toFixed(2)}
                                                radius={60}
                                                activeStrokeColor={theme.colors.success}
                                                inActiveStrokeColor={theme.colors.fail}
                                                delay={250}
                                            >
                                            <Text style={{ fontSize: 22 }}>{((item.QUANTIDADE - item.SALDOSEPARADO) / item.QUANTIDADE * 100).toFixed(0)}%</Text>
                                            { rotina === 'SeparacaoPV' ?
                                            <Text style={{ fontSize: 16, textAlign: 'center' }}>{((item.QUANTIDADE - item.SALDOSEPARADO) / item.QTDEMB).toFixed(0)} / {(item.QUANTIDADE / item.QTDEMB).toFixed(0)} {item.SEGUM}.</Text>
                                            : 
                                            <Text style={{ fontSize: 16, textAlign: 'center' }}>{((item.QUANTIDADE - item.SALDOSEPARADO))} / {(item.QUANTIDADE)} {item.UM}</Text>
                                            }
                                            </CircularProgressBase>
                                        </View>
                                        <View style={{ width: '100%', borderTopWidth: 1, borderColor: "#ccc", paddingVertical: 16, marginTop: 16, borderRightWidth: 0, borderLeftWidth: 0 }}>
                                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: "#868686" }}>{item.PRODUTO.trim()}</Text>
                                            <Text style={{ fontSize: 12, color: "#868686" }}>{item.DESCRICAO.trim()}</Text>
                                        </View>
                                        <View style={{ width: '100%', borderTopWidth: 1, borderColor: "#ccc", paddingVertical: 16, borderRightWidth: 0, borderLeftWidth: 0 }}>
                                            <Text style={{ textAlign: 'center', marginBottom: 4, fontSize: 14, fontWeight: 'bold', color: "#868686" }}>Sugestões de Endereços:</Text>
                                            {item.SUGESTENDERECOS.map((sugest,index) => {
                                            if(index > 4) {
                                                return null
                                            }
                                            return <View key={index} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 2, backgroundColor: index % 2 === 0 ? 'rgba(0,0,0,.03)' : 'transparent', justifyContent: 'space-between', paddingHorizontal: 8, width: '100%'}}>
                                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: "#868686" }}>{index+1} - {sugest.ENDERECO.trim()}</Text>
                                                <Text style={{ fontSize: 14, color: "#868686" }}>{sugest.QTD2UM} Cx.</Text>
                                            </View>
                                            })}
                                        </View>
                                        <View style={{ width: '100%', borderTopWidth: 1, borderColor: "#ccc", paddingVertical: 16, borderRightWidth: 0, borderLeftWidth: 0 }}>
                                            <View style={{ paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                { ((item.QUANTIDADE - item.SALDOSEPARADO) / item.QUANTIDADE * 100) === 100 ?
                                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', paddingVertical: 0 }}>
                                                        <Button simple leftIcon="check" title="Totalmente Separado" />
                                                    </View>
                                                : 
                                                    <TouchableOpacity disabled={loading} onPress={() => handleOpenCamera(item)} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', paddingVertical: 0 }}>
                                                        { loading ? <Loading /> : <Button simple leftIcon="camera" title="Abrir Câmera" /> }
                                                    </TouchableOpacity>
                                                }
                                            </View>
                                            {item.SALDOSEPARADO > 0 &&
                                            <TouchableOpacity disabled={loading} onPress={() => handleOcorrencia(item)} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', paddingVertical: 0 }}>
                                                <Button simple alert leftIcon="alert-decagram-outline" title={`Informar Ocorrência`} />
                                            </TouchableOpacity>}
                                        </View>
                                        {/* {console.log('aqui',item)} */}
                                        {item.SEPARADOS.length > 0 && <View style={{ width: '100%', borderTopWidth: 1, borderColor: "#ccc", paddingVertical: 16, borderRightWidth: 0, borderLeftWidth: 0 }}>
                                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: "#868686" }}>Etiquetas Separadas:</Text>
                                            { loading ?
                                            <Loading />
                                            : item && item.SEPARADOS && item.SEPARADOS.length > 0 ?
                                            <FlatList
                                                nestedScrollEnabled={true}
                                                data={item.SEPARADOS}
                                                renderItem={({item: itemObj,index}) => <Item item={itemObj} um={item.UM} segum={item.SEGUM} qtdemb={item.QTDEMB} index={index} />}
                                                keyExtractor={item => item.codigo}
                                                />
                                                : null }
                                        </View>}
                                    </View>
                                )}
                                />
                            </View>
                        </View>
                    </ScrollView>
                    { openCameraReader && !loading ?
                    <Modal
                    animationType="slide"
                    transparent={true}
                    visible={openCameraReader}
                    onRequestClose={() => {
                        setOpenCameraReader(!openCameraReader);
                    }}>
                         <View style={{ height: RFPercentage(100), backgroundColor: "#efefef", marginTop: 45, flex: 1 }}>
                            <TouchableOpacity onPress={() => setOpenCameraReader(false)} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24, marginLeft: 12}}>
                                <MaterialCommunityIcons name="chevron-left" size={22} />
                                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Leitura da Etiqueta</Text>
                            </TouchableOpacity>
                            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={100}>
                                <ScrollView>
                                    <View style={{ width: '100%',paddingVertical: 12, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                                        <View style={{ borderWidth: 1, height: 50, borderRadius: 16, borderColor: '#ccc', marginHorizontal: 32, padding: 8, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <MyInput editable={loading ? false : true}
                                                onEndEditing={e => handleBarCodeScanned({type: 'text', data: e.nativeEvent.text })}
                                                placeholder="Digitar etiqueta manualmente"
                                                value={inputRef?.current || null}
                                                {...register('etiqueta')}
                                                ref={inputRef}
                                                placeholderTextColor={theme.colors.secondary}
                                                returnKeyType="search"
                                                keyboardType={'default'}
                                                style={{ width: 200 }} />
                                            <MaterialCommunityIcons style={{ color: theme.colors.secondary}} name="barcode-scan" size={24} />
                                        </View>
                                        <View style={{ width: '100%', height: RFPercentage(78), overflow: 'hidden', zIndex: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                            
                                            <BarCodeScanner
                                            onBarCodeScanned={e => handleBarCodeScanned(e)}
                                            style={{ width: RFPercentage(45), height: RFPercentage(100) }}
                                            />
                                            <View style={{ bottom: 0, backgroundColor:"rgba(0,0,0,.5)", padding: 8,width: '89%', height: 40, position: 'absolute', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ color: "#FFF"}}>Endereço: {find.ENDERECO.trim()+" - Produto: "+find.PRODUTO.trim()}</Text>
                                            </View>
                                            <Image source={ require('../../../../../assets/barcode_frame_wide.png') } style={{ width: RFPercentage(37.5), height: RFPercentage(25), position: 'absolute' }} />
                                        </View>
                                    </View>
                                </ScrollView>
                            </KeyboardAvoidingView>
                        </View>
                </Modal> : null }
            </Page>
        </SafeAreaView>
    )
}