import React from 'react';
import { Text, View } from 'react-native';

// import { Container } from './styles';

export default function ConsultaField({titulo, valor}) {
  return (<View style={{ marginVertical: 6, width: '100%' }}>
        <View style={{ padding: 4, borderBottomWidth: 1, display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'flex-start', alignItems: 'center' }}>
            <View style={{ paddingRight: 8, width: '100%' }}>
                <Text style={{ fontWeight: 'bold' }}>{titulo}</Text>
            </View>
            <View style={{ paddingRight: 8, width: '100%' }}>
                <Text>{valor}</Text>
            </View>
        </View>
    </View>);
}