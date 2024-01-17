import React, { useEffect, useState } from 'react';
import { Entypo, FontAwesome, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Controller } from "react-hook-form";
import { Alert, SafeAreaView, Text, View } from 'react-native';

import { Container,MyInput } from './styles';
import theme from '../../../global/styles/theme';

export default function InputNumber({ register, icon, error, visible = true, name, iconColor, iconLibrary, setValue, titulo, control, setFormOutData, formOutData, ...rest }) {
    const [numberValue, setNumberValue] = useState(null);

    useEffect(() => {
        setValue(name, numberValue)
    },[numberValue])
    return (
    <Container error={error} style={{ borderRadius: 18, overflow: 'hidden', display: visible ? 'flex' : 'none', flexDirection: 'column', alignItems: 'flex-start' }}>
        <View style={{ width: '100%', backgroundColor: "#FFF", borderWidth: 1, borderColor: theme.colors.secondary, borderRadius: 18, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Controller
            control={control}
            name={name}
            style={{ paddingHorizontal: 16 }}
            render={({ field: { onChange, value }}) => (
                <View style={{ flex: 1, paddingHorizontal: 16 }}>
                    <Text style={{ fontWeight: 'bold', marginTop: 12 }}>{titulo}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <SafeAreaView>
                            <MyInput
                            onChangeText={setNumberValue}
                            {...register(name)}
                            value={numberValue}
                            placeholderTextColor={theme.colors.secondary}
                            {...rest}
                            placeholder="0"
                            style={{ width: 200 }}
                            keyboardType="number-pad" />
                        </SafeAreaView>
                    </View>
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