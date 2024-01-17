import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard, Platform, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RFPercentage } from 'react-native-responsive-fontsize';
import InputText from '../Forms/InputText';
import Button from '../Button';
import api from '../../services/api';
import { useRegister } from '../../hooks/register';

export default function BarcodeReader({ name, register, control, handleBarCodeReader, setOpenBarcodeReader, setBarCodeValue, barCodeValue, scanned, setScanned }) {
    const [hasPermission, setHasPermission] = useState(null);
    const { empresa } = useRegister();

    useEffect(() => {
        console.log('Barcode Reader', name)
    }, []);

    async function handleBarCodeScanned({ type, data }, name) {
        const response = await api.get(`${empresa.apiUrl}/Etiqueta?Etiqueta=${data}`)
        handleBarCodeReader(data, data ? true : false, response.data, name);
        setScanned(true);
        // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    };

    async function handleManual(name) {
        const response = await api.get(`${empresa.apiUrl}/Etiqueta?Etiqueta=${barCodeValue}`)
        // console.log({barCodeValue, resp: response.data})
        handleBarCodeReader(barCodeValue ? barCodeValue.toUpperCase() : '', true, response.data, name);
    }

    async function handleManualBarCode(value) {
        setBarCodeValue(value)
    }

    if (hasPermission === null) {
        // return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        // return <Text>No access to camera</Text>;
    }

    return (
    <View style={{ height: RFPercentage(100), backgroundColor: "#efefef", marginTop: 45, flex: 1 }}>
        <TouchableOpacity onPress={() => setOpenBarcodeReader(false)} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24, marginLeft: 12}}>
            <MaterialCommunityIcons name="chevron-left" size={22} />
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Leitura da Etiqueta</Text>
        </TouchableOpacity>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={100}>
            <ScrollView>
                <View style={{ backgroundColor: "#fff", width: '100%', paddingVertical: 12 }}>
                    <View style={{ backgroundColor: "#FFF", width: '100%', height: RFPercentage(45), overflow: 'hidden', zIndex: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <BarCodeScanner
                        onBarCodeScanned={e => handleBarCodeScanned(e,name)}
                        style={{ width: RFPercentage(45), height: RFPercentage(100) }}
                        />
                        <Image source={ require('../../../assets/barcode_frame.png') } style={{ width: RFPercentage(45), height: RFPercentage(45), position: 'absolute' }} />
                    </View>
                </View>
                <TouchableOpacity disabled={false} style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '90%' }}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <InputText setValue={handleManualBarCode} register={register} control={control} keyboardType="default" placeholder="Código da Etiqueta" autoCorrect={false} name={name} titulo="Digitar manualmente" icon="barcode" />
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableOpacity>
                <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity 
                            style={{ width: '90%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} 
                            onPress={() => handleManual(name)}>
                        <Button title="Concluir" />
                    </TouchableOpacity>            
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    </View>
    );
}