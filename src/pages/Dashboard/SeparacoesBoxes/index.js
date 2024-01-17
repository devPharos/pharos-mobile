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

export default function SeparacaoBoxes({ navigation, route }) {
    const { empresa, usuario } = useRegister();
    const [loading, setLoading] = useState(false);
    const [separacoes, setSeparacoes] = useState(null);
    const { rotina } = route.params;

    useFocusEffect(
        useCallback(() => {
            getPageData(rotina, setLoading, null,null, empresa, usuario, setSeparacoes);
        }, [])
    );

    function handleIniciarSeparacao(separacao) {
        if(separacao.STATUS === '0') {
            let cMsg = "O.S.: "+separacao.ORDEMSEPARACAO+"\n"+"Pedido: "+separacao.PEDIDO+"\n"+"Cliente: "+separacao.NOMEFANTASIA
            if(rotina === 'SeparacaoOP') {
                cMsg = "O.S.: "+separacao.ORDEMSEPARACAO+"\n"+"Ordem de Produção: "+separacao.ORDEMPRODUCAO
            }
            Alert.alert("Deseja dar início a esta separação?",cMsg,[
                {
                    text: 'Sim', onPress: async () => {
                        try {
                            await api.put(`${empresa.apiUrl}/${rotina}/inicio`, {
                                Usuario: usuario.usuario,
                                OrdemSeparacao: separacao.ORDEMSEPARACAO
                            })
                            // console.log( data )
                            separacoes.map((sep) => {
                                if(sep.ORDEMSEPARACAO == separacao.ORDEMSEPARACAO) {
                                    sep.STATUS = 1;
                                    sep.OPERADOR = usuario.usuario
                                }
                                return sep;
                            })
                            navigation.push("SeparacaoItens", { separacao: separacao.ORDEMSEPARACAO, titulo: `O.S.: ${separacao.ORDEMSEPARACAO}`, itens: separacao.ITENS, rotina })
                        } catch(err) {
                            console.log(err)
                        }
                        // console.log({ data })
                    },
                },{
                    text: 'Não', onPress: () => {
                    },
                }])
        } else {
            navigation.push("SeparacaoItens", { separacao: separacao.ORDEMSEPARACAO, titulo: `O.S.: ${separacao.ORDEMSEPARACAO}`, itens: separacao.ITENS, rotina })
        }
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
                                separacoes && separacoes.length === 0 ?
                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 32 }}>
                                    <Text style={{ textAlign: 'center', width: 280,fontSize: 18, color: "#868686" }}>Não há ordens de separação pendentes no momento</Text>
                                </View>
                                :
                                separacoes && separacoes.map((separacao,index) => {
                                if(rotina === 'SeparacaoPV' && separacao.CODIGO.trim() !== '' || rotina === 'SeparacaoOP' && separacao.ORDEMPRODUCAO.trim() !== ''){
                                    if(separacao.OPERADOR.trim() === '' || separacao.OPERADOR.trim() === usuario.usuario) {
                                        const itens = separacao.ITENS.reduce((acumulador, elemento) => acumulador + elemento.QUANTIDADE, 0);
                                        const aSeparar = separacao.ITENS.reduce((acumulador, elemento) => acumulador + elemento.SALDOSEPARADO, 0);
                                        let itens2UM = 0;
                                        let aSeparar2UM = 0;
                                        if(rotina === 'SeparacaoPV') {
                                            itens2UM = Math.round(separacao.ITENS.reduce((acumulador, elemento) => acumulador + (elemento.QUANTIDADE / elemento.QTDEMB), 0) * 100 ) / 100;
                                            aSeparar2UM = Math.round(separacao.ITENS.reduce((acumulador, elemento) => acumulador + (elemento.SALDOSEPARADO / elemento.QTDEMB), 0) * 100 ) / 100;
                                        }

                                        const color = separacao.STATUS == '1' ? theme.colors.success : theme.colors.fail;
                                        return <TouchableOpacity onPress={() => handleIniciarSeparacao(separacao)} key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, marginHorizontal: 6, marginBottom: 24, borderWidth: 1, borderColor: color, borderRadius: 8}}>
                                            <>
                                                <View style={{ flex: 1 }}>
                                                <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>{separacao.NOMEFANTASIA}</Text>
                                                {rotina === 'SeparacaoPV' ? 
                                                <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>Pedido: {separacao.PEDIDO}</Text>
                                                :
                                                <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>Ordem de Produção: {separacao.ORDEMPRODUCAO}</Text>
                                                }
                                                <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>OS: {separacao.ORDEMSEPARACAO} - {separacao.STATUS === '0' ? <Text style={{ color }}>Não Iniciado</Text> : <Text style={{ color: theme.colors.success }}>Iniciado</Text>}</Text>
                                                <View style={{ backgroundColor: "#efefef",height:1, width: 300, marginVertical: 8 }}></View>
                                                {itens2UM > 0 ?
                                                    <>
                                                        <Text>Total de Itens: {itens.toFixed(2)} uni. / {itens2UM.toFixed(2)} cx.</Text>
                                                        <Text>Separado: {(itens - aSeparar).toFixed(2)} uni. / {(itens2UM - aSeparar2UM).toFixed(2)} cx.</Text>
                                                    </>
                                                : 
                                                    <>
                                                        <Text>Total de Itens: {itens.toFixed(2)} uni.</Text>
                                                        <Text>Separado: {(itens - aSeparar).toFixed(2)} uni.</Text>
                                                    </>
                                                }
                                                <View style={{ width: 310, height: 18,backgroundColor: "#efefef", flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', borderRadius: 9 }}>
                                                    <View style={{ backgroundColor: color, width: 265 * ((itens - aSeparar) / itens), height: 10, borderRadius: 9 }}></View>
                                                    <Text style={{ flex: 1,fontSize: 12, marginLeft: 10 }}>{((itens - aSeparar) * 100 / itens).toFixed(2)}%</Text>
                                                </View>
                                                </View>
                                                <View style={{ width: 18, backgroundColor: color, borderRadius: 18, marginLeft: 18 }}>
                                                    <MaterialCommunityIcons name="chevron-right" size={18} color='#fff' />
                                                </View>
                                            </>
                                        </TouchableOpacity>
                                    }
                                    
                                }
                                })
                                
                            }
                            </View>
                            <TouchableOpacity 
                                style={{ width: '90%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} 
                                onPress={() => getPageData(rotina, setLoading, null,null, empresa, usuario, setSeparacoes)}>
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