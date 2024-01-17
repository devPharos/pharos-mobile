import React from 'react';
import { FlatList, Text, View } from 'react-native';

import { Container } from './styles';
import ConsultaField from './ConsultaField';
import SaldosField from './SaldosField';

export default function Consulta({ setLoading, loading, setPagina, pagina, paginas, register, rotina, icon, error, items, setItems, visible, multiplo, name, iconColor, iconLibrary, titulo, control, setValue, setFormOutData, formOutData, ...rest }) {
    const linha = name.includes("_") ? parseInt(name.split("_")[1]) : 1;
    
    if(!formOutData) {
        return
    }

    return (
        <Container error={error} style={{ borderRadius: 18, overflow: 'hidden', display: !visible || (linha > 1 && linha >= linhasDeProdutos) ? 'none' : 'flex' }}>
            <View style={{ width: '100%', backgroundColor: "#FFF", borderRadius: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16 }}>
                { rotina === 'ConsProd' && formOutData.CODIGO ?
                <>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', width: '100%', fontSize: 24 }}>Produto: {formOutData.CODIGO}</Text>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'center', width: '100%' }}>{formOutData.DESCRICAO}</Text>
                    <SaldosField saldos={formOutData.SALDOS} saldosAEnderecar={formOutData.AENDERECAR} />
                </>
                : null }
                { rotina === 'ConsEtiq' && formOutData.CODIGO ?
                <>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', width: '100%', fontSize: 18 }}>Etiqueta: {formOutData.CODIGO}</Text>
                    <ConsultaField titulo="Produto" valor={formOutData.PRODUTO} />
                    <ConsultaField titulo="Descrição" valor={formOutData.PRODUTOS ? formOutData.PRODUTOS[0].DESCRICAO : null} />
                    <ConsultaField titulo="Quantidade" valor={formOutData.QTDE} />
                    <ConsultaField titulo="Endereço" valor={formOutData.ENDERECO} />
                    <ConsultaField titulo="Pallet" valor={formOutData.PALLET} />
                    <ConsultaField titulo="Armazém" valor={formOutData.ARMAZEM} />
                    <ConsultaField titulo="Data" valor={formOutData.DTNASC} />
                </>
                : rotina === 'ConsEtiq' && formOutData.PALLET ?
                <>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', width: '100%', fontSize: 18 }}>Palete: {formOutData.PALLET}</Text>
                    <ConsultaField titulo="Qtd. de Produtos" valor={formOutData.QTDE} />
                    <ConsultaField titulo="Qtd. de Caixas" valor={formOutData.PRODUTOS.length} />
                    <ConsultaField titulo="Endereço" valor={formOutData.ENDERECO} />
                    <View style={{ width: '100%', marginVertical: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: "#222", padding: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                            <Text style={{ color: "#FFF" }}>Produtos no Pallet:</Text>
                        </View>
                        { formOutData.PRODUTOS.map((produto,index) => {
                        return <View key={index} style={{ width: '100%', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#ccc", display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={{ paddingHorizontal: 16, flex: 1 }}>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{produto.CODIGO}</Text>
                                    <Text style={{ fontSize: 12 }}>Etiq.: {produto.ETIQUETA}</Text>
                                    <Text style={{ fontSize: 12 }}>{produto.DESCRICAO}</Text>
                                </View>
                            </View>
                        })}
                        
                    </View>
                
                </>
                : rotina === 'ConsEtiq' && formOutData.DESCRICAO ?
                <>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', width: '100%', fontSize: 18 }}>{formOutData.DESCRICAO}</Text>
                    <View style={{ width: '100%', marginVertical: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: "#222", padding: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                            <Text style={{ color: "#FFF" }}>Produtos no Endereço:</Text>
                        </View>
                        { rotina === 'ConsEtiq' && formOutData.PRODUTOS.map((produto,index) => {
                        return <View key={index} style={{ width: '100%', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#ccc", display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={{ paddingHorizontal: 16, flex: 1 }}>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{produto.PRODUTO}</Text>
                                    <Text style={{ fontSize: 12 }}>Qtde.: {produto.QUANTIDADE}</Text>
                                    <Text style={{ fontSize: 12 }}>Qtde. Caixas: {produto.QUANTIDADE / produto.QTDPOREMB}</Text>
                                    <Text style={{ fontSize: 12 }}>Qtde Emp.: {produto.EMPENHO}</Text>
                                </View>
                            </View>
                        })}
                        
                    </View>
                
                </>
                : null
                }
            </View>
        </Container>
    );
}