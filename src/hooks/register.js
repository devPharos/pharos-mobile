

import React, { createContext, useContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';

export const RegisterContext = createContext([]);
// const authenticated = auth().currentUser;


const defaultEmpresaSettings = {
    slug: null,
    nome: null,
    apiUrl: null,
    primary_color: null,
    logo: null,
    logo_pharos: 'https://firebasestorage.googleapis.com/v0/b/pharosmobile-edd22.appspot.com/o/pharos.png?alt=media&token=f56de11a-6a9e-4add-8b90-f39f4d90c1b8',
    acessos: 0
}

const defaultUsuarioSettings = {
    nome: null,
    usuario: null,
    empresa_slug: null
}
function RegisterProvider({ children }) {
    const [empresa,setEmpresa] = useState(defaultEmpresaSettings);
    const [usuario,setUsuario] = useState(defaultUsuarioSettings);
    
    async function onAuthStateChanged(authenticated) {

        if(authenticated && authenticated.email) {
            firestore()
                .collection('usuarios')
                .doc(authenticated.email)
                .onSnapshot(documentSnapshot => {
                    const userRef = documentSnapshot.data();

                    setUsuario(userRef)

                    if(userRef.empresa_slug) {
                        firestore()
                        .collection('empresas')
                        .doc(userRef.empresa_slug)
                        .onSnapshot(documentSnapshot => {
                            setEmpresa({slug: userRef.empresa_slug, ...documentSnapshot.data()})
                        });
                    }

                });
        }
    }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);
    

    return (
        <RegisterContext.Provider value={{empresa, setEmpresa, usuario, setUsuario}} >
            { children }
        </RegisterContext.Provider>
    )
}

function useRegister() {
    const context = useContext(RegisterContext);

    return context
}

async function logOut() {
    auth()
        .signOut()
}

function createUserWithEmailAndPassword(account,navigation) {
    auth()
        .createUserWithEmailAndPassword(account.email,account.pass)
        .then(async (result) => {
               
            firestore()
                .collection('Users')
                .doc(account.email)
                .set({
                    name: account.name,
                    email: account.email,
                    male: account.male,
                    createdAt: new Date()
                })
                .then(async () => {

                    await result.user.updateProfile({
                        displayName: account.name
                    })
        
                    // await result.user.sendEmailVerification({
                    //     handleCodeInApp: true,
                    //     url: 'app/email-verification',
                    //    });
                });
            
        })
        .catch(error => {
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert("Attention!","E-mail já em uso. Tente fazer o login.")
                navigation.navigate('Login');
                return;
            }

            if (error.code === 'auth/invalid-email') {
                return;
            }
            Alert.alert("Attention!",error.message);
            // console.error(error);
            return;
        });
}

export { RegisterProvider, useRegister, createUserWithEmailAndPassword, logOut }