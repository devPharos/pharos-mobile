import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, TouchableWithoutFeedback, View, TouchableOpacity, Keyboard, Text } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useForm } from 'react-hook-form'
import Input from '../../components/Forms/Input';
import HeaderLogin from '../../components/HeaderLogin';
import theme from '../../global/styles/theme';
import { Page } from './styles';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Button from '../../components/Button';
import { useRegister } from '../../hooks/register';
import FooterLogin from '../../components/FooterLogin';
import Loading from '../../components/Loading';

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
 }

export function Ambiente({ navigation }) {
   const [loading, setLoading] = useState(false);
   const { setEmpresa, empresa, usuario } = useRegister();

   const { control,handleSubmit,formState: { errors }, register } = useForm({ defaultValues: {
       empresa: '',
       ambiente: ''
   } });

   async function handleBuscarEmpresa(form) {
        setLoading(true)
        try {
            if(form.empresa.trim() === '') {
                setLoading(false)
                return;
            }
            firestore()
            .collection('empresas')
            .doc(form.empresa.trim())
            .onSnapshot(async documentSnapshot => {
                const retEmpresa = documentSnapshot.data();
                const logoReference =  await storage().ref(form.empresa.trim()+'.png').getDownloadURL();
     
                 wait(2000).then(() => {
                    setEmpresa({slug: form.empresa.trim(), logo: logoReference, ...retEmpresa});
                    setLoading(false)
                    navigation.goBack();
                 })
            });
        } catch(err) {
            setLoading(false)
        }
   }

   async function handleSairEmpresa(form) {
    setEmpresa({ slug: null, nome: null, apiUrl: null, primary_color: null, logo: null});
   }

   function goTo() {
       navigation.goBack()
   }

//    console.log(empresa, usuario)

   return (
      <View style={{ backgroundColor: theme.colors.background, height: RFPercentage(100) - 64, marginTop: 86 }}>
        <Page style={{ height: RFPercentage(100) }}>
            <View style={{ width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ marginBottom: 12 }}>
                    <Text style={{ color: empresa.primary_color || theme.colors.primary,fontSize: 24, letterSpacing: -1, fontWeight: 'bold' }}>DEFINIR AMBIENTE</Text>
                </View>
                <View style={{ width: '90%' }}>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <>
                                <Input register={register} control={control} autoCapitalize="none" keyboardType="default" icon="building" placeholder="Slug da Empresa" name="empresa" value={empresa.slug} />
                            </>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </View>
                <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    { empresa.slug ?
                    <TouchableOpacity disabled={loading} style={{ width: '100%', flexDirection: 'row', marginVertical: 12 }} onPress={handleSubmit(handleSairEmpresa)}>
                        <Button loading={loading} title="SAIR DO AMBIENTE" />
                    </TouchableOpacity>
                    :
                    <TouchableOpacity disabled={loading} style={{ width: '100%', flexDirection: 'row', marginVertical: 12 }} onPress={handleSubmit(handleBuscarEmpresa)}>
                        {loading ? 
                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                            <Loading />
                        </View> 
                        : 
                        <Button loading={loading} title="BUSCAR E ENTRAR" />}
                    </TouchableOpacity>
                    }
                </View>
            </View>
        </Page>
        { empresa.slug ?
        <FooterLogin goTo={goTo} />
        : null }
    </View>);
}