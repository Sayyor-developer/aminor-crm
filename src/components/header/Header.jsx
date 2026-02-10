import React from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { HeaderContainer } from './Header.styles';
import './header.css';

const Header = ({ open, title }) => {
  // navigate o'chirildi, chunki window.location ishlatyapmiz
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    window.location.replace('/login');
  };

  return (
    <HeaderContainer open={open}>
      <div className="header-wrapper">
        <h2 className="page-title">Dashboard - {title}</h2>
        
        <div className="account-section" onClick={handleLogout}>
          <div className="user-info">
            <AccountCircleIcon className="user-icon" />
            <span className="user-name">Account</span>
          </div>
          <LogoutIcon className="logout-icon" />
        </div>
      </div>
    </HeaderContainer>
  );
};

export default Header;