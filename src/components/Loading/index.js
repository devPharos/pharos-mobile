import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import theme from '../../global/styles/theme';
import { useRegister } from '../../hooks/register';

// import { Container } from './styles';

const Loading = ({ title }) => {
  const { empresa } = useRegister()
  return (
    <View>
      <ActivityIndicator size="small" color={empresa.primary_color || theme.colors.primary} />
      {title ? <Text>{ title }</Text> : null }
    </View>
  )
}

export default Loading;