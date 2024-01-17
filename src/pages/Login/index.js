import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, View, Alert } from 'react-native';
import { useForm } from 'react-hook-form'
import { RFPercentage } from 'react-native-responsive-fontsize';
import Input from '../../components/Forms/Input';
import { Page } from './styles';
import Button from '../../components/Button';
import auth, { firebase } from '@react-native-firebase/auth';
import theme from '../../global/styles/theme';
import HeaderLogin from '../../components/HeaderLogin';
import FooterLogin from '../../components/FooterLogin';
import { useRegister } from '../../hooks/register';
import Loading from '../../components/Loading';
import PageTitle from '../../components/PageTitle';

async function forgotPassword(form){
    if(form.email.trim() === '') {
        Alert.alert('Atenção!', 'Preencha seu e-mail para redefinir sua senha.')
        return
    }
    await firebase.auth().sendPasswordResetEmail(form.email)
        .then(() => {
            Alert.alert('Atenção!', 'Para redefinir sua senha, por favor verifique seu e-mail na caixa de entrada e também no spam.')
        })
}

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export function Login({ navigation }) {
    const { empresa } = useRegister();
    const [loadingPage, setLoadingPage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [openConfig, setOpenConfig] = useState(false);
    const [loginError, setLoginError] = useState({ email: false, pass: false})

    async function logIn(form) {
        if(!form.pass) {
            return;
        }
        setLoginError({ email: false, pass: false });
        setLoading(true)
        auth()
        .signInWithEmailAndPassword(form.email, form.pass)
        .catch(error => {
            setLoading(false)
            if(error.code === 'auth/wrong-password') {
                setLoginError({ ...loginError, pass: true });
                Alert.alert("Atenção!","Senha incorreta.");
            }
            if(error.code === 'auth/user-not-found') {
                setLoginError({ ...loginError, email: true });
                Alert.alert("Atenção!","E-mail não cadastrado.");
            }
        });
    }

    function goTo() {
        navigation.navigate("Ambiente")
    }

    const { control,handleSubmit,formState: { errors }, register } = useForm({ defaultValues: {
        email: '',
        pass: ''
    } });

    useEffect(() => {
        setLoadingPage(false)
        if(!empresa.nome) {
            setLoadingPage(true)
            wait(1500).then(() => {
                navigation.navigate("Ambiente")
                setLoadingPage(false)
            })
        }
    },[])

    return (
    <>
        <HeaderLogin full={true} />
        <Page style={{ height: RFPercentage(100) - 146 }}>
            <PageTitle titulo="FAZER LOGIN" />
            <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                {loadingPage ? <Loading /> :
                <>
                    <View style={{ width: '90%' }}>
                        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <>
                                    <Input register={register} control={control} autoCapitalize="none" keyboardType="email-address" icon="envelope" autoCorrect={false} placeholder="Seu e-mail" name="email" />
                                    {errors && errors.email ? <Text style={{fontSize: 12,color: empresa.primary_color || theme.colors.primary,marginBottom: 15}}>{errors.email.message}</Text> : null}
                                    <Input register={register} control={control} keyboardType="default" placeholder="********" secureTextEntry={true} autoCorrect={false} name="pass" icon="lock" />
                                    {errors && errors.pass ? <Text style={{fontSize: 12,color: empresa.primary_color || theme.colors.primary,marginBottom: 15}}>{errors.pass.message}</Text> : null}
                                </>
                            </TouchableWithoutFeedback>
                        </KeyboardAvoidingView>
                    </View>
                    <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <TouchableOpacity disabled={loading} style={{ width: '100%', flexDirection: 'row', marginVertical: 12 }} onPress={handleSubmit(logIn)}>
                            <Button loading={loading} title="ENTRAR" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity disabled={loading} style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} onPress={() => navigation.navigate("CriarConta")}>
                        <Button title="CRIAR ACESSO" rightIcon="chevron-right" simple />
                    </TouchableOpacity>
                    <TouchableOpacity disabled={loading} style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 }} onPress={handleSubmit(forgotPassword)}>
                        <Text style={{ textAlign: 'center' }}>Esquecí minha senha. <Text style={{ fontWeight: 'bold' }}>Redefinir</Text></Text>
                    </TouchableOpacity>
                </>
                }
            </View>
        </Page>
        <FooterLogin setOpenConfig={setOpenConfig} openConfig={openConfig} goTo={goTo} />
    </>
);
}