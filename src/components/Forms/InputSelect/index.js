import React, { useState, useEffect } from 'react';
import { Entypo } from '@expo/vector-icons';
import { Controller } from "react-hook-form";
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Container,MyInput } from './styles';
import theme from '../../../global/styles/theme';
import { useRegister } from '../../../hooks/register';

export default function InputSelect({ rotina, register, icon, error, visible, name, iconColor, iconLibrary, titulo, control, setValue, opcoes, formOutData, setFormOutData, ...rest }) {
    const { empresa } = useRegister();
    const [selectValue, setSelectValue] = useState(null)
    const [openSelectValues, setOpenSelectValues] = useState(false);

    function handleValue(titulo, valor) {
        setValue(name, valor)
        setSelectValue(titulo);
        setOpenSelectValues(false);
        if(rotina == 'Inventario') {
            setFormOutData({...formOutData, MestreInv: valor})
        }
    }

    useEffect(() => {
        opcoes.map(opt => {
            if(opt.PRINCIPAL) {
                if(rotina == 'Inventario') {
                    setFormOutData({...formOutData, MestreInv: opt.VALOR})
                }
                setValue(name, opt.VALOR)
                setSelectValue(opt.TITULO)
            }
        })
    },[])
  return (
      <Container error={error} style={{ borderRadius: 18, overflow: 'hidden', display: visible ? 'flex' : 'none', flexDirection: 'column', alignItems: 'flex-start' }}>
          <View style={{ width: '100%', backgroundColor: "#FFF", borderRadius: 18, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value }}) => (
                <View style={{ flex: 1, paddingHorizontal: 16 }}>
                    <>
                    <TouchableOpacity onPress={() => setOpenSelectValues(!openSelectValues)}>
                        <Text style={{ fontWeight: 'bold', marginTop: 12 }}>{titulo}</Text>
                        <MyInput
                        editable={false}
                        onChangeText={onChange}
                        value={selectValue}
                        {...register(name)}
                        placeholderTextColor={theme.colors.secondary}
                        {...rest} />
                    </TouchableOpacity>
                    </>
                </View>
             )} />
            <View style={{ paddingHorizontal: 12 }}>
                <Entypo style={{ color: theme.colors.secondary}} name="select-arrows" size={24} />
            </View>
          </View>
        {openSelectValues ?
        <ScrollView nestedScrollEnabled={true} style={{ width: '100%', flex: 1, maxHeight: 200}}>
            { opcoes.map((opt,index) => {
                return <TouchableOpacity key={index} onPress={() => handleValue(opt.TITULO,opt.VALOR)} style={{ paddingVertical: 16, paddingHorizontal: 16 ,borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', borderColor: "#efefef" }}>
                    <Text style={{ color: selectValue === opt.TITULO ? empresa.primary_color || theme.colors.primary : "#868686",paddingLeft: 12 }}>{opt.TITULO}</Text>
                </TouchableOpacity>
            })}
        </ScrollView>
        : null }
      </Container>
  );
}