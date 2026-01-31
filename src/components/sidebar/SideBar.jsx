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

const SideBar = ({ open, setOpen }) => {
  return (
    <div className={`sidebar ${open ? 'open' : 'closed'}`} >
      <div className="logo-section">
        <img src={logo} alt="Logo" />
      </div>
      <div className="hr"></div>

      <ul className="sidebar-list">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? "side active" : "side"}>
            <IoHome /> <span className="link-text">Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/kolbasamaxsulotlar" className={({ isActive }) => isActive ? "side active" : "side"}>
            <FaBowlFood /> <span className="link-text">Kolbasa va Maxsulotlar</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/mijozlar" className={({ isActive }) => isActive ? "side active" : "side"}>
            <MdPeopleAlt /> <span className="link-text">Mijozlar Bazasi</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/tannarxhisoblash" className={({ isActive }) => isActive ? "side active" : "side"}>
            <MdOutlinePriceChange /> <span className="link-text">Tannarx hisoblash</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/moliya" className={({ isActive }) => isActive ? "side active" : "side"}>
            <FaMoneyBillTrendUp /> <span className="link-text">Moliya</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/tovuqchiqim" className={({ isActive }) => isActive ? "side active" : "side"}>
            <GiChickenOven /> <span className="link-text">Tovuq Chiqimlari</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/foydalanuvchilar" className={({ isActive }) => isActive ? "side active" : "side"}>
            <MdPeopleAlt /> <span className="link-text">Foydalanuvchilar</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/user" className={({ isActive }) => isActive ? "side active" : "side"}>
            <IoMdPerson /> <span className="link-text">User</span>
          </NavLink>
        </li>
      </ul>

      <button className="sidebarBtn" onClick={() => setOpen(!open)}>
        <RiMenu2Fill />
      </button>
    </div>
  );
};

export default SideBar;