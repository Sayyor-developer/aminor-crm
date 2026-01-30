import React from 'react'
import './header.css'
// import'./Header.styles'
import { HeaderContainer } from './Header.styles'
const Header = () => {
  return (
    <HeaderContainer>

      <header className="header-wrapper"> 
  {/* Bu qism foni (background) uchun, 100% kenglikda */}
  
  <div className="container max-width"> 
    {/* Bu qism max-width va margin: 0 auto uchun */}
    <h1 className="header-title"><b>Aminor CRM</b> Dashboard</h1>
    <div className="hr"></div>

  </div>

</header>

     
    </HeaderContainer>
  )
}

export default Header
