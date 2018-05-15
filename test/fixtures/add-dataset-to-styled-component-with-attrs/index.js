import styled from 'styled-components';

const Container1 = styled.div.attrs({ 'data-test': 'test' })``;

const Container2 = styled.div.withConfig({ prop: 'value' }).attrs({ 'data-test': 'test' })``;

const Container4 = styled('div').attrs({ 'data-test': 'test' })``;

const Container3 = styled(Container).attrs({ 'data-test': 'test' })``;
