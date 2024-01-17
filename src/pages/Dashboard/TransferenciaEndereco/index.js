import React, { useState, useEffect } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { Page } from './styles';
import HeaderLogin from '../../../components/HeaderLogin';
import Button from '../../../components/Button';
import PageTitle from '../../../components/PageTitle';
import { useForm } from 'react-hook-form';
import InputText from '../../../components/Forms/InputText';
import InputBarcode from '../../../components/Forms/InputBarcode';
import InputSelect from '../../../components/Forms/InputSelect';
import { useRegister } from '../../../hooks/register';
import { getPageData } from '../../../services/getPageData';

export default function TransferenciaEndereco({ navigation }) {
    const [loading, setLoading] = useState(false);
    const { empresa,usuario  } = useRegister();
    const [inputs,setInputs] = useState([]);
    const [pagina,setPagina] = useState(1);
    const [paginas,setPaginas] = useState(1);

    useEffect(() => {
        getPageData('TrfEnd', setLoading, setPaginas, setInputs, empresa, usuario);
    },[])
    
    const { control,handleSubmit,formState: { errors }, register, setValue } = useForm();

    function handleSend(form) {
        console.log(form)
        
        setLoading(false)
    }

    return (
    <>
        <HeaderLogin full={false} />
        <Page style={{ height: RFPercentage(100) - 65 }}>
            <ScrollView style={{ width: '100%', paddingVertical: 36 }}>
                <PageTitle titulo={`TRANSFERÊNCIA DE ENDEREÇO`} />
                <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '90%' }}>
                        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <>
                                {inputs.map((inp, index) => {
                                    if(inp.tipo === 'text') {
                                        return <InputText key={index} visible={inp.pagina === pagina} setValue={setValue} register={register} control={control} keyboardType="default" placeholder={inp.placeHolder || null} autoCorrect={false} name={inp.slug} titulo={inp.titulo} iconLibrary={inp.biblioteca} icon={inp.icon} />
                                    } else if(inp.tipo === 'barcode') {
                                        return <InputBarcode key={index} visible={inp.pagina === pagina} setValue={setValue} register={register} control={control} keyboardType="default" autoCorrect={false} name={inp.slug} titulo={inp.titulo} iconLibrary={inp.biblioteca} icon={inp.icon} />
                                    } else if(inp.tipo === 'select') {
                                        return <InputSelect key={index} visible={inp.pagina === pagina} setValue={setValue} register={register} control={control} keyboardType="default" autoCorrect={false} name={inp.slug} titulo={inp.titulo} opcoes={inp.opcoes} iconLibrary={inp.biblioteca} icon={inp.icon} />
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
                                <Button loading={loading} title="FINALIZAR" />
                            </TouchableOpacity>
                        </View>
                        <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <TouchableOpacity disabled={loading} style={{ width: '100%', flexDirection: 'row', marginVertical: 12 }} onPress={() => setPagina(pagina-1)}>
                            <Button title="Voltar" leftIcon="chevron-left" simple />
                            </TouchableOpacity>
                        </View>
                    </>
                    }              
                </View>
            </ScrollView>
        </Page>
    </>
);
}