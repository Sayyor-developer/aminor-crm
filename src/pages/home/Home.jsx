import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TbMoneybag, TbMeat, TbUsers, TbUserExclamation } from "react-icons/tb";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import './home.css';

const MOCK_DATA = {
  month: [
    { label: '01 Fev', value: 45 }, { label: '10 Fev', value: 48 },
    { label: '20 Fev', value: 65 }, { label: '28 Fev', value: 85 },
  ],
  year: [
    { label: 'Yan', value: 1200 }, { label: 'Mar', value: 1100 },
    { label: 'May', value: 2100 }, { label: 'Iyul', value: 1700 },
  ]
};

const Home = ({ open }) => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const currentData = useMemo(() => MOCK_DATA[period], [period]);

  return (
    <div className={`home-page ${!open ? 'sidebar-h-closed' : ''}`}>
      <div className="main-wrapper">
        
        <div className="stats-container">
          
          {/* 1. Bugungi Sotuv -> Kolbasa mahsulotlariga */}
          <div className="stat-card clickable-card" onClick={() => navigate('/kolbasamaxsulotlar')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box blue-bg"><TbMoneybag className="icon-svg" /></div>
                <span className="stat-label">Bugungi Sotuv</span>
              </div>
              <h2 className="stat-value">5,300,000</h2>
            </div>
            <p className="stat-footer">Bugungi tushum hajmi</p>
          </div>

          {/* 2. Bugun Sotilgan -> Kolbasa mahsulotlariga */}
          <div className="stat-card clickable-card" onClick={() => navigate('/kolbasamaxsulotlar')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box red-bg"><TbMeat className="icon-svg" /></div>
                <span className="stat-label">Bugun Sotilgan</span>
              </div>
              <h2 className="stat-value">210 <span className="unit">kg</span></h2>
            </div>
            <p className="stat-footer">Tayyor mahsulot chiqishi</p>
          </div>

          {/* 3. Jami Mijozlar -> Mijozlar sahifasiga */}
          <div className="stat-card clickable-card" onClick={() => navigate('/mijozlar')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box purple-bg"><TbUsers className="icon-svg" /></div>
                <span className="stat-label">Jami Mijozlar</span>
              </div>
              <h2 className="stat-value">128</h2>
            </div>
            <p className="stat-footer">Bazada mavjud mijozlar</p>
          </div>

          {/* 4. Qarzdorlar soni -> Mijozlar sahifasiga */}
          <div className="stat-card clickable-card" onClick={() => navigate('/mijozlar')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box orange-bg"><TbUserExclamation className="icon-svg" /></div>
                <span className="stat-label">Qarzdorlar soni</span>
              </div>
              <h2 className="stat-value">15 <span className="unit">ta</span></h2>
            </div>
            <p className="stat-footer">Hozirda qarzi borlar</p>
          </div>

          {/* 5. Umumiy Qarz -> Mijozlar sahifasiga */}
          <div className="stat-card clickable-card" onClick={() => navigate('/mijozlar')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box orange-bg"><TbUserExclamation className="icon-svg" /></div>
                <span className="stat-label">Umumiy Qarz</span>
              </div>
              <h2 className="stat-value">13,400,000 <span className="unit">so'm</span></h2>
            </div>
            <p className="stat-footer">Kutilayotgan jami summa</p>
          </div>

        </div>

        {/* Grafik qismi */}
        <div className="chart-section">
          <div className="chart-header">
            <h3 className="section-title">Ishlab chiqarish dinamikasi</h3>
            <select className="period-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="month">Oylik hisobot</option>
              <option value="year">Yillik hisobot</option>
            </select>
          </div>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fill="url(#colorProd)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;