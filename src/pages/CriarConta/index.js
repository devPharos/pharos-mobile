import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, View, Alert, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form'
import { RFPercentage } from 'react-native-responsive-fontsize';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import firestore from '@react-native-firebase/firestore';
import Input from '../../components/Forms/Input';
import { Page } from './styles';
import Button from '../../components/Button';
import auth, { firebase } from '@react-native-firebase/auth';
import theme from '../../global/styles/theme';
import HeaderLogin from '../../components/HeaderLogin';
import FooterLogin from '../../components/FooterLogin';
import { useRegister } from '../../hooks/register';
import { FontAwesome } from '@expo/vector-icons';
import Loading from '../../components/Loading';

async function forgotPassword(form){
    await firebase.auth().sendPasswordResetEmail(form.email)
        .then(() => {
            Alert.alert('Atenção!', 'Para redefinir sua senha, por favor verifique seu e-mail na caixa de entrada e também no spam.')
        })
}

const schema = Yup.object().shape({
    nome: Yup.string().required('Preencha seu nome / usuário.'),
    email: Yup.string().email('Preencha um e-mail válido.').required('Preencha seu e-mail.'),
    pass: Yup.string()
    .test('len', 'Deve conter pelo menos 8 caracteres.', val => val.length >= 8).required('Crie uma senha forte.'),
    repass: Yup.string().oneOf([Yup.ref('pass'), null], 'As senhas não estão iguais.')
})

