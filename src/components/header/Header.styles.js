import styled from 'styled-components';

export const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  right: 0;
  height: 70px;
  background-color: #ffffff;
  border-bottom: 1px solid #eef2f6;
  display: flex;
  align-items: center;
  z-index: 99;
  
  /* Sidebar holatiga qarab Headerning joylashuvi */
  width: ${props => (props.open ? 'calc(100% - 260px)' : 'calc(100% - 80px)')};
  margin-left: ${props => (props.open ? '260px' : '80px')};
  
  /* Sidebar bilan sinxron silliq harakatlanish */
  transition: all 0.3s ease-in-out;
  padding: 0 30px;
`;