import React, { useState } from 'react';
import './sidebar.css';
import logo from '../../assets/Aminorlogo.png';
import { IoHome } from "react-icons/io5";
import { FaBowlFood } from "react-icons/fa6";
import { MdPeopleAlt, MdMenuBook, MdOutlinePriceChange } from "react-icons/md";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { GiChickenOven } from "react-icons/gi";
import { IoMdPerson } from "react-icons/io";
import { RiMenu2Fill } from "react-icons/ri";

const SideBar = () => {
  const [open, setOpen] = useState(true); // Ochiq holatdan boshlash tavsiya etiladi

  return (
    <div className={`sidebar ${open ? 'open' : 'closed'}`} >
      <div className="logo-section">
        <img src={logo} alt="Logo" />
      </div>
      <div className="hr"></div>

      <ul className="sidebar-list">
        <li className="side"><IoHome /><span className="link-text">Dashboard</span></li>
        <li className="side"><FaBowlFood /><span className="link-text">Kolbasa va Maxsulotlar</span></li>
        <li className="side"><MdPeopleAlt /><span className="link-text">Mijozlar Bazasi</span></li>
        <li className="side"><MdMenuBook /><span className="link-text">Masalliqlar</span></li>
        <li className="side"><MdOutlinePriceChange /><span className="link-text">Tannarx hisoblash</span></li>
        <li className="side"><FaMoneyBillTrendUp /><span className="link-text">Moliya</span></li>
        <li className="side"><GiChickenOven /><span className="link-text">Tovuq Chiqimlari</span></li>
        <li className="side"><MdPeopleAlt /><span className="link-text">Foydalanuvchilar</span></li>
        <li className="side"><IoMdPerson /><span className="link-text">User</span></li>
      </ul>

      <button className="sidebarBtn" onClick={() => setOpen(!open)}>
        <RiMenu2Fill />
      </button>
    </div>
  );
};

export default SideBar;
