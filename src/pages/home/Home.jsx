import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TbMoneybag, TbMeat, TbUsers, TbUserExclamation, /* TbChartBar */ } from "react-icons/tb";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { useData } from '../../DataContext'; 
import './home.css';

const CHART_DATA = {
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
  const { mijozlar, sotuvlar } = useData(); 
  const [period, setPeriod] = useState('month');
  
  const currentData = useMemo(() => CHART_DATA[period], [period]);

  // --- DINAMIK HISOBLASH TIZIMI ---
  const bugun = new Date().toLocaleDateString();

  // 1. Bugungi Sotuvlar (Summa va KG)
  const bugungiStatistika = useMemo(() => {
    const bugungiSotuvlar = sotuvlar.filter(s => 
      new Date(s.sana).toLocaleDateString() === bugun
    );
    return {
      tushum: bugungiSotuvlar.reduce((sum, s) => sum + s.summa, 0),
      hajm: bugungiSotuvlar.reduce((sum, s) => sum + Number(s.miqdor), 0)
    };
  }, [sotuvlar, bugun]);

  // 2. Mijozlar va Qarzlar
  const stats = useMemo(() => {
    const qarzdorlar = mijozlar.filter(m => Number(m.qarzdorlik) > 0);
    const jamiQarz = qarzdorlar.reduce((sum, m) => sum + Number(m.qarzdorlik), 0);
    const qarzsizlar = mijozlar.filter(m => Number(m.qarzdorlik) <= 0);

    return {
      jamiMijozlar: mijozlar.length,
      qarzdorlarSoni: qarzdorlar.length,
      jamiQarzSumma: jamiQarz,
      topQarzdorlar: [...qarzdorlar].sort((a, b) => b.qarzdorlik - a.qarzdorlik).slice(0, 5),
      qarzsizlar: qarzsizlar.slice(0, 5)
    };
  }, [mijozlar]);

  const handleCardClick = (path) => { navigate(path); };

  return (
    <div className={`home-page ${!open ? 'sidebar-h-closed' : ''}`}>
      <div className="main-wrapper">
        
        {/* TEPADAGI 5 TA KARD */}
        <div className="stats-container">
          
          {/* 1. Bugungi Sotuv */}
          <div className="stat-card clickable-card" onClick={() => handleCardClick('/kolbasamaxsulotlar')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box blue-bg"><TbMoneybag className="icon-svg" /></div>
                <span className="stat-label">Bugungi Sotuv</span>
              </div>
              <h2 className="stat-value">{bugungiStatistika.tushum.toLocaleString()}</h2>
            </div>
            <p className="stat-footer">Bugungi tushum hajmi</p>
          </div>

          {/* 2. Bugun Sotilgan (kg) */}
          <div className="stat-card clickable-card" onClick={() => handleCardClick('/kolbasamaxsulotlar')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box red-bg"><TbMeat className="icon-svg" /></div>
                <span className="stat-label">Bugun Sotilgan</span>
              </div>
              <h2 className="stat-value">{bugungiStatistika.hajm} <span className="unit">kg</span></h2>
            </div>
            <p className="stat-footer">Tayyor mahsulot chiqishi</p>
          </div>

          {/* 3. Jami Mijozlar */}
          <div className="stat-card clickable-card" onClick={() => handleCardClick('/mijozlar')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box purple-bg"><TbUsers className="icon-svg" /></div>
                <span className="stat-label">Jami Mijozlar</span>
              </div>
              <h2 className="stat-value">{stats.jamiMijozlar}</h2>
            </div>
            <p className="stat-footer">Bazada mavjud mijozlar</p>
          </div>

          {/* 4. Qarzdorlar soni */}
          <div className="stat-card clickable-card" onClick={() => handleCardClick('/mijozlar')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box orange-bg"><TbUserExclamation className="icon-svg" /></div>
                <span className="stat-label">Qarzdorlar soni</span>
              </div>
              <h2 className="stat-value" style={{color: 'var(--primary-color)'}}>{stats.qarzdorlarSoni} <span className="unit">ta</span></h2>
            </div>
            <p className="stat-footer">Hozirda qarzi borlar</p>
          </div>

          {/* 5. Umumiy Qarz Summasi */}
          <div className="stat-card clickable-card" onClick={() => handleCardClick('/mijozlar')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box orange-bg"><TbUserExclamation className="icon-svg" /></div>
                <span className="stat-label">Umumiy Qarz</span>
              </div>
              <h2 className="stat-value">{stats.jamiQarzSumma.toLocaleString()} <span className="unit">so'm</span></h2>
            </div>
            <p className="stat-footer">Kutilayotgan jami summa</p>
          </div>

        </div>

        {/* GRAFIK QISMI */}
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
              <AreaChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fill="#6366f133" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PASTKI LISTLAR */}
        <div className="stats-container">
            <div className="stat-card">
                <div className="stat-header">
                    <div className="icon-box blue-bg"><TbUsers className="icon-svg" /></div>
                    <span className="stat-label">Top mijozlar (Qarzsiz)</span>
                </div>
                <div className="list-content" style={{marginTop: '15px'}}>
                    {stats.qarzsizlar.map(customer => (
                        <div key={customer.id} className="list-row">
                            <span>{customer.ism}</span> 
                            <strong>{customer.totalXarid?.toLocaleString() || 0}</strong>
                        </div>
                    ))}
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-header">
                    <div className="icon-box orange-bg"><TbUserExclamation className="icon-svg" /></div>
                    <span className="stat-label">Eng ko'p qarzdorlar</span>
                </div>
                <div className="list-content" style={{marginTop: '15px'}}>
                    {stats.topQarzdorlar.map(debtor => (
                        <div key={debtor.id} className="list-row">
                            <span>{debtor.ism}</span> 
                            <strong style={{color: '#ef4444'}}>{debtor.qarzdorlik.toLocaleString()}</strong>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Home;