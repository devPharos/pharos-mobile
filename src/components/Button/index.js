import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Loading from '../Loading';
import theme from '../../global/styles/theme';
import { useRegister } from '../../hooks/register';

export default function Button({ title, alert, disabled, simple, loading, rightIcon, leftIcon }) {
  const { empresa } = useRegister();
  return  (
    simple ? 
    <View
    style={{ backgroundColor: title === 'Voltar' ? '#ddd' : 'transparent', flex: 1,borderRadius: 18, borderWidth: 1,borderColor: title === 'Voltar' ? '#ccc' : theme.colors.secondary, paddingVertical: 16, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', opacity: disabled || loading ? .4 : 1 }}>
      {loading ? <Loading /> : null }
      <View style={{ backgroundColor: alert ? "#A00" : "#868686", borderRadius: 18, marginRight: 18 }}>
        {leftIcon ? <MaterialCommunityIcons name={leftIcon} size={16} color='#fff' style={{ padding: 4 }} /> : null}
      </View>
      <Text style={{ color: theme.colors.secondary, fontWeight: "bold", marginLeft: loading ? 16 : 0, flexDirection: 'row', alignItems: 'center' }}>{ title }</Text>
      <View style={{ backgroundColor: "#868686", borderRadius: 18, marginLeft: 18 }}>
        {rightIcon ? <MaterialCommunityIcons name={rightIcon} size={18} color='#fff' /> : null}
      </View>
    </View>
    :
    <View
      style={{
      backgroundColor: empresa.primary_color || theme.colors.primary,
      flex: 1,
      display: 'flex', 
      borderRadius: 18,
      paddingVertical: 16,
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', opacity: disabled || loading ? .7 : 1 }}>
      {loading ? <Loading /> : null }<Text style={{ color: theme.colors.buttonText, fontWeight: "bold", marginLeft: loading ? 16 : 0 }}>{ title }{rightIcon ? <MaterialCommunityIcons name={rightIcon} size={18} /> : null}</Text>
    </View>
  );
}