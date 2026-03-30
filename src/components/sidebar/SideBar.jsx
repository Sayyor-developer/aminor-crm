import React from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css';
import logo from '../../assets/Aminorlogo.png';
import { IoHome } from "react-icons/io5";
import { FaBowlFood, FaMoneyBillTrendUp } from "react-icons/fa6";
import { MdPeopleAlt, MdMenuBook, MdOutlinePriceChange } from "react-icons/md";
import { GiChickenOven } from "react-icons/gi";
import { IoMdPerson } from "react-icons/io";
import { RiMenu2Fill } from "react-icons/ri";
import { SiInfracost } from "react-icons/si";


const SideBar = ({ open, setOpen, userPermissions = [], userRole = '' }) => {
  
  const canSee = (name) => {
    const normalizedRole = userRole?.toString().toLowerCase().trim();
    if (normalizedRole === 'direktor' || normalizedRole === 'director') {
      return true;
    }

    if (!userPermissions) return false;

    if (Array.isArray(userPermissions)) {
      return userPermissions.includes(name);
    }

    if (typeof userPermissions === 'object') {
      return userPermissions[name] === true || 
             userPermissions[name.toLowerCase()] === true || 
             userPermissions[name.replace(/\s+/g, '').toLowerCase()] === true;
    }

    return false;
  };

  return (
    <div className={`sidebar ${open ? 'open' : 'closed'}`} >
      <div className="logo-section">
        <img src={logo} alt="Logo" />
      </div>
      <div className="hr"></div>

      <ul className="sidebar-list">
        {canSee('Dashboard') && (
          <li>
            <NavLink to="/home" className={({ isActive }) => isActive ? "side active" : "side"}>
              <IoHome /> <span className="link-text">Dashboard</span>
            </NavLink>
          </li>
        )}

        {canSee('Kolbasa va Maxsulotlar') && (
          <li>
            <NavLink to="/kolbasamaxsulotlar" className={({ isActive }) => isActive ? "side active" : "side"}>
              <FaBowlFood /> <span className="link-text">Kolbasa va Maxsulotlar</span>
            </NavLink>
          </li>
        )}

        {canSee('Mijozlar Bazasi') && (
          <li>
            <NavLink to="/mijozlar" className={({ isActive }) => isActive ? "side active" : "side"}>
              <MdPeopleAlt /> <span className="link-text">Mijozlar ro'yxati</span>
            </NavLink>
          </li>
        )}

        {canSee('Masalliqlar') && (
          <li>
            <NavLink to="/masalliqlar" className={({ isActive }) => isActive ? "side active" : "side"}>
              <MdMenuBook /> <span className="link-text">Masalliqlar bo'limi</span>
            </NavLink>
          </li>
        )}

        {canSee('Tannarx hisoblash') && (
          <li>
            <NavLink to="/tannarxhisoblash" className={({ isActive }) => isActive ? "side active" : "side"}>
              <MdOutlinePriceChange /> <span className="link-text">Tannarx hisoblash</span>
            </NavLink>
          </li>
        )}


        {canSee('Tovuq Chiqimlari') && (
          <li>
            <NavLink to="/tovuqchiqim" className={({ isActive }) => isActive ? "side active" : "side"}>
              <GiChickenOven /> <span className="link-text">Tovuq mahsulotlari</span>
            </NavLink>
          </li>
        )}

        {canSee('Foydalanuvchilar') && (
          <li>
            <NavLink to="/foydalanuvchilar" className={({ isActive }) => isActive ? "side active" : "side"}>
              <MdPeopleAlt /> <span className="link-text">Foydalanuvchilar</span>
            </NavLink>
          </li>
        )}

        {canSee('Xarajatlar') && (
          <li>
            <NavLink to="/xarajatlar" className={({ isActive }) => isActive ? "side active" : "side"}>
             <SiInfracost /> <span className="link-text">Xarajatlar</span>
            </NavLink>
          </li>
        )}

        {canSee('Moliya') && (
          <li>
            <NavLink to="/moliya" className={({ isActive }) => isActive ? "side active" : "side"}>
              <FaMoneyBillTrendUp /> <span className="link-text">Moliya bo'limi</span>
            </NavLink>
          </li>
        )}
        {canSee('Direktor') && (
          <li>
            <NavLink to="/direktor" className={({ isActive }) => isActive ? "side active" : "side"}>
              <IoMdPerson /> <span className="link-text">Direktor</span>
            </NavLink>
          </li>
        )}
      </ul>

      <button className="sidebarBtn" onClick={() => setOpen(!open)}>
        <RiMenu2Fill />
      </button>
    </div>
  );
};

export default SideBar;