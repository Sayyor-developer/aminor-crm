import React from 'react'
import './header.css'
import { HeaderContainer } from './Header.styles'

const Header = ({ open, title }) => {
  return (
    <HeaderContainer open={open}>
      <div className="header-wrapper">
        <h2 className="page-title">Dashboard - {title}</h2>
      </div>
    </HeaderContainer>
  )
}

export default Header