import React from 'react';
import { View, Text } from 'react-native';
import theme from '../../global/styles/theme';
import { useRegister } from '../../hooks/register';

// import { Container } from './styles';

export default function PageTitle({ titulo }) {
    const { empresa } = useRegister();
  return <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ marginBottom: 12 }}>
        <Text style={{ color: empresa.primary_color || theme.colors.primary,fontSize: 24, letterSpacing: -1, fontWeight: 'bold', textAlign: 'center' }}>{titulo}</Text>
    </View>                
</View>;
}