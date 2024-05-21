import React, { useEffect, useState, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Controller } from "react-hook-form";
import { Text, TouchableOpacity, View, Modal, Alert, SafeAreaView, Animated, Keyboard, KeyboardAvoidingView, Platform, ScrollView, FlatList } from 'react-native';

import { Container,MyInput } from './styles';
import theme from '../../../global/styles/theme';
import CameraReader from '../../CameraReader';
import Button from '../../Button';
import api from '../../../services/api';
import { useRegister } from '../../../hooks/register';
import Loading from '../../Loading';

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export default function InputBarcode({ setLoading, loading, setPagina, pagina, paginas, register, rotina, icon, error, items, setItems, visible, multiplo, name, iconColor, iconLibrary, titulo, control, setValue, setFormOutData, formOutData, picking = null, ...rest }) {
    const [openCameraReader, setOpenCameraReader] = useState(false);
    const [barCodeValue, setBarCodeValue] = useState(null);
    const [itemsToShow, setItemsToShow] = useState(25)
    const [reopen, setReopen] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [palletFound, setPalletFound] = useState(null);
    const [enderecoFound, setEnderecoFound] = useState(null);    
    const [added, setAdded] = useState(false);
    const linha = name.includes("_") ? parseInt(name.split("_")[1]) : 1;
    const [itemLoading, setItemLoading] = useState(null);
    const inputRef = useRef();
    const { empresa, usuario } = useRegister();
    let popUpAnim = useRef(new Animated.Value(110)).current;

    useEffect(() => {
      setBarCodeValue(null)
    },[pagina])

    useEffect(() => {
      setScanned(false);
      if(reopen) {
        wait(500).then(() => {
          handleCameraReader(null,false)
          setReopen(false);
        })
      }
    },[reopen])

    useEffect(() => {
      if(added) {
        Animated.timing(popUpAnim, {
          toValue: 64,
          duration: 1200,
          useNativeDriver: false,
        }).start();
        setTimeout(() => {
          Animated.timing(popUpAnim, {
            toValue: 110,
            duration: 100,
            useNativeDriver: false,
          }).start();
          setAdded(false);
        },1500)
      }
    },[added])

    useEffect(() => {
      if(palletFound) {
        Animated.timing(popUpAnim, {
          toValue: 64,
          duration: 1000,
          useNativeDriver: false,
        }).start();
        setTimeout(() => {
          Animated.timing(popUpAnim, {
            toValue: 110,
            duration: 100,
            useNativeDriver: false,
          }).start();
          setPalletFound(false);
        },1500)
      }
    },[palletFound])

    useEffect(() => {
      if(formOutData.produtos) {
        setItems(formOutData.produtos)
        setLoading(false)
      }
    },[formOutData.produtos])

    useEffect(() => {
      if(visible) {
        setTimeout(() => {
          inputRef.current?.blur();
          inputRef.current?.focus();
        }, 200);
      }
    },[visible])

    async function handleBarCodeReader(valor = null, finaliza = false, apiRet = null, name = '') {
      if(apiRet && rotina === 'Apontar' && name === 'ordemdeproducao'){
        if(apiRet.QTDJE - apiRet.QTDE == 0 || apiRet.DATAFIM != '  /  /  ') {
          Alert.alert("Atenção!","Esta Ordem de Produção já foi encerrada.",[
            {
              text: 'Ok', onPress: () => {
                setScanned(false); 
                handleInput('');
                setTimeout(() => {
                  inputRef.current?.focus();
                  inputRef.current?.focus();
                }, 200);
              },
            }]
          );
        }
        setFormOutData({...formOutData, QTDJE: apiRet.QTDJE, QTDE: apiRet.QTDE })
      }
      if(rotina === 'Apontar' && name === 'produtos') {
        let newItems = [];
        apiRet.PRODUTOS.map((produto) => {
          return newItems.push({produto: produto.CODIGO, descricao: produto.DESCRICAO, codigo: produto.ETIQUETA});
        })
        setItems(newItems)
        const produtos = newItems.map((el) => {
          return el.codigo;
        })
        setValue(name, produtos.toString())
        return;
      }
      if(apiRet && rotina === 'ManPallet' && name === 'pallet'){
        let newItems = [];
        let newItemsString = [];
        apiRet.PRODUTOS.map((produto) => {
          return newItems.push({produto: produto.CODIGO, descricao: produto.DESCRICAO, codigo: produto.ETIQUETA});
        })
        apiRet.PRODUTOS.map((produto) => {
          return newItemsString.push(produto.ETIQUETA)
        })
        setItems(newItems);
        setPalletFound(true);
        setValue('produtos', newItemsString.toString());
        setTimeout(() => {
          if(pagina < paginas) {
            setPagina(pagina+1);
          }
        },1500)
      }
      if(rotina === 'MonPallet'){
        if(name === 'pallet' && apiRet.PRODUTO.trim() !== 'PALLET VAZIO') {
          Alert.alert("Atenção!","Este pallet não está vazio.",[
            {
              text: 'Ok', onPress: () => { 
                setScanned(false); 
                handleInput('');
                setTimeout(() => {
                  inputRef.current?.focus();
                  inputRef.current?.focus();
                }, 200);
                return },
            }]
          );
          return;
        }
        setPalletFound(true);
        setTimeout(() => {
          if(pagina < paginas) {
            setPagina(pagina+1);
          }
        },1500)
      }
      if(rotina === 'Enderecar' && name === 'produtos') {
        let newItems = [];
        apiRet.PRODUTOS.map((produto) => {
          return newItems.push({produto: produto.CODIGO, descricao: produto.DESCRICAO, codigo: produto.ETIQUETA});
        })
        setItems(newItems)
        const produtos = newItems.map((el) => {
          return el.codigo;
        })
        setValue(name, produtos.toString())
        return;
      }
      if(rotina === 'ConsEtiq' && name === 'consulta') {
        setFormOutData({...formOutData, ...apiRet});
        setTimeout(() => {
          if(pagina < paginas) {
            setPagina(pagina+1);
          }
        },500)
        return;
      }
      if(rotina === 'Inventario' && name === 'produtos') {
        inputRef.current?.blur();
        if(valor) {
          setAdded(true);
        }
        setScanned(false); 
        setReopen(false); //true para reabrir a tela
        inputRef.current?.focus();
        apiRet.PRODUTOS.map((produto,index) => {
          return newItems.push({produto: produto.CODIGO, descricao: produto.DESCRICAO, codigo: produto.ETIQUETA});
        })
        setItems(newItems)
        // const { data } = await api.get(`${empresa.apiUrl}/InventarioEndereco?Mestre=${formOutData.MestreInv}&Endereco=${formOutData.endereco}`);
        // let newItems = [];
        // data.PRODUTOS.map((produto,index) => {
        //   return newItems.push({produto: produto.PRODUTO, descricao: produto.DESCRICAO, codigo: produto.CODIGO});
        // })
        // setFormOutData({...formOutData, produtos: newItems})
        setBarCodeValue(null)
        
        return;
      }
      if(rotina === 'Inventario' && name === 'endereco') {
        setLoading(true)
        inputRef.current?.blur();
        let newItems = [];
        apiRet.PRODUTOS.map((produto,index) => {
          return newItems.push({produto: produto.PRODUTO, descricao: produto.DESCRICAO, codigo: produto.CODIGO});
        })
        setEnderecoFound(true)
        setTimeout(() => {
          setFormOutData({...formOutData, endereco: valor, produtos: newItems})
          setLoading(false)
          if(pagina < paginas) {
            setEnderecoFound(false)
            setPagina(pagina+1);
          }
        },1000)
        return;
      }
      if(rotina === 'ConsProd' && name === 'consulta') {
        setFormOutData({...formOutData, ...apiRet});
        setTimeout(() => {
          if(pagina < paginas) {
            setPagina(pagina+1);
          }
        },500)
        return;
      }
      if(rotina === 'TrfEnd' && name === 'produtos') {
        console.log({ picking })
        let newItems = [];
        if(apiRet.PALLET.trim() !== '' && apiRet.CODIGO.trim() !== '' && apiRet.PALLET.trim() !== apiRet.CODIGO.trim()) {
          Alert.alert("Atenção!","Esta etiqueta pertence ao pallet "+apiRet.PALLET+" e portanto não pode ser transferida individualmente.",[
            {
              text: 'Ok', onPress: () => { setScanned(false); return },
            }]
          );
          return;
        }
        apiRet.PRODUTOS.map((produto) => {
          return newItems.push({produto: produto.CODIGO, descricao: produto.DESCRICAO, codigo: produto.ETIQUETA});
        })
        setItems(newItems)
        const produtos = newItems.map((el) => {
          return el.codigo;
        })
        setValue(name, produtos.toString())
        return;
      }
      if(apiRet && multiplo && valor) {
        if(apiRet.PRODUTOS.length === 0) {
          Alert.alert("Atenção!","Produto não localizado!", [
            {
              text: 'Ok', onPress: () => {
                handleInput('');
                setScanned(false);
                setTimeout(() => {
                  inputRef.current?.blur();
                  inputRef.current?.focus();
                }, 200);
                return;
              }
            }
          ]);
          return;
        }
        const position = items.map((el) => el.codigo).indexOf(apiRet.CODIGO);
        if(rotina === 'MonPallet' || rotina === 'ManPallet'){
          if(name === 'produtos' && apiRet.PALLET.trim() !== '') {
            Alert.alert("Atenção!","Etiqueta "+apiRet.CODIGO+" já pertence ao pallet: "+apiRet.PALLET.trim()+".",[
              {
                text: 'Ok', onPress: () => {
                  handleInput('');
                  setTimeout(() => {
                    inputRef.current?.blur();
                    inputRef.current?.focus();
                  }, 200);
                  return
                },
              }]
            );
            return;
          }
        }
        if(position >= 0) {
          const newItems = [...items];
          newItems.splice(position, 1);
          
          Alert.alert("Atenção!","Etiqueta já bipada. Deseja removê-la da lista?",[
            {
              text: 'Cancelar', onPress: () => { setScanned(false); return },
            },
            {text: 'REMOVER', onPress: () => {
              setScanned(false);
              setItems(newItems);
              setReopen(false); //true para reabrir a tela
              const produtos = newItems.map((el) => {
                return el.codigo;
              })
              setValue(name, produtos.toString());
              setBarCodeValue(null);
              return;
            }},
          ]);
        } else {
          inputRef.current?.blur();
          setAdded(true);
          const newItems = [{produto: apiRet.PRODUTO, descricao: apiRet.PRODUTOS[0].DESCRICAO, codigo: apiRet.CODIGO}, ...items];
          setScanned(false); 
          setReopen(false); //true para reabrir a tela
          setTimeout(() => {
            inputRef.current?.focus();
          }, 2500);
          const produtos = newItems.map((el) => {
            return el.codigo;
          })
          setItems(newItems)
          setValue(name, produtos.toString())
          setBarCodeValue(null)
          return
        }
      }
      if(!multiplo && name && valor) {
        setScanned(false); 
        setValue(name, valor)
        setBarCodeValue(valor)
      }
    }

    async function handleCameraReader(valor = null, finaliza = false, apiRet = null, name = '') {
      if(apiRet && rotina === 'ManPallet' && name === 'pallet'){
        let newItems = [];
        apiRet.PRODUTOS.map((produto,index) => {
          return newItems.push({produto: produto.CODIGO, descricao: produto.DESCRICAO, codigo: produto.ETIQUETA});
        })
        setItems(newItems)
      }
      if(rotina === 'MonPallet'){
        if(name === 'pallet' && apiRet.PRODUTO.trim() !== 'PALLET VAZIO') {
          Alert.alert("Atenção!","Este pallet não está vazio.",[
            {
              text: 'Ok', onPress: () => { setScanned(false); return },
            }]
          );
          return;
        }
      }
      if(rotina === 'Inventario' && name === 'produtos') {
        if(valor) {
          setAdded(true);
        }
        const { data } = await api.get(`${empresa.apiUrl}/InventarioEndereco?Mestre=${formOutData.MestreInv}&Endereco=${formOutData.endereco}`);
        let newItems = [];
        data.PRODUTOS.map((produto,index) => {
          return newItems.push({produto: produto.PRODUTO, descricao: produto.DESCRICAO, codigo: produto.CODIGO});
        })
        setFormOutData({...formOutData, produtos: newItems})
        // setOpenCameraReader(true);
        return;
      }
      if(rotina === 'Inventario' && name === 'endereco') {
        console.log('Aqui')
        setOpenCameraReader(false);
        let newItems = [];
        console.log(apiRet.PRODUTOS)
        apiRet.PRODUTOS.map((produto,index) => {
          return newItems.push({produto: produto.PRODUTO, descricao: produto.DESCRICAO, codigo: produto.CODIGO});
        })
        setEnderecoFound(true)
        setTimeout(() => {
          setFormOutData({...formOutData, endereco: valor, produtos: newItems})
          if(pagina < paginas) {
            setEnderecoFound(false)
            setPagina(pagina+1);
          }
        },1500)
        return;
      }
      if(rotina === 'Enderecar' && name === 'produtos') {
        let newItems = [];
        apiRet.PRODUTOS.map((produto,index) => {
          return newItems.push({produto: produto.CODIGO, descricao: produto.DESCRICAO, codigo: produto.ETIQUETA});
        })
        setOpenCameraReader(false);
        setItems(newItems)
        const produtos = newItems.map((el) => {
          return el.codigo;
        })
        setValue(name, produtos.toString())
        return;
      }
      if(rotina === 'TrfEnd' && name === 'produtos') {
        let newItems = [];
        // let qtdPicking = formOutData.qtdPicking;
        setOpenCameraReader(false);
        if(picking) {
          setScanned(false);
          let goon = true
          apiRet.PRODUTOS.map(produto => {
            if(goon && (produto.ARMAZEM.trim() !== picking.ARMAZEM.trim() || produto.ENDERECO.trim() !== picking.ENDERECO.trim() || produto.CODIGO.trim() !== picking.PRODUTO.trim())) {
              goon = false
            // } else {
            //   qtdPicking += produto.QUANTIDADE
            }
          })
          if(!goon) {
            Alert.alert("Atenção!","Etiqueta não condiz com a solicitação de transferência. Verifique produto, armazém e endereço de origem.",[
              {
                text: 'Ok', onPress: () => { return },
              }]
            );
            return
          }
          // if(picking.QUANTIDADE < qtdPicking) {
          //   Alert.alert("Atenção!","Quantidade bipada: "+qtdPicking.toFixed(0)+" é superior à solicitação: "+picking.QUANTIDADE.toFixed(0)+".",[
          //     {
          //       text: 'Ok', onPress: () => { return },
          //     }]
          //   );
          //   return
          // }
          // setFormOutData({ ...formOutData, qtdPicking})
        }
        if(apiRet.PALLET.trim() !== '' && apiRet.CODIGO.trim() !== '' && apiRet.PALLET.trim() !== apiRet.CODIGO.trim()) {
          Alert.alert("Atenção!","Esta etiqueta pertence ao pallet "+apiRet.PALLET+" e portanto não pode ser transferida individualmente.",[
            {
              text: 'Ok', onPress: () => { setScanned(false); return },
            }]
          );
          setOpenCameraReader(false);
          return;
        }
        apiRet.PRODUTOS.map((produto,index) => {
          return newItems.push({produto: produto.CODIGO, descricao: produto.DESCRICAO, codigo: produto.ETIQUETA});
        })
        setOpenCameraReader(false);
        setItems(newItems)
        const produtos = newItems.map((el) => {
          return el.codigo;
        })
        setValue(name, produtos.toString())
        return;
      }
      if(apiRet && rotina === 'ConsEtiq' && name === 'consulta') {
        setOpenCameraReader(false);
        setFormOutData({...formOutData, ...apiRet});
        setTimeout(() => {
          if(pagina < paginas) {
            setPagina(pagina+1);
          }
        },500)
        return;
      }
      if(apiRet && multiplo && valor) {
        if(apiRet.PRODUTOS.length === 0) {
          setOpenCameraReader(!finaliza);
          Alert.alert("Atenção!","Produto não localizado!", [
            {
              text: 'Ok', onPress: () => {
                setScanned(false); return;
              }
            }
          ]);
          return;
        }
        const position = items.map((el) => el.codigo).indexOf(apiRet.CODIGO);
        if(rotina === 'MonPallet' || rotina === 'ManPallet'){
          if(name === 'produtos' && apiRet.PALLET.trim() !== '' && position > -1) {
            setOpenCameraReader(!finaliza);
            Alert.alert("Atenção!","Etiqueta "+apiRet.CODIGO+" já pertence ao pallet: "+apiRet.PALLET.trim()+".",[
              {
                text: 'Ok', onPress: () => { 
                  setScanned(false);
                  setReopen(true); //true para reabrir a tela
                  return
                },
              }]
            );
            return;
          }
        }
        if(position >= 0) {
          const newItems = [...items];
          newItems.splice(position, 1);
          
          Alert.alert("Atenção!","Etiqueta já bipada. Deseja removê-la da lista?",[
            {
              text: 'Cancelar', onPress: () => { setScanned(false); return },
            },
            {text: 'REMOVER', onPress: () => {
              setScanned(false);
              setItems(newItems);
              setReopen(false); //true para reabrir a tela
              const produtos = newItems.map((el) => {
                return el.codigo;
              })
              setValue(name, produtos.toString())
              setBarCodeValue(null)
              setOpenCameraReader(!finaliza);
              return;
            }},
          ]);
        } else {
          setOpenCameraReader(!finaliza);
          setAdded(true);
          const newItems = [{produto: apiRet.PRODUTO, descricao: apiRet.PRODUTOS[0].DESCRICAO, codigo: apiRet.CODIGO}, ...items];
          setScanned(false); 
          const produtos = newItems.map((el) => {
            return el.codigo;
          })
          setItems(newItems)
          setValue(name, produtos.toString())
          setBarCodeValue(null)
          setTimeout(() => {
            setReopen(multiplo ? true : false); //true para reabrir a tela
          }, 1500);
          return
        }
      }
      if(!multiplo && name && valor) {
        setScanned(false); 
        setValue(name, valor)
        setBarCodeValue(valor)
      }
      setOpenCameraReader(!finaliza);
    }
    
    async function handleRemoveItem(position) {
        if(position >= 0) {
          setItemLoading(position)
          if(rotina === 'Inventario') {
            try {              
              const newItems = [...items];
              newItems.splice(position, 1);
              setItems(newItems)
              setItemLoading(null)
              
              const { data } = await api.delete(`${empresa.apiUrl}/Inventario?Usuario=${usuario.usuario}&Inventario=${formOutData.MestreInv}&Endereco=${formOutData.endereco}&Etiqueta=${items[position].codigo}`)

              if(data.Status !== 200) {
                Alert.alert(data.Message, 'Não foi possível remover a etiqueta.', () => {
                  const newItems = [...items];
                  setItems(newItems)
                })
              }
              
            } catch(err) {
              console.log('Not', err)
              // setLoading(false)
              return
            }
          } else {
            const newItems = [...items];
            newItems.splice(position, 1);
            setItems(newItems)
            setItemLoading(null)
            const produtos = newItems.map((el) => {
              return el.codigo;
            })
            setValue(name, produtos.toString())
          }
        }
    }

    async function handleInput(value) {
      setBarCodeValue(value);
      if(rotina === 'Inventario' && name === 'endereco') {
        try {
          const response = await api.get(`${empresa.apiUrl}/InventarioEndereco?Mestre=${formOutData.MestreInv}&Endereco=${value.toUpperCase()}`);
          if(response.data.ENDERECO.trim() === value.toUpperCase()) {
            Keyboard.dismiss()
            handleBarCodeReader(value.toUpperCase(), value ? true : false, response.data, name);
            setScanned(true);
          } else {
            console.log('Not', value)
          }
        } catch(err) {
          console.log(err)

        }
      } else if(name.includes('endereco')) {
        setScanned(false); 
        setValue(name, value);
      } else if(rotina === 'Inventario' && name === 'produtos' && value.length === 10) {
        setLoading(true)
        try {
          const found = items.some(function(item) {
            return item.codigo === value
          })
          if(found) {
            Alert.alert("Atenção!","Etiqueta já lida no inventário.",[
              {
                text: 'Ok', onPress: () => {
                  setScanned(false); 
                  handleInput('');
                  setTimeout(() => {
                    setLoading(false)
                    inputRef.current?.focus();
                    inputRef.current?.focus();
                  }, 200);
                },
              }]
            );
            return
          }
          const response = await api.post(`${empresa.apiUrl}/${rotina}?Usuario=${usuario.usuario}`, {inventario: formOutData.MestreInv, endereco: formOutData.endereco, produto: value});
          if(response.data.Status === 200) {
            const response2 = await api.get(`${empresa.apiUrl}/Etiqueta?Etiqueta=${value}`)
            setLoading(false)
            if(response2.data) {
              Keyboard.dismiss()
              handleBarCodeReader(value, value ? true : false, response2.data, name);
              setScanned(true);
            }
          } else {
            setLoading(false)
            console.log('Not', response.data)
          }
        } catch(err) {
          setLoading(false)
          console.log(err)
        }
        setScanned(false); 
        setValue(name, value);
      } else if(name.includes('consulta')) {
        try {
          const response = await api.post(`${empresa.apiUrl}/${rotina}`, {consulta: value.toUpperCase()});
          if(response.data.CODIGO || response.data.PALLET || response.data.DESCRICAO) {
            Keyboard.dismiss()
            handleBarCodeReader(value, value ? true : false, response.data, name);
            setScanned(true);
          } else {
            console.log('Not', response.data)
          }
        } catch(err) {
          console.log(err)

        }
      } else if(name == 'pallet' && value.length === 10) {
        setLoading(true)
        const response = await api.get(`${empresa.apiUrl}/Etiqueta?Etiqueta=${value}`)
        setLoading(false)
        if(response.data) {
          Keyboard.dismiss()
          handleBarCodeReader(value, value ? true : false, response.data, name);
          setScanned(true);
        }
      } else if(name == 'ordemdeproducao' && value.length === 11) {
        setLoading(true)
        const response = await api.get(`${empresa.apiUrl}/OrdemProducao?OP=${value}`)
        setLoading(false)
        if(response.data) {
          Keyboard.dismiss()
          handleBarCodeReader(value, value ? true : false, response.data, name);
          setScanned(true);
        }
      } else if(name == 'produtos' && value.length === 10) {
        setLoading(true)
        const response = await api.get(`${empresa.apiUrl}/Etiqueta?Etiqueta=${value}`)
        setLoading(false)
        if(response.data) {
          Keyboard.dismiss()
          handleBarCodeReader(value, value ? true : false, response.data, name);
          setScanned(true);
        }
      }
    }

    const Item = ({item,index}) => {
      // console.log(index)
      return (
      <View key={index} style={{ flex: 1, opacity: itemLoading === index ? 0.2 : 1, width: '100%', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#ccc", display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity disabled={itemLoading === index} onPress={() => handleRemoveItem(index)} style={{ width: 42, height: 42, borderRadius: 16, backgroundColor: "#C00", flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons style={{ color: "#FFF" }} name="archive-remove" size={26} />
        </TouchableOpacity>
        <View style={{ paddingHorizontal: 16, flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{item.produto}</Text>
          <Text style={{ fontSize: 12 }}>Etiq.: {item.codigo}</Text>
          <Text style={{ fontSize: 12 }}>{item.descricao}</Text>
        </View>
      </View>
    )};

  return (
    <><KeyboardAvoidingView
    behavior='height' style={{ flex:1 }}>
        <Container error={error} style={{ borderRadius: 18, overflow: 'hidden', display: !visible || (linha > 1 && linha >= linhasDeProdutos) ? 'none' : 'flex' }}>
            <View style={{ width: '100%', backgroundColor: "#FFF", borderWidth: 1, borderColor: theme.colors.secondary, borderRadius: 18, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              
              <Controller
              control={control}
              name={name}
              render={({ field: { onChange, value }}) => (
                  <View style={{ flex: 1, paddingHorizontal: 16 }}>
                      <Text style={{ fontWeight: 'bold', marginTop: 12 }}>{titulo}</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <MyInput editable={loading? false : true}
                                onChangeText={handleInput}
                                placeholder="********"
                                value={barCodeValue}
                                {...register(name)}
                                ref={inputRef}
                                placeholderTextColor={theme.colors.secondary}
                                {...rest}
                                returnKeyType="search"
                                keyboardType={name === 'produtos' || name === 'produto' || name === 'pallet' || name === 'ordemdeproducao' ? 'number-pad' : 'default'}
                                style={{ width: 200 }} />
                            <MaterialCommunityIcons style={{ color: theme.colors.secondary}} name="barcode-scan" size={24} />
                      </View>
                      <View style={{ paddingHorizontal: 12, paddingVertical: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => handleCameraReader(null,false)} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', paddingVertical: 0 }}>
                            <Button simple leftIcon="camera" title="Abrir Câmera" />
                        </TouchableOpacity>
                      </View>
                  </View>
              )} />
              <View>
              </View>
            </View>
              { openCameraReader ?
              <Modal
              animationType="slide"
              transparent={true}
              visible={openCameraReader}
              onRequestClose={() => {
                  setOpenCameraReader(!openCameraReader);
              }}>
              <CameraReader handleCameraReader={handleCameraReader} scanned={scanned} setScanned={setScanned} setOpenCameraReader={setOpenCameraReader} setBarCodeValue={setBarCodeValue} barCodeValue={barCodeValue} control={control} register={register} setValue={setValue} name={name} rotina={rotina} formOutData={formOutData} setFormOutData={setFormOutData} items={items} />
          </Modal> : null }
        </Container>
      </KeyboardAvoidingView>
      { multiplo && visible ? 
      <View style={{ marginVertical: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: "#222", padding: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
          <Text style={{ color: "#FFF" }}>{rotina === 'Inventario' ? `Etiquetas no Endereço ${formOutData.endereco}:` : 'Produtos no Pallet:'}</Text>
          <Text style={{ backgroundColor: "#FFF", padding: 4, paddingHorizontal: 8, borderRadius: 8, fontWeight: 'bold', fontSize: 18, textAlign: 'right', alignSelf: 'flex-end' }}>{items.length}</Text>
        </View>
        {loading ? <View style={{ width: '100%',height: '100%',flex: 1, flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 48, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,.9)', position: 'absolute', zIndex: 10 }}><Loading title="Atualizando..." /></View> : null }
        <FlatList
          nestedScrollEnabled={true}
          data={items.slice(0,itemsToShow)}
          renderItem={({item,index}) => <Item item={item} index={index} />}
          keyExtractor={item => item.codigo}
        />
        { items.length > 25 && itemsToShow === 25 ?
        <TouchableOpacity 
            style={{ width: '100%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} 
            onPress={() => setItemsToShow(itemsToShow+25)}>
            <Button title="Ver mais 25 itens" leftIcon="eye-plus" simple />
        </TouchableOpacity>
        : items.length > 25 && itemsToShow > 25 ?
        <>
          <TouchableOpacity 
              style={{ width: '100%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} 
              onPress={() => setItemsToShow(itemsToShow+25)}>
              <Button title="Ver mais 25 itens" leftIcon="eye-plus" simple />
          </TouchableOpacity>
          <TouchableOpacity 
              style={{ width: '100%', marginVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} 
              onPress={() => setItemsToShow(25)}>
              <Button title="Reduzir visualização" leftIcon="eye-minus" simple />
          </TouchableOpacity>
        </>
        : null }
        
      </View>
      
      : null}
        <Modal
        animationType="fade"
        transparent={true}
        visible={added || palletFound || enderecoFound }>
          <Animated.View style={{ backgroundColor: theme.colors.success,
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            height: 100, paddingHorizontal: 12, marginTop:popUpAnim, borderRadius: 16, width: '80%', marginLeft: '10%' }}>
            <Text style={{ color: "#222", fontSize: 20, textAlign: 'center', paddingHorizontal: 12 }}>{added ? 'Produto adicionado!' : palletFound ? 'Pallet encontrado!' : enderecoFound ? 'Endereço encontrado!' : null }</Text>
            <MaterialCommunityIcons style={{ color: "#222"}} name={added ? 'check-decagram' : palletFound ? 'check-decagram' : null } size={48} />
          </Animated.View>
          <View style={{ flex: 1 }}></View>
        </Modal>
      </>
  );
}