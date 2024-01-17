import React, { useEffect, useState } from 'react';
import { Button, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import theme from '../../../global/styles/theme';
import { useRegister } from '../../../hooks/register';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

export default function SaldosField({ saldos, saldosAEnderecar }) {
    const [empenhos, setEmpenhos] = useState(null)
    const [aEnderecar, setAEnderecar] = useState(null)
    const { empresa } = useRegister();
    // console.log({ saldos,saldosAEnderecar })
    useEffect(() => {
        console.log({ empenhos })
    },[empenhos])

    const Tab = createMaterialTopTabNavigator();
    

    const styles = StyleSheet.create({
        centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "rgba(0,0,0,.2)"
        },
        modalView: {
        margin: 12,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        width: '90%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        },
        button: {
        borderRadius: 8,
        padding: 8,
        paddingHorizontal: 24,
        elevation: 2,
        },
        buttonClose: {
        backgroundColor: empresa.primary_color,
        },
        textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        },
        modalText: {
        marginBottom: 15,
        textAlign: 'center',
        },
    });

    function SaldosProduto() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF'  }}>
                {saldos.length > 0 ?
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12, marginTop: 36 }}>
                        <Text style={{ fontWeight: 'bold',fontSize: 18 }}>Saldos em Estoque</Text>
                    </View> : null }
                {saldos.map((saldo,index) => {
                    return <View key={index} style={{ borderTopWidth: 1, width: 300, borderColor: "#ccc", borderStyle:'dotted', marginTop: 18 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12, marginTop: 18 }}>
                            <Text style={{ fontWeight: 'bold' }}>Armazém {saldo.ARMAZEM}</Text>
                        </View>
                        {saldo.ENDERECOS.map((endereco,index) => {
                            return (
                            <TouchableOpacity onPress={() => setEmpenhos(endereco.EMPENHOS.length > 0 ? endereco.EMPENHOS : null )} key={index} style={{ borderRadius: 8, borderWidth: 1, borderColor: endereco.EMPENHO ? empresa.primary_color : "#ddd", backgroundColor: endereco.EMPENHO ? "rgba(255,0,0,.03)" : "rgba(0,0,0,.03)", padding: 8, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Text style={{ fontWeight: 'bold' }}>{endereco.DESCRICAO}</Text>
                                    <Text style={{ fontSize: 12, color:"#868686" }}>Empenhado:</Text>
                                </View>
                                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <Text style={{ fontWeight: '500' }}>{endereco.QUANTIDADE} un.</Text>
                                    <Text style={{ fontSize: 12, color: endereco.EMPENHO ? empresa.primary_color : "#868686" }}>{endereco.EMPENHO} un.</Text>
                                </View>
                                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <Text style={{ fontWeight: '500' }}>{Math.round(endereco.QUANTIDADE / endereco.QTDPOREMB)} cx.</Text>
                                    <Text style={{ fontSize: 12, color: endereco.EMPENHO ? empresa.primary_color : "#868686" }}>{Math.round(endereco.EMPENHO / endereco.QTDPOREMB)} cx.</Text>
                                </View>
                            </TouchableOpacity>)
                        })}
                    </View>
                })}
            </View>
        )
    }

    function SaldoAEnderecar() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
            {saldosAEnderecar.length > 0 ?
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12, marginTop: 36 }}>
                    <Text style={{ fontWeight: 'bold',fontSize: 18 }}>Saldos a Endereçar</Text>
                </View> : null }
            {saldosAEnderecar.map((end,index) => {
                return (
                <View key={index} style={{ borderColor: "#ccc", borderStyle:'dotted' }}>
                    <TouchableOpacity onPress={() => setAEnderecar(aEnderecar ? null : end )} key={index} style={{ width: 300, borderRadius: 8, borderWidth: 1, borderColor: "#ddd", backgroundColor: "rgba(0,0,0,.03)", padding: 8, marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Text style={{ fontSize: 12, color: empresa.primary_color }}>{end.ORIGEM === 'SD3' ? 'Movimentação' : 'Entrada'}</Text>
                            <Text style={{ fontWeight: 'bold' }}>{end.DOC}</Text>
                        </View>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Text style={{ fontWeight: '500' }}>{end.SALDO} un.</Text>
                            <Text>Arm. {end.ARMAZEM}</Text>
                        </View>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Text style={{ fontWeight: '500' }}>{Math.round(end.SALDO2UM)} cx.</Text>
                            <Text>{end.DATASALDO}</Text>
                        </View>
                    </TouchableOpacity>
                </View>)
            })}
            </View>
        )
    }
    
    return (
        <>
        <View style={{ marginVertical: 6, width: '100%' }}>
            <SaldoAEnderecar />
            <SaldosProduto />
        </View>
        <Modal
            animationType="slide"
            transparent={true}
            visible={empenhos?.length ? true : false}
            onRequestClose={() => {
                setEmpenhos(null);
            }}>
            <View style={styles.centeredView}>
            <View style={styles.modalView}>
                <Text style={{ fontWeight: 'bold', marginBottom: 12, fontSize: 16 }}>Empenhos</Text>
                <ScrollView style={{ height: RFPercentage(60) }}>
                {empenhos?.map((empenho,index) => {
                    return (
                        <View key={index} style={{ width: '100%', borderRadius: 8, borderWidth: 1, borderColor: "#ddd", padding: 8, backgroundColor: "rgba(0,0,0,.03)", marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View style={{ flexDirection: 'column', alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ width: '50%'  }}><Text style={{ fontWeight: 'bold' }}>{empenho.ORIGEM === 'SC6' ? 'Pedido: ' : 'OP: '}</Text>{empenho.ORIGEM === 'SC6' ? empenho.PEDIDO : empenho.OP}</Text>
                                <View style={{ width: '50%'  }}>
                                    <Text style={{ textAlign: 'right' }}>{empenho.QUANTIDADE} un.</Text>
                                    <Text style={{ textAlign: 'right' }}>{empenho.QTDSEGUM} cx.</Text>
                                </View>
                            </View>
                        </View>
                    )
                })}
                </ScrollView>
                <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setEmpenhos(null)}>
                <Text style={styles.textStyle}>Fechar</Text>
                </Pressable>
            </View>
            </View>
        </Modal>
        </>
    )
}