import styled from 'styled-components/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import theme from '../../global/styles/theme';

export const Page = styled.View`
    flex: 1;
    height: 100%;
    background-color: ${theme.colors.background};
`;

export const Container = styled.View`
    align-items: center;
    justify-content: space-between;
    flex-direction: column;
`;

export const Main = styled.View`
    width: 100%;
    align-items: center;
    justify-content: center;
`;

export const BtnText = styled.Text`
    color: ${({ theme }) => theme.colors.secondary};
    font-size: 16px;
`;

