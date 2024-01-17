import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../../../global/styles/theme';
import api from '../../../services/api';
import { useRegister } from '../../../hooks/register';
import { getPageData } from '../../../services/getPageData';
import HeaderLogin from '../../../components/HeaderLogin';
import { Page } from '../Rotina/styles';
import PageTitle from '../../../components/PageTitle';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Loading from '../../../components/Loading';
import { useFocusEffect } from '@react-navigation/native'
import Button from '../../../components/Button';

export default function PickingBoxes({ navigation, route }) {
    const { empresa, usuario } = useRegister();
    const [loading, setLoading] = useState(false);
    const [pickings, setPickings] = useState(null);
    const { rotina, menu } = route.params;

    

    useFocusEffect(
        useCallback(() => {
            getPageData(rotina, setLoading, null,null, empresa, usuario, setPickings);
        }, [])
    );

    function handleIniciarPicking(picking = {}) {
        // menu.ROTINA = "TrfEnd"
        navigation.navigate("Rotina", { ...menu, ROTINA: "TrfEnd", rotina: 'TrfEnd', picking })
    }

    return(
        <SafeAreaView style={{ flex:1,borderWidth: 1 }}>
            <HeaderLogin full={false} />
            <Page style={{ height: RFPercentage(100) }}>
                    <ScrollView style={{ width: '100%', paddingVertical: 0, marginVertical: 36 }}>
                        <PageTitle titulo={route.params.TITULO.toUpperCase()} />
                        <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ width: '90%' }}>
                            {
                                loading ? <Loading /> :
                                pickings && pickings.length === 0 ?
                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 32 }}>
                                    <Text style={{ textAlign: 'center', width: 280,fontSize: 18, color: "#868686" }}>Não há solicitações de transferências pendentes no momento</Text>
                                </View>
                                :
                                pickings && pickings.map((picking,index) => {

                                        const color = theme.colors.success;
                                        return <TouchableOpacity onPress={() => handleIniciarPicking(picking)} key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, marginHorizontal: 6, marginBottom: 24, borderWidth: 1, borderColor: color, borderRadius: 8}}>
                                            <>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>Produto: {picking.PRODUTO.trim()}</Text>
                                                    <View style={{ backgroundColor: "#efefef",height:1, width: 300, marginVertical: 8 }}></View>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <View style={{ backgroundColor: theme.colors.success, padding: 4, borderRadius: 4 }}>
                                                            <Text style={{ color: "#FFF", fontWeight: 'bold' }}>{picking.ENDERECO.trim()}</Text>
                                                        </View>
                                                        <View style={{ padding: 4, borderRadius: 4 }}>
                                                            <Text style={{ color: "#222", fontSize: 18, fontWeight: 'bold' }}>{picking.QUANTIDADE2UM.toFixed(0)} <Text style={{ fontSize: 14 }}>cx.</Text></Text>
                                                        </View>
                                                        <View style={{ backgroundColor: theme.colors.fail, padding: 4, borderRadius: 4 }}>
                                                            <Text style={{ color: "#FFF", fontWeight: 'bold' }}>{picking.ENDERECODESTINO.trim()}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={{ width: 18, backgroundColor: color, borderRadius: 18, marginLeft: 18 }}>
                                                    <MaterialCommunityIcons name="chevron-right" size={18} color='#fff' />
                                                </View>
                                            </>
                                        </TouchableOpacity>
                                })
                                
                            }
                            </View>
                            <TouchableOpacity 
                                style={{ width: '90%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} 
                                onPress={() => getPageData(rotina, setLoading, null,null, empresa, usuario, setPickings)}>
                                <Button title="Atualizar" leftIcon="refresh" simple />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={{ width: '90%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} 
                                onPress={() => navigation.goBack()}>
                                <Button title="Voltar" leftIcon="chevron-left" simple />
                            </TouchableOpacity>
                        </View> 
                    </ScrollView>
            </Page>
        </SafeAreaView>
    )
}