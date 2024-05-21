import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, TouchableWithoutFeedback, View, Alert, SafeAreaView, LogBox } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Button from '../../../components/Button';
import InputBarcode from '../../../components/Forms/InputBarcode';
import InputSelect from '../../../components/Forms/InputSelect';
import InputText from '../../../components/Forms/InputText';
import InputNumber from '../../../components/Forms/InputNumber';
import HeaderLogin from '../../../components/HeaderLogin';
import PageTitle from '../../../components/PageTitle';
import { useForm } from 'react-hook-form';
import { useRegister } from '../../../hooks/register';
import api from '../../../services/api';

import { Page } from './styles';
import { getPageData } from '../../../services/getPageData';
import Consulta from '../../../components/Forms/Consulta';
import Separacoes from '../../../components/Forms/Separacoes';

export default function Rotina({ navigation, route }) {
    const [loading, setLoading] = useState(false)
    const { empresa, usuario } = useRegister();
    const [inputs,setInputs] = useState([]);
    const [separacoes,setSeparacoes] = useState([]);
    const [pagina,setPagina] = useState(1);
    const [paginas,setPaginas] = useState(1);
    const [items, setItems] = useState([]);
    const [formOutData, setFormOutData] = useState({});
    const rotina = route.params.ROTINA;
    const picking = route.params.picking;
    
    const { control,handleSubmit,formState: { errors }, register, setValue, defaultValues } = useForm();
    
    async function handleSend(form) {
        setLoading(true)
        if(picking) {
            if(form.enderecoorigem !== picking.ENDERECO.trim()) {
                Alert.alert(`Atenção!`,`Endereço de origem não coincide com a solicitação de transferência.`,[
                    {
                      text: 'Ok', onPress: () => {
                        setLoading(false);
                        return;
                    },
                    },
                ]);
            }
            if(form.enderecodestino !== picking.ENDERECODESTINO.trim()) {
                Alert.alert(`Atenção!`,`Endereço de destino não coincide com a solicitação de transferência.`,[
                    {
                      text: 'Ok', onPress: () => {
                        setLoading(false);
                        return;
                    },
                    },
                ]);
            }
            if(form.armazemorigem !== picking.ARMAZEM.trim()) {
                Alert.alert(`Atenção!`,`Armazém de origem não coincide com a solicitação de transferência.`,[
                    {
                      text: 'Ok', onPress: () => {
                        setLoading(false);
                        return;
                    },
                    },
                ]);
            }
            if(form.armazemdestino !== picking.ARMAZEMDESTINO.trim()) {
                Alert.alert(`Atenção!`,`Armazém de destino não coincide com a solicitação de transferência.`,[
                    {
                      text: 'Ok', onPress: () => {
                        setLoading(false);
                        return;
                    },
                    },
                ]);
            }
            // return
        }
        if(rotina === 'Inventario') {
            setFormOutData({...formOutData, endereco: '', produtos: ''})
            setPagina(pagina-1);
            setLoading(false);
            return
        }
        try {
            // setLoading(false)
            console.log(form)
            const { data } = await api.post(`${empresa.apiUrl}/${route.params.ROTINA}?Usuario=${usuario.usuario}`, form);
            if(!data || !data.Status) {
                setLoading(false);
                navigation.goBack();
                return;
            }
            Alert.alert(`Atenção!`,`${data.Status}: ${data.Message}`,[
                {
                  text: 'Ok', onPress: () => {
                    setLoading(false);
                    if(data.Status === 200) {
                        navigation.goBack();
                        return;
                    }
                },
                },
            ]);
        } catch(err) {
            Alert.alert(`Atenção!`,`erro: ${err}`,[
                {
                  text: 'Ok', onPress: () => {
                    setLoading(false);
                },
                },
            ]);
        }
    }

    useEffect(() => {
        LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
        if(route.params.ROTINA != 'SpearacaoPV') {
            getPageData(route.params.ROTINA, setLoading, setPaginas, setInputs, empresa, usuario, setSeparacoes);
        }
    },[])

  return (
    <>
        <SafeAreaView style={{ flex:1,borderWidth: 1 }}>
            <HeaderLogin full={false} />
            <Page style={{ height: RFPercentage(100) }}>
                    <ScrollView style={{ width: '100%', paddingVertical: 0, marginVertical: 36 }}>
                        <PageTitle titulo={route.params.TITULO.toUpperCase()} />
                        <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ width: '90%' }}>
                                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                        <>
                                        {inputs.map((inp, index) => {
                                            if(inp.TIPO === 'text') {
                                                return <InputText key={index} rotina={route.params.ROTINA} setValue={setValue} visible={inp.PAGINA === pagina} register={register} control={control} keyboardType="default" placeholder={inp.PLACEHOLDER || null} autoCorrect={false} name={inp.SLUG} titulo={inp.TITULO} iconLibrary={inp.BIBLIOTECA} icon={inp.ICONE} setFormOutData={setFormOutData} formOutData={formOutData} />
                                            } else if(inp.TIPO === 'barcode') {
                                                return <InputBarcode key={index} setLoading={setLoading} loading={loading} setPagina={setPagina} pagina={pagina} paginas={paginas} rotina={route.params.ROTINA} items={items} setItems={setItems} setValue={setValue} visible={inp.PAGINA === pagina} register={register} control={control} keyboardType="default" autoCorrect={false} name={inp.SLUG} titulo={inp.TITULO} iconLibrary={inp.BIBLIOTECA} icon={inp.ICONE} multiplo={inp.CAMPOMULTIPLO} setFormOutData={setFormOutData} formOutData={formOutData} picking={picking} />
                                            } else if(inp.TIPO === 'select') {
                                                return <InputSelect key={index} rotina={route.params.ROTINA} setValue={setValue} visible={inp.PAGINA === pagina} register={register} control={control} keyboardType="default" autoCorrect={false} name={inp.SLUG} titulo={inp.TITULO} opcoes={inp.OPCOES} iconLibrary={inp.BIBLIOTECA} icon={inp.ICONE} setFormOutData={setFormOutData} formOutData={formOutData} />
                                            } else if(inp.TIPO === 'number') {
                                                return <InputNumber key={index} rotina={route.params.ROTINA} setValue={setValue} visible={inp.PAGINA === pagina} register={register} control={control} keyboardType="default" autoCorrect={false} name={inp.SLUG} titulo={inp.TITULO} opcoes={inp.OPCOES} iconLibrary={inp.BIBLIOTECA} icon={inp.ICONE} setFormOutData={setFormOutData} formOutData={formOutData} />
                                            } else if(inp.TIPO === 'consulta') {
                                                return <Consulta key={index} rotina={route.params.ROTINA} setValue={setValue} visible={inp.PAGINA === pagina} register={register} control={control} keyboardType="default" autoCorrect={false} name={inp.SLUG} titulo={inp.TITULO} opcoes={inp.OPCOES} iconLibrary={inp.BIBLIOTECA} icon={inp.ICONE} setFormOutData={setFormOutData} formOutData={formOutData} />
                                            }
                                        })}
                                        </>
                                    </TouchableWithoutFeedback>
                                </KeyboardAvoidingView>
                            </View>
                            { pagina < paginas && pagina === 1 ?
                            <>
                                <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <TouchableOpacity disabled={loading} style={{ width: '100%', flexDirection: 'row', marginVertical: 12 }} onPress={() => setPagina(pagina+1)}>
                                        <Button loading={loading} title="CONTINUAR" />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity 
                                    style={{ width: '90%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} 
                                    onPress={() => navigation.goBack()}>
                                    <Button title="Voltar" leftIcon="chevron-left" simple />
                                </TouchableOpacity> 
                            </>
                            : pagina < paginas && pagina > 1 ?
                            <>
                                <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <TouchableOpacity disabled={loading} style={{ width: '100%', flexDirection: 'row', marginVertical: 12 }} onPress={() => setPagina(pagina+1)}>
                                        <Button loading={loading} title="CONTINUAR" />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <TouchableOpacity disabled={loading} style={{ width: '100%', flexDirection: 'row', marginVertical: 12 }} onPress={() => setPagina(pagina-1)}>
                                    <Button title="Voltar" leftIcon="chevron-left" simple />
                                    </TouchableOpacity>
                                </View>
                            </>
                            :
                            <>
                                <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <TouchableOpacity disabled={loading} style={{ width: '100%', flexDirection: 'row', marginVertical: 12 }} onPress={handleSubmit(handleSend)}>
                                        <Button loading={loading} title={rotina === 'Inventario' ? 'PRÓX. ENDEREÇO' : 'FINALIZAR'} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <TouchableOpacity disabled={loading} style={{ width: '100%', flexDirection: 'row', marginVertical: 12 }} onPress={() => pagina > 1 ? setPagina(pagina-1) : navigation.goBack()}>
                                    <Button title="Voltar" leftIcon="chevron-left" simple />
                                    </TouchableOpacity>
                                </View>
                            </>
                            }              
                        </View>
                    </ScrollView>
            </Page>
        </SafeAreaView>
    </>
  );
}