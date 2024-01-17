import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Button from '../../../components/Button';
import HeaderLogin from '../../../components/HeaderLogin';
import PageTitle from '../../../components/PageTitle';

import { Page } from './styles';

export default function Submenu({ navigation, route }) {
  return (
    <>
        <HeaderLogin full={false} />
        <Page style={{ height: RFPercentage(100) - 65 }}>
            <ScrollView style={{ width: '100%', paddingVertical: 0, marginVertical: 36 }}>
                <PageTitle titulo={route.params.TITULO.toUpperCase()} />
                <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>       
                { route.params.SUBMENU.map((menu, index) => {
                        if(['SeparacaoPV','SeparacaoOP'].includes(menu.ROTINA)) {
                          return <TouchableOpacity 
                          key={index} 
                          style={{ width: '90%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} 
                          onPress={() => navigation.navigate("Separacoes", { ...menu, rotina: menu.ROTINA })}>
                              <Button title={menu.TITULO} simple />
                          </TouchableOpacity>
                      } else if(['Picking'].includes(menu.ROTINA)) {
                        return <TouchableOpacity 
                        key={index} 
                        style={{ width: '90%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} 
                        onPress={() => navigation.navigate("Picking", { ...menu, rotina: menu.ROTINA, menu })}>
                            <Button title={menu.TITULO} simple />
                        </TouchableOpacity>
                    } else if(menu.ROTINA) {
                          return <TouchableOpacity 
                          key={index} 
                          style={{ width: '90%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} 
                          onPress={() => navigation.navigate("Rotina", { ...menu })}>
                              <Button title={menu.TITULO} simple />
                          </TouchableOpacity>
                        } else {
                          return <TouchableOpacity 
                            key={index} 
                            style={{ width: '90%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} 
                            onPress={() => navigation.navigate("Submenu", { ...menu })}>
                                <Button title={menu.TITULO} simple rightIcon='chevron-right' />
                            </TouchableOpacity>
                        }
                      }
                )}
                <TouchableOpacity 
                    style={{ width: '90%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }} 
                    onPress={() => navigation.goBack()}>
                    <Button title="Voltar" leftIcon="chevron-left" simple />
                </TouchableOpacity>   
                </View>
            </ScrollView>
        </Page>
    </>
  );
}