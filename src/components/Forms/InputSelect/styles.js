import styled from 'styled-components/native';
import { TextInput } from 'react-native';

export const Container = styled.View`
    background: #fff;
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin: 12px 0;
`;

export const MyInput = styled(TextInput)`
    flex: 1;
    color: #222;
    height: 48px;
    line-height: 48px;
`;