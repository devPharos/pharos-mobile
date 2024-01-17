import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from './src/global/styles/theme';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { CriarConta } from './src/pages/CriarConta';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import 'react-native-gesture-handler';

import { RegisterProvider } from './src/hooks/register';
import auth from '@react-native-firebase/auth';
import { Login } from './src/pages/Login';
import { Ambiente } from './src/pages/Ambiente';
import Dashboard from './src/pages/Dashboard';
import Rotina from './src/pages/Dashboard/Rotina';
import Submenu from './src/pages/Dashboard/Submenu';
import SeparacaoBoxes from './src/pages/Dashboard/SeparacoesBoxes';
import SeparacaoItens from './src/pages/Dashboard/SeparacoesBoxes/SeparacaoItens';
import PickingBoxes from './src/pages/Dashboard/PickingBoxes';

const Stack = createNativeStackNavigator();

export default function App() {
  const [authenticated,setAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_500Medium, Roboto_700Bold })

  // Handle user state changes
  async function onAuthStateChanged(authenticated) {
    setAuthenticated(authenticated);

    if (initializing)  {
      setInitializing(false);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);
  

  if (!fontsLoaded) {
    return null;
  }

  if (initializing) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#222" barStyle='light-content' hidden={false} />
      <ThemeProvider theme={theme}>
          <RegisterProvider>
              <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false, headerTintColor: '#fff', headerStyle: { backgroundColor: '#e32129' } }} initialRouteName="Login">
                
                { authenticated ? (
                  <Stack.Group>
                    <Stack.Screen name="Dashboard" component={Dashboard} />
                    <Stack.Screen name="Rotina" component={Rotina} options={{
                      animation: 'slide_from_right'
                    }} />
                    <Stack.Screen name="Submenu" component={Submenu} options={{
                      animation: 'slide_from_right'
                    }} />
                    <Stack.Screen name="Separacoes" component={SeparacaoBoxes} options={{
                      animation: 'slide_from_right'
                    }} />
                    <Stack.Screen name="Picking" component={PickingBoxes} options={{
                      animation: 'slide_from_right'
                    }} />
                    <Stack.Screen name="SeparacaoItens" component={SeparacaoItens} options={{
                      animation: 'slide_from_right'
                    }} />
                  </Stack.Group>
                ):(
                  <Stack.Group>
                    <Stack.Screen name="Ambiente" component={Ambiente} options={{
                      title: 'Ambiente',
                      animation: 'slide_from_bottom',
                      presentation: 'transparentModal'
                    }} />
                    <Stack.Screen name="Login" component={Login} />
                    <Stack.Screen name="CriarConta" component={CriarConta} options={{
                      title: 'CriarConta',
                      animation: 'slide_from_right'
                    }} />
                  </Stack.Group>
                )
                }
                
                </Stack.Navigator>
              </NavigationContainer>
          </RegisterProvider>
      </ThemeProvider>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  }
});