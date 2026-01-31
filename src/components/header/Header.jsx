import React from 'react'
import './header.css'
import { HeaderContainer } from './Header.styles'

const Header = ({ open }) => {
  return (
    <HeaderContainer>
      {/* Sidebar holatiga qarab 'sidebar-closed' klassini qo'shamiz */}
      <header className={`header-wrapper ${!open ? 'sidebar-closed' : ''}`}> 
        <div className="container max-width"> 
          <h1 className="header-title"><b>Aminor CRM</b> Dashboard</h1>
          <div className="hr"></div>
        </div>
      </header>
    </HeaderContainer>
  )
}

export default Header