export function CriarConta({ route, navigation }) {
    const { empresa } = useRegister();
    const [loadingPage, setLoadingPage] = useState(true);
    const [temAcessoDisponivel, setTemAcessoDisponivel] = useState(0)
    const [loading, setLoading] = useState(false);
    const [openConfig, setOpenConfig] = useState(false);
    const [loginError, setLoginError] = useState({ email: false, pass: false})
    const defaultAccountvalues = { nome: '', email: '', pass: '', empresa: '', usuario: '' }

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

    function handleCreateUser(form) {
        if(verificarLimiteDeAcessos() < 1) {
            Alert.alert("Atenção!","Licenças excedidas, não será possível criar seu acesso.")
            return
        }
        auth()
        .createUserWithEmailAndPassword(form.email,form.pass)
        .then(() => {
            firestore()
                .collection('usuarios')
                .doc(form.email)
                .set({
                    empresa_slug: empresa.slug,
                    nome: form.nome,
                    usuario: form.usuario,
                    created_at: new Date()
                })
                .then(() => {
                });
            
        })
        .catch(error => {
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert("Atenção!","E-mail já em uso. Tente realizar o login.")
                return;
            }

            if (error.code === 'auth/invalid-email') {
                Alert.alert("Atenção!","E-mail inválido.")
                return;
            }
            Alert.alert("Attention!",error.message);
            // console.error(error);
            return;
        });
    }

    if(route.params) {
        const { existEmail, existRegistrationNumber } = route.params;
        defaultAccountvalues.email = existEmail;
        defaultAccountvalues.registrationNumber = existRegistrationNumber;
        defaultAccountvalues.pass = '';
    }

    function goTo() {
        navigation.navigate("Ambiente")
    }
    
    const { control,handleSubmit,formState: { errors }, register } = useForm({ defaultValues: {
        email: '',
        usuario: '',
        pass: '',
        repass: ''
    }, resolver: yupResolver(schema) });

    async function verificarLimiteDeAcessos() {
        try {
            await firestore()
                .collection('usuarios')
                .where('empresa_slug', '==', empresa.slug)
                .get()
                .then(querySnapshot => {
                    return empresa.acessos - querySnapshot.size;
                })
        } catch(err) {
            return 0
        }
    }

    if(loadingPage) {
        setTemAcessoDisponivel(verificarLimiteDeAcessos());
        setLoadingPage(false);
    }
    
    return (
    <>
        <HeaderLogin full={true} />
        <Page style={{ height: RFPercentage(100) - 150, width: '100%' }}>
            <ScrollView style={{ width: '100%', paddingVertical: 36 }}>
                <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ marginBottom: 12 }}>
                        <Text style={{ color: empresa.primary_color || theme.colors.primary,fontSize: 24, letterSpacing: -1, fontWeight: 'bold' }}>CRIAR ACESSO</Text>
                    </View>
                    {loadingPage ? <Loading /> :
                    !temAcessoDisponivel ?
                        <>
                            <View style={{ width: '80%', height: 100, flexDirection: 'column', justifyContent: 'space-evenly' }}>
                                <Text style={{ textAlign: 'center' }}>Infelizmente não há licença disponível para criação de acesso.</Text>
                                <Text style={{ textAlign: 'center' }}>Notifique o setor de T.I.</Text>
                            </View>
                            <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <TouchableOpacity disabled={loading} style={{ width: '100%', flexDirection: 'row', marginVertical: 12 }} onPress={() => navigation.goBack()}>
                                    <Button loading={loading} title="VOLTAR" leftIcon="chevron-left" simple />
                                </TouchableOpacity>
                            </View>
                        </>
                    :
                    <>
                        {/* <View style={{ width: '80%', flexDirection: 'row', justifyContent: 'center', marginVertical: 12 }}>
                            <View style={{ borderRadius: 18, backgroundColor: "#FFF", paddingHorizontal: 6, marginRight: 12, borderWidth: 1, borderColor: "#ddd" }}>
                                <Text style={{ textAlign: 'center' }}>{temAcessoDisponivel}</Text>
                            </View>
                            <Text style={{ textAlign: 'center' }}>{temAcessoDisponivel === 1 ? 'licença disponível' : 'licenças disponíveis'}</Text>
                        </View> */}
                        <View style={{ width: '90%' }}>
                            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                    <>
                                        <Input register={register} control={control} autoCapitalize="none" keyboardType="default" icon="user" autoCorrect={false} placeholder="Seu nome" name="nome" />
                                        {errors && errors.nome ? <Text style={{fontSize: 12,color: empresa.primary_color || theme.colors.primary}}>{errors.nome.message}</Text> : null}
                                        <Input register={register} control={control} autoCapitalize="none" keyboardType="default" icon="user-tag" iconLibrary="FontAwesome5" autoCorrect={false} placeholder="Cód. Usuário" name="usuario" />
                                        {errors && errors.usuario ? <Text style={{fontSize: 12,color: empresa.primary_color || theme.colors.primary}}>{errors.usuario.message}</Text> : null}
                                        <Input register={register} control={control} autoCapitalize="none" keyboardType="email-address" icon="envelope" autoCorrect={false} placeholder="Seu e-mail" name="email" />
                                        {errors && !errors.nome && errors.email ? <Text style={{fontSize: 12,color: empresa.primary_color || theme.colors.primary}}>{errors.email.message}</Text> : null}
                                        <Input register={register} control={control} keyboardType="default" placeholder="Uma senha segura" secureTextEntry={true} autoCorrect={false} name="pass" icon="lock" />
                                        {errors && !errors.nome && !errors.email && errors.pass ? <Text style={{fontSize: 12,color: empresa.primary_color || theme.colors.primary}}>{errors.pass.message}</Text> : null}
                                        <Input register={register} control={control} keyboardType="default" placeholder="Confirme a senha" secureTextEntry={true} autoCorrect={false} name="repass" icon="lock" />
                                        {errors && !errors.nome && !errors.email && !errors.pass && errors.repass ? <Text style={{fontSize: 12,color: empresa.primary_color || theme.colors.primary}}>{errors.repass.message}</Text> : null}
                                    </>
                                </TouchableWithoutFeedback>
                            </KeyboardAvoidingView>
                        </View>
                        <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <TouchableOpacity disabled={loading} style={{ width: '100%', flexDirection: 'row', marginVertical: 12 }} onPress={handleSubmit(handleCreateUser)}>
                                <Button loading={loading} title="CADASTRAR" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity disabled={loading} style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} onPress={() => navigation.goBack()}>
                            <Button title="JÁ POSSUO ACESSO" leftIcon="chevron-left" simple />
                        </TouchableOpacity>
                        <TouchableOpacity disabled={loading} style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 }} onPress={handleSubmit(forgotPassword)}>
                            <Text style={{ textAlign: 'center' }}>Esquecí minha senha. <Text style={{ fontWeight: 'bold' }}>Redefinir</Text></Text>
                        </TouchableOpacity>
                    </>
                    }
                    
                </View>
            </ScrollView>
        </Page>
        <FooterLogin setOpenConfig={setOpenConfig} openConfig={openConfig} goTo={goTo} />
    </>
);
}