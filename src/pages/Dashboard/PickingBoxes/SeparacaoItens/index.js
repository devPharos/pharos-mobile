import React, { useEffect, useState, useRef } from 'react';
import { Text, View, TouchableOpacity, Alert, SafeAreaView, ScrollView, Platform, FlatList, Dimensions, Modal, Image, KeyboardAvoidingView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
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
import CameraReader from '../../../../components/CameraReader';
import api from '../../../../services/api';

export default function SeparacaoItens({ navigation, route }) {
    const { empresa, usuario } = useRegister();
    const [openCameraReader, setOpenCameraReader] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const { separacao, titulo, itens } = route.params;
    const [find, setFind] = useState(null);
    const [loading, setLoading] = useState(false)
    const [reloadPosition, setReloadPosition] = useState(true);
    const { rotina } = route.params;
    const itemsFlatListRef = useRef();

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
                if(itens[i].SALDOSEPARADO > 0 && !found) {
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
        if(loading) {
            return;
        }
        setLoading(true);
        try {
            const { data: etiqueta } = await api.get(`${empresa.apiUrl}/Etiqueta?Etiqueta=${data}&Usuario=${usuario.usuario}`);
            if(etiqueta.PRODUTOS[0].CODIGO.trim() !== find.PRODUTO.trim()) {
                setOpenCameraReader(false);
                Alert.alert("Produto incorreto!","A etiqueta deve ser do produto: "+find.PRODUTOS[0].PRODUTO.trim())
                setLoading(false);
                return;
            }

            if(etiqueta.PRODUTOS[0].ARMAZEM.trim() !== find.ARMAZEM.trim()) {
                setOpenCameraReader(false);
                Alert.alert("Armazém incorreto!","A etiqueta deve ser do armazém: "+find.PRODUTOS[0].ARMAZEM.trim())
                setLoading(false);
                return;
            }

            if(etiqueta.PRODUTOS[0].ENDERECO.trim() !== find.ENDERECO.trim()) {
                setOpenCameraReader(false);
                Alert.alert("Endereço incorreto!","A etiqueta deve ser do endereço: "+find.PRODUTOS[0].ENDERECO.trim())
                setLoading(false);
                return;
            }

            // console.log({
            //         Usuario: usuario.usuario,
            //         OrdemSeparacao: separacao,
            //         Etiqueta: etiqueta.CODIGO.trim() || etiqueta.PALLET.trim()
            //     })

            const { data: separado } = await api.post(`${empresa.apiUrl}/SeparacaoOP/separar?Usuario=${usuario.usuario}`, {
                Usuario: usuario.usuario,
                OrdemSeparacao: separacao,
                Etiqueta: etiqueta.CODIGO.trim() || etiqueta.PALLET.trim()
            });

            if(separado.Message === 'Item separado.' || separado.Message === 'Separação Concluída.') {

                itens.map((item) => {
                    if(etiqueta.PRODUTOS[0].ARMAZEM.trim() === find.ARMAZEM.trim() && find.ARMAZEM.trim() === item.ARMAZEM.trim() &&
                    etiqueta.PRODUTOS[0].ENDERECO.trim() === find.ENDERECO.trim() && find.ENDERECO.trim() === item.ENDERECO.trim() &&
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
            
                Alert.alert("Atenção",separado.Message);
                setOpenCameraReader(false);
                setLoading(false);
                return;

            }
        } catch(err) {
            console.log('err', err)
            setLoading(false);
        }
    };

    // if (hasPermission === null) {
    //     return <Loading title="Buscando permissão..." />;
    // }
    // if (hasPermission === false) {
    //     return <Text>No access to camera</Text>;
    // }

    function handleOpenCamera(item) {
        setFind(item)
        setOpenCameraReader(!openCameraReader)
    }

    const Item = ({item,index,um,segum,qtdemb = 1}) => {
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
                    <Text style={{ color: "#868686" }}>{item.QUANTIDADE / qtdemb} {segum}</Text>
                :
                    <Text style={{ color: "#868686" }}>{item.QUANTIDADE} {um}</Text>
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
                                    <View style={{width: 339.5, height: RFPercentage(80), padding: 18, backgroundColor: "#FFF", borderRadius: 8, marginHorizontal: 2, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center'}}>
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
                                        </View>
                                        <View style={{ width: '100%', borderTopWidth: 1, borderColor: "#ccc", paddingVertical: 16, borderRightWidth: 0, borderLeftWidth: 0 }}>
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
                                        </View>
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
                                    <View style={{ width: '100%', paddingVertical: 12 }}>
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