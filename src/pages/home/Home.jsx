import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TbMoneybag, TbMeat, TbUsers, TbUserExclamation } from "react-icons/tb";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { useData } from '../../DataContext'; 
import './home.css';

const Home = ({ open }) => {
  const navigate = useNavigate();
  
  const { 
    mijozlar = [], 
    sotuvlar = [], 
    dinamika = [], 
    jamiQarzlar = 0, 
    jamiKirim = 0, 
    jamiTayyor = 0 
  } = useData(); 

  const [period, setPeriod] = useState('month');
  
  // --- DINAMIK GRAFIK MA'LUMOTI ---
  const currentData = useMemo(() => {
    if (!dinamika || dinamika.length === 0) {
      return [{ label: 'Ma\'lumot yo\'q', value: 0 }];
    }
    return [...dinamika].reverse().slice(-7).map((item, index) => ({
      label: item.sana ? item.sana.substring(5) : `Kun ${index + 1}`, 
      value: Number(item.tayyor || 0)
    }));
  }, [dinamika]);

  // --- BUGUNGI STATISTIKA (FOYDALANILDI) ---
  const bugungiStatistika = useMemo(() => {
    const bugun = new Date().toISOString().split('T')[0];
    const bugungiSotuvlar = (sotuvlar || []).filter(s => s && s.sana && s.sana.startsWith(bugun));
    
    return {
      tushum: bugungiSotuvlar.reduce((sum, s) => sum + Number(s.summa || 0), 0),
      hajm: bugungiSotuvlar.reduce((sum, s) => sum + Number(s.miqdor || 0), 0)
    };
  }, [sotuvlar]);

  // --- MIJOZLAR VA QARZLAR ---
  const stats = useMemo(() => {
    const qarzdorlar = (mijozlar || []).filter(m => Number(m.qarzdorlik || 0) > 0);
    const qarzsizlar = (mijozlar || []).filter(m => Number(m.qarzdorlik || 0) <= 0);

    return {
      jamiMijozlar: mijozlar.length,
      qarzdorlarSoni: qarzdorlar.length,
      jamiQarzSumma: jamiQarzlar, 
      topQarzdorlar: [...qarzdorlar].sort((a, b) => (b.qarzdorlik || 0) - (a.qarzdorlik || 0)).slice(0, 5),
      qarzsizlar: qarzsizlar.slice(0, 5)
    };
  }, [mijozlar, jamiQarzlar]);

  const handleCardClick = (path) => { navigate(path); };

  return (
    <div className={`home-page ${!open ? 'sidebar-h-closed' : ''}`}>
      <div className="main-wrapper">
        
        <div className="stats-container">
          {/* 1. Umumiy Kirim - Footerda bugungi tushum ko'rsatildi (Warningni yo'qotish uchun) */}
          <div className="stat-card clickable-card" onClick={() => handleCardClick('/kolbasamaxsulotlar')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box blue-bg"><TbMoneybag className="icon-svg" /></div>
                <span className="stat-label">Umumiy Kirim</span>
              </div>
              <h2 className="stat-value">{(jamiKirim || 0).toLocaleString()} <span className="unit">so'm</span></h2>
            </div>
            <p className="stat-footer">Bugun: {bugungiStatistika.tushum.toLocaleString()} so'm</p>
          </div>

          {/* 2. Ishlab chiqarish - Footerda bugungi hajm ko'rsatildi */}
          <div className="stat-card clickable-card" onClick={() => handleCardClick('/tovuqchiqim')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box red-bg"><TbMeat className="icon-svg" /></div>
                <span className="stat-label">Ishlab chiqarish</span>
              </div>
              <h2 className="stat-value">{(jamiTayyor || 0).toLocaleString()} <span className="unit">dona</span></h2>
            </div>
            <p className="stat-footer">Bugun: {bugungiStatistika.hajm.toLocaleString()} dona</p>
          </div>

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

          <div className="stat-card clickable-card" onClick={() => handleCardClick('/mijozlar')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box orange-bg"><TbUserExclamation className="icon-svg" /></div>
                <span className="stat-label">Qarzdorlar soni</span>
              </div>
              <h2 className="stat-value" style={{color: '#f97316'}}>{stats.qarzdorlarSoni} <span className="unit">ta</span></h2>
            </div>
            <p className="stat-footer">Hozirda qarzi borlar</p>
          </div>

          <div className="stat-card clickable-card" onClick={() => handleCardClick('/mijozlar')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box orange-bg"><TbUserExclamation className="icon-svg" /></div>
                <span className="stat-label">Umumiy Qarz</span>
              </div>
              <h2 className="stat-value">{(stats.jamiQarzSumma || 0).toLocaleString()} <span className="unit">so'm</span></h2>
            </div>
            <p className="stat-footer">Kutilayotgan jami summa</p>
          </div>
        </div>

        {/* GRAFIK QISMI */}
        <div className="chart-section">
          <div className="chart-header">
            <h3 className="section-title">Ishlab chiqarish dinamikasi</h3>
            <select className="period-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="month">Haqiqiy o'sish</option>
            </select>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
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
        <div className="lists-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
            <div className="stat-card">
                <div className="stat-header">
                    <div className="icon-box blue-bg"><TbUsers className="icon-svg" /></div>
                    <span className="stat-label">Mijozlar (Qarzsiz)</span>
                </div>
                <div className="list-content">
                    {stats.qarzsizlar.length > 0 ? stats.qarzsizlar.map((customer, idx) => (
                        <div key={customer.id || `q-sz-${idx}`} className="list-row">
                            <span>{customer.ism || 'Nomsiz mijoz'}</span> 
                            <strong>Active</strong>
                        </div>
                    )) : <p className="unit" style={{textAlign: 'center', padding: '10px'}}>Mijozlar yo'q</p>}
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-header">
                    <div className="icon-box orange-bg"><TbUserExclamation className="icon-svg" /></div>
                    <span className="stat-label">Eng ko'p qarzdorlar</span>
                </div>
                <div className="list-content">
                    {stats.topQarzdorlar.length > 0 ? stats.topQarzdorlar.map((debtor, idx) => (
                        <div key={debtor.id || `q-li-${idx}`} className="list-row">
                            <span>{debtor.ism || 'Nomsiz'}</span> 
                            <strong style={{color: '#ef4444'}}>{Number(debtor.qarzdorlik || 0).toLocaleString()}</strong>
                        </div>
                    )) : <p className="unit" style={{textAlign: 'center', padding: '10px'}}>Qarzdorlar yo'q</p>}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Home;