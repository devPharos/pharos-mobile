import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { Page } from './styles';
import HeaderLogin from '../../components/HeaderLogin';
import { useRegister } from '../../hooks/register';
import Button from '../../components/Button';
import PageTitle from '../../components/PageTitle';
import api from '../../services/api';

import { logOut } from '../../hooks/register';

export default function Dashboard({ navigation }) {
    const { setUsuario, empresa, usuario } = useRegister();
    const [menus, setMenus] = useState([]);

    async function getUserData() {
        try {
            // console.log({ usuario: usuario.usuario, empresa: empresa.apiUrl})
            const { data } = await api.post(`${empresa.apiUrl}/userauth?Usuario=${usuario.usuario}&Status=A`)
            // console.log(data)
            setMenus(data.MENUS);
        } catch(err) {
            Alert.alert(`Atenção!`,`${err} - User: ${usuario.usuario} - Url: ${empresa.apiUrl}`);
            console.log('err', err) 
        }
    }

    useEffect(() => {
        if(usuario.usuario && empresa.apiUrl) {
            getUserData();
        }
    },[usuario.usuario, empresa.apiUrl])

    function handleLogout() {
        setUsuario({
            nome: null,
            empresa_slug: null
        })
        logOut()
    }
    return (
    <>
        <HeaderLogin full={false} />
        <Page style={{ height: RFPercentage(100) - 65 }}>
            <ScrollView style={{ width: '100%', paddingVertical: 36 }}>
                <PageTitle titulo="DASHBOARD" />
                <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    { menus.map((menu, index) => {
                        if(menu.ROTINA === 'SeparacaoPV') {
                            return <TouchableOpacity 
                            key={index} 
                            style={{ width: '90%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} 
                            onPress={() => navigation.navigate("Separacoes", { ...menu })}>
                                <Button title={menu.TITULO} simple />
                            </TouchableOpacity>
                        } else if(menu.ROTINA) {
                            return <TouchableOpacity 
                            key={index} 
                            style={{ width: '90%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} 
                            onPress={() => navigation.navigate("Rotina", { ...menu })}>
                                <Button title={menu.TITULO} simple />
                            </TouchableOpacity>
                        } else {
                            return <TouchableOpacity 
                            key={index} 
                            style={{ width: '90%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} 
                            onPress={() => navigation.navigate("Submenu", { ...menu })}>
                                <Button title={menu.TITULO} simple rightIcon='chevron-right' />
                            </TouchableOpacity>
                        }
                    })}
                </View>
                <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity 
                            style={{ width: '90%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} 
                            onPress={() => handleLogout()}>
                        <Button title="Fazer Logout" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                            style={{ width: '90%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} 
                            onPress={() => getUserData()}>
                        <Button title="Atualizar Menus" />
                    </TouchableOpacity>
                </View>
                <View>
                    <Text style={{ color:"#ddd", flex:1, textAlign: 'center' }}>Usuário: {usuario.usuario}</Text>
                </View>
            </ScrollView>
        </Page>
    </>
);
}