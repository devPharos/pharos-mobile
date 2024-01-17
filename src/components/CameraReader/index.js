import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { RFPercentage } from 'react-native-responsive-fontsize';
import api from '../../services/api';
import { useRegister } from '../../hooks/register';

export default function CameraReader({ name, handleCameraReader, setOpenCameraReader, setScanned, rotina, formOutData, items }) {
    const [hasPermission, setHasPermission] = useState(null);
    const { empresa, usuario } = useRegister();

    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
          const { status } = await BarCodeScanner.requestPermissionsAsync();
          setHasPermission(status === 'granted');
        };
    
        getBarCodeScannerPermissions();
    }, []);

    async function handleBarCodeScanned({ type, data }, name) {
        let response = null;
        if(rotina === 'Inventario' && name === 'endereco') {
            setOpenCameraReader(false);
            response = await api.get(`${empresa.apiUrl}/InventarioEndereco?Mestre=${formOutData.MestreInv}&Endereco=${data}`);
            setOpenCameraReader(false);
            // console.log(response.data)
            if(!response.data.ENDERECO && response.data.Status !== 200) {
                Alert.alert("Atenção!",response.data.Message,[
                    {
                        text: 'Ok', onPress: () => {
                        setOpenCameraReader(true);
                        },
                    }]
                );
                return
            }
        } else if(rotina === 'Inventario' && name === 'produtos') {
            try {
                setOpenCameraReader(false);
                const found = items.some(function(item) {
                  return item.codigo === data
                })
                if(found) {
                    Alert.alert("Atenção!","Etiqueta já lida no inventário.",[
                        {
                        text: 'Ok', onPress: () => {
                            setOpenCameraReader(true);
                        },
                        }]
                    );
                    setScanned(true);
                    return
                }
                response = await api.post(`${empresa.apiUrl}/${rotina}?Usuario=${usuario.usuario}`, {inventario: formOutData.MestreInv, endereco: formOutData.endereco, produto: data});
                if(response.data.Status !== 200) {
                    Alert.alert("Atenção!",response.data.Message,[
                        {
                            text: 'Ok', onPress: () => {
                            setOpenCameraReader(true);
                            },
                        }]
                    );
                    return
                }
                
            } catch(err) {
                Alert.alert("Atenção!",err.Message,[
                    {
                    text: 'Ok', onPress: () => {
                        setScanned(true);
                    },
                    }]
                );
            }
        } else if(name.includes('consulta')) {
            response = await api.post(`${empresa.apiUrl}/ConsEtiq`, {consulta: data});
        } else {
            response = await api.get(`${empresa.apiUrl}/Etiqueta?Etiqueta=${data}`)
        }
        handleCameraReader(data, data ? true : false, response.data, name);
        setScanned(true);
        // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    };

    if (hasPermission === null) {
        // return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        // return <Text>No access to camera</Text>;
    }

    return (
    <View style={{ height: RFPercentage(100), backgroundColor: "#efefef", marginTop: 45, flex: 1 }}>
        <TouchableOpacity onPress={() => setOpenCameraReader(false)} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24, marginLeft: 12}}>
            <MaterialCommunityIcons name="chevron-left" size={22} />
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Leitura da Etiqueta</Text>
        </TouchableOpacity>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={100}>
            <ScrollView>
                <View style={{ width: '100%', paddingVertical: 12 }}>
                    <View style={{ width: '100%', height: RFPercentage(78), overflow: 'hidden', zIndex: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <BarCodeScanner
                        onBarCodeScanned={e => handleBarCodeScanned(e,name)}
                        style={{ width: RFPercentage(45), height: RFPercentage(100) }}
                        />
                        <Image source={ require('../../../assets/barcode_frame_wide.png') } style={{ width: RFPercentage(37.5), height: RFPercentage(25), position: 'absolute' }} />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    </View>
    );
}