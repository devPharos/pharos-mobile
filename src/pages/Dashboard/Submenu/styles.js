import styled from 'styled-components/native';
import { RFPercentage } from 'react-native-responsive-fontsize';

export const Page = styled.View`
    width: 100%;
    background: ${({ theme }) => theme.colors.background };
    align-items: center;
    justify-content: center;
    flex-direction: column;
`;