import React from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import theme from '../../global/styles/theme';
import { FontAwesome } from '@expo/vector-icons';

// import { Container } from './styles';

export default function FooterLogin({ goTo }) {
  return <View style={{ backgroundColor: theme.colors.background, height: 86, width: '100%', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        
        <TouchableOpacity onPress={() => goTo()}>
            <View style={{ marginLeft: 12, width: 60, height: 60, borderRadius: 30, backgroundColor: "#FFF", flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <FontAwesome name='gears' style={{ color: "#222" }} size={26} />
            </View>
        </TouchableOpacity>
{/* 
        <View style={{ width: 120, height: 60, borderTopLeftRadius: 100, borderBottomLeftRadius: 20, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
            <Image source={require('../../../assets/pharos_logo.png')} style={{ width: 67, height: 32 }} imageStyle={{ resizeMode: 'contain' }}></Image>
        </View> */}
    </View>;
}
