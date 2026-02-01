import React from 'react';
import { TbMoneybag, TbMeat, TbUsers, TbUserExclamation } from "react-icons/tb";
import './home.css';



const Home = ({ open }) => {
  return (
    /* Sidebar holatiga qarab klass o'zgaradi */
    <div className={`home-page ${!open ? 'sidebar-closed' : ''}`}>
      <div className="main-wrapper">
        
        {/* Statistika kartochkalari konteyneri */}
        <div className="stats-container">
          
          {/* 1. Bugungi Sotuv */}
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box blue-bg">
                  <TbMoneybag className="icon-svg" />
                </div>
                <span className="stat-label">Bugungi Sotuv</span>
              </div>
              <h2 className="stat-value">5,300,000</h2>
            </div>
            <p className="stat-footer">Bugungi Sotuv hajmi</p>
          </div>

          {/* 2. Bugun Sotilgan */}
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box red-bg">
                  <TbMeat className="icon-svg" />
                </div>
                <span className="stat-label">Bugun Sotilgan</span>
              </div>
              <h2 className="stat-value">210 <span className="unit">kg</span></h2>
            </div>
            <p className="stat-footer">Bugun Sotilgan Kolbasa</p>
          </div>

          {/* 3. Jami Mijozlar */}
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box purple-bg">
                  <TbUsers className="icon-svg" />
                </div>
                <span className="stat-label">Jami Mijozlar</span>
              </div>
              <h2 className="stat-value">128</h2>
            </div>
            <p className="stat-footer">Faol mijozlar soni</p>
          </div>

          {/* 4. Qarzdor Mijozlar */}
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box orange-bg">
                  <TbUserExclamation className="icon-svg" />
                </div>
                <span className="stat-label">Qarzdor Mijozlar</span>
              </div>
              <h2 className="stat-value">13,400,000 <span className="unit">so'm</span></h2>
            </div>
            <p className="stat-footer">Umumiy kutilayotgan qarz</p>
          </div>

        </div>

        {/* Bu yerda Grafik va Ro'yxatlar davom etishi mumkin */}
      </div>
    </div>
  );
};

export default Home;