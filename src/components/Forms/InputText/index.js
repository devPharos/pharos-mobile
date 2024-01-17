import React, { useState } from 'react';
import { Entypo, FontAwesome, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Controller } from "react-hook-form";
import { Text, View } from 'react-native';

import { Container,MyInput } from './styles';
import theme from '../../../global/styles/theme';

export default function InputText({ register, icon, error, visible = true, name, iconColor, iconLibrary, setValue, titulo, control, ...rest }) {
    const [selectValue, setSelectValue] = useState(null)

    return (
    <Container error={error} style={{ borderRadius: 18, overflow: 'hidden', display: visible ? 'flex' : 'none', flexDirection: 'column', alignItems: 'flex-start' }}>
        <View style={{ height: 80, borderWidth: 1, width: '100%', backgroundColor: "#FFF", borderRadius: 18, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Controller
            control={control}
            name={name}
            style={{ paddingHorizontal: 16 }}
            render={({ field: { onChange, value }}) => (
                <View style={{ paddingHorizontal: 12 }}>
                <Text style={{ fontWeight: 'bold', marginTop: 12 }}>{titulo}</Text>
                <MyInput
                style={{ paddingVertical: 12, color: "#222" }}
                onChangeText={setValue}
                value={selectValue} 
                {...register(name)}
                placeholderTextColor={theme.colors.secondary}
                {...rest} />
                </View>
             )} />
             { icon ? 
            <View style={{ paddingHorizontal: 12 }}>
                { !iconLibrary ?
                <FontAwesome style={{ color: theme.colors.secondary}} name={icon} size={24} />
                : iconLibrary === 'FontAwesome' ?
                <FontAwesome style={{ color: theme.colors.secondary}} name={icon} size={24} />
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
          </View>
      </Container>
    );
}