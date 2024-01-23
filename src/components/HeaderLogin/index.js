import React from 'react';
import { View, Image, Text } from 'react-native';
import theme from '../../global/styles/theme';
import { useRegister } from '../../hooks/register';

// import { Container } from './styles';

export default function HeaderLogin({ full = false }) {
    const { empresa } = useRegister();

  return <View style={{ width: '100%', backgroundColor: empresa.primary_color || theme.colors.primary, height: full ? 86 : 46, paddingHorizontal: 12, paddingVertical: full ? 16 : 8, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        { empresa.logo ?
            <Image source={{ uri: empresa.logo }} style={{ width: full ? 117 : 65, height: full ? 58 : 33 }} imageStyle={{ resizeMode: 'contain' }}></Image>
        : 
            <Image source={require('../../../assets/pharos_logo_white.png')} style={{ width: full ? 166 : 83, height: full ? 26 : 13 }} imageStyle={{ resizeMode: 'contain' }}></Image>
        }
        <View>
            <Text style={{ color: "#FFF", textAlign: 'right', fontSize: full ? 12 : 10 }}>Versão 1.0.39</Text>
            <Text style={{ color: "#FFF", textAlign: 'right', fontSize: full ? 12 : 10 }}>Build 2.01.2301</Text>
        </View>
    </View>;
}
