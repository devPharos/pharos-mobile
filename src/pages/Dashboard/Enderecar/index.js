import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Button from '../../../components/Button';
import InputBarcode from '../../../components/Forms/InputBarcode';
import InputSelect from '../../../components/Forms/InputSelect';
import InputText from '../../../components/Forms/InputText';
import HeaderLogin from '../../../components/HeaderLogin';
import PageTitle from '../../../components/PageTitle';
import { useForm } from 'react-hook-form';
import { useRegister } from '../../../hooks/register';
import api from '../../../services/api';

import { Page } from './styles';
import { getPageData } from '../../../services/getPageData';

export default function Enderecar({ navigation, route }) {
    const [loading, setLoading] = useState(false)
    const { empresa, usuario } = useRegister();
    const [inputs,setInputs] = useState([]);
    const [pagina,setPagina] = useState(1);
    const [paginas,setPaginas] = useState(1);
    
    const { control,handleSubmit,formState: { errors }, register, setValue } = useForm();

    async function handleSend(form) {
        console.log(form)
        
        setLoading(true)
        
        try {
            const { data } = await api.post(`${empresa.apiUrl}/Enderecar?Usuario=${usuario.usuario}`, form)
            console.log(data)
            setLoading(false)
        } catch(err) {
            console.log('err', err)
            setLoading(false)
        }
    }

    useEffect(() => {
        getPageData('Enderecar', setLoading, setPaginas, setInputs, empresa, usuario);
    },[])

  return (
    <>
        <HeaderLogin full={false} />
        <Page style={{ height: RFPercentage(100) - 65 }}>
            <ScrollView style={{ width: '100%', paddingVertical: 36 }}>
                <PageTitle titulo="ENDEREÇAR" />
                <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '90%' }}>
                        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <>
                                {inputs.map((inp, index) => {
                                    if(inp.tipo === 'text') {
                                        return <InputText key={index} setValue={setValue} visible={inp.pagina === pagina} register={register} control={control} keyboardType="default" placeholder={inp.placeHolder || null} autoCorrect={false} name={inp.slug} titulo={inp.titulo} iconLibrary={inp.biblioteca} icon={inp.icon} />
                                    } else if(inp.tipo === 'barcode') {
                                        return <InputBarcode key={index} setValue={setValue} visible={inp.pagina === pagina} register={register} control={control} keyboardType="default" autoCorrect={false} name={inp.slug} titulo={inp.titulo} iconLibrary={inp.biblioteca} icon={inp.icon} />
                                    } else if(inp.tipo === 'select') {
                                        return <InputSelect key={index} setValue={setValue} visible={inp.pagina === pagina} register={register} control={control} keyboardType="default" autoCorrect={false} name={inp.slug} titulo={inp.titulo} opcoes={inp.opcoes} iconLibrary={inp.biblioteca} icon={inp.icon} />
                                    }
                                })}
                                </>
                            </TouchableWithoutFeedback>
                        </KeyboardAvoidingView>
                    </View>
                    <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <TouchableOpacity disabled={loading} style={{ width: '100%', flexDirection: 'row', marginVertical: 12 }} onPress={handleSubmit(handleSend)}>
                            <Button loading={loading} title="FINALIZAR" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity 
                            style={{ width: '90%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} 
                            onPress={() => navigation.goBack()}>
                        <Button title="Voltar" leftIcon="chevron-left" simple />
                    </TouchableOpacity>               
                </View>
            </ScrollView>
        </Page>
    </>
  );
}