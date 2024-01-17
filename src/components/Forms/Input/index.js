import React from 'react';
import { Entypo, FontAwesome,FontAwesome5,MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Controller } from "react-hook-form";
import { Text, View } from 'react-native';

import { Container,MyInput } from './styles';
import theme from '../../../global/styles/theme';

export default function Input({ register, icon, error, name, iconColor, iconLibrary, titulo, control, ...rest }) {
  return (
      <Container error={error} style={{ borderRadius: 18, overflow: 'hidden' }}>
          <View style={{ width: '100%', backgroundColor: "#FFF", borderWidth: 1, borderColor: theme.colors.secondary, borderRadius: 18, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            { icon ? 
            <View style={{ paddingHorizontal: 12 }}>
                { !iconLibrary ?
                <FontAwesome style={{ color: theme.colors.secondary}} name={icon} size={24} />
                : iconLibrary === 'FontAwesome' ?
                <FontAwesome style={{ color: theme.colors.secondary}} name={icon} size={24} />
                : iconLibrary === 'FontAwesome5' ?
                <FontAwesome5 style={{ color: theme.colors.secondary}} name={icon} size={24} />
                : iconLibrary === 'MaterialCommunityIcons' ?
                <MaterialCommunityIcons style={{ color: theme.colors.secondary}} name={icon} size={24} />
                : iconLibrary === 'MaterialIcons' ?
                <MaterialIcons style={{ color: theme.colors.secondary}} name={icon} size={24} />
                : iconLibrary === 'Entypo' ?
                <Entypo style={{ color: theme.colors.secondary}} name={icon} size={24} />
                : null
                }
            </View>
            : null }
            <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value }}) => (
                <MyInput 
                style={{ paddingHorizontal: !icon ? 16 : 0 }} 
                onChangeText={onChange} 
                value={value} 
                {...register(name)}
                placeholderTextColor={theme.colors.secondary} 
                {...rest} />
             )} />
          </View>
      </Container>
  );
}