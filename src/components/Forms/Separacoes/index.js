import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SeparacaoBoxes from '../../../pages/Dashboard/SeparacoesBoxes';

const Stack = createNativeStackNavigator();

export default function Separacoes({ rotina }) {

  return(
    <Stack.Navigator initialRouteName='Separacao'>
        <Stack.Screen name="Separacao" component={SeparacaoBoxes} initialParams={{ rotina }} />
        <Stack.Screen name="ItensSeparacao" component={Separacoes} />
    </Stack.Navigator>)
}