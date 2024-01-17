import React from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Button from '../../../components/Button';
import HeaderLogin from '../../../components/HeaderLogin';
import PageTitle from '../../../components/PageTitle';

import { Page } from './styles';

export default function EtiquetaProduto({ navigation }) {
  return (
    <>
        <HeaderLogin full={false} />
        <Page style={{ height: RFPercentage(100) - 65 }}>
            <ScrollView style={{ width: '100%', paddingVertical: 36 }}>
                <PageTitle titulo="ETIQUETA DE PRODUTO" />
                <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity 
                            style={{ width: '90%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} 
                            onPress={() => navigation.goBack()}>
                        <Button title="Voltar" leftIcon="chevron-left" simple />
                    </TouchableOpacity>               
                </View>
            </ScrollView>
        </Page>
    </>
  );
}