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
    products = [],
    jamiQarzlar = 0, 
    kolbasaJamiSoni = 0,
    kolbasaJamiNarx = 0 
  } = useData(); 

  const [period, setPeriod] = useState('week');
  
  const { chartData, chartWidth } = useMemo(() => {
    const now = new Date();
    let filterDate = new Date();

    if (period === 'week') filterDate.setDate(now.getDate() - 7);
    else if (period === 'month') filterDate.setMonth(now.getMonth() - 1);
    else if (period === 'year') filterDate.setFullYear(now.getFullYear() - 1);

    const combinedTransactions = [
      ...sotuvlar.map(s => ({ 
        sana: new Date(s.sana), // VAQTNI TO'G'RI HISOB-KITOB QILISH UCHUN
        summa: Number(s.summa || 0), 
        tur: 'Sotuv',
        color: 'var1'
      })),
      ...products.map(p => ({ 
        sana: new Date(p.date), 
        summa: Number(p.price || 0) * Number(p.stock || 0), 
        tur: 'Maxsulot Kirimi',
        color: '#10b981'
      }))
    ];

    const sortedData = combinedTransactions
      .filter(item => item.sana && item.sana >= filterDate)
      .sort((a, b) => a.sana - b.sana) // SOAT VA MINUTNI KETMA-KETLIKKA SOLADI
      .map((item, index) => ({
        index,
        label: item.sana.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' }) + " " + 
               item.sana.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        value: item.summa,
        tur: item.tur
      }));

    const dynamicWidth = Math.max(100, sortedData.length * 120);
    
    return {
      chartData: sortedData, 
      chartWidth: sortedData.length > 6 ? `${dynamicWidth}px` : '100%'
    };
  }, [sotuvlar, products, period]);

  const bugungiStatistika = useMemo(() => {
    const bugunStr = new Date().toISOString().split('T')[0];
    const bugunSales = (sotuvlar || []).filter(s => s?.sana?.startsWith(bugunStr));
    
    return {
      tushum: bugunSales.reduce((sum, s) => sum + Number(s.summa || 0), 0),
      hajm: bugunSales.reduce((sum, s) => sum + Number(s.miqdor || 0), 0)
    };
  }, [sotuvlar]);

  const stats = useMemo(() => {
    const qarzdorlar = (mijozlar || []).filter(m => Number(m.qarzdorlik || 0) > 0);
    
    const salesMap = {};
    sotuvlar.forEach(s => {
      salesMap[s.mijozId] = (salesMap[s.mijozId] || 0) + Number(s.summa || 0);
    });

    const topMijozlar = (mijozlar || [])
      .map(m => ({ ...m, jamiXarid: salesMap[m.id] || 0 }))
      .sort((a, b) => b.jamiXarid - a.jamiXarid)
      .slice(0, 5);

    return {
      jamiMijozlar: mijozlar.length,
      qarzdorlarSoni: qarzdorlar.length,
      jamiQarzSumma: jamiQarzlar, 
      topQarzdorlar: [...qarzdorlar].sort((a, b) => Number(b.qarzdorlik || 0) - Number(a.qarzdorlik || 0)).slice(0, 5),
      topMijozlar: topMijozlar
    };
  }, [mijozlar, jamiQarzlar, sotuvlar]);

  const formatYAxis = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val;
  };

  return (
    <div className={`home-page ${!open ? 'sidebar-h-closed' : ''}`}>
      <div className="main-wrapper">
        
        <div className="stats-container">
          <div className="stat-card clickable-card" onClick={() => navigate('/kolbasamaxsulotlar')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box blue-bg"><TbMoneybag className="icon-svg" /></div>
                <span className="stat-label">Bugungi sotuv</span>
              </div>
              <h2 className="stat-value">{(kolbasaJamiNarx || 0).toLocaleString()} <span className="unit">so'm</span></h2>
            </div>
            <p className="stat-footer">Bugun: {bugungiStatistika.tushum.toLocaleString()} so'm</p>
          </div>

          <div className="stat-card clickable-card" onClick={() => navigate('/kolbasamaxsulotlar')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box red-bg"><TbMeat className="icon-svg" /></div>
                <span className="stat-label">Mahsulotlar Soni</span>
              </div>
              <h2 className="stat-value">{(kolbasaJamiSoni || 0).toLocaleString()} <span className="unit">kg</span></h2>
            </div>
            <p className="stat-footer">Bugun: {bugungiStatistika.hajm.toLocaleString()} dona</p>
          </div>

          <div className="stat-card clickable-card" onClick={() => navigate('/mijozlar')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box purple-bg"><TbUsers className="icon-svg" /></div>
                <span className="stat-label">Jami Mijozlar</span>
              </div>
              <h2 className="stat-value">{stats.jamiMijozlar}</h2>
            </div>
          </div>

          <div className="stat-card clickable-card" onClick={() => navigate('/mijozlar')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box orange-bg"><TbUserExclamation className="icon-svg" /></div>
                <span className="stat-label">Qarzdorlar soni</span>
              </div>
              <h2 className="stat-value" style={{color: 'black'}}>{stats.qarzdorlarSoni} <span className="unit">ta</span></h2>
            </div>
          </div>

          <div className="stat-card clickable-card" onClick={() => navigate('/mijozlar')}>
            <div className="stat-info">
              <div className="stat-header">
                <div className="icon-box orange-bg"><TbUserExclamation className="icon-svg" /></div>
                <span className="stat-label">Umumiy Qarz</span>
              </div>
              <h2 className="stat-value">{(stats.jamiQarzSumma || 0).toLocaleString()} <span className="unit">so'm</span></h2>
            </div>
          </div>
        </div>

        <div className="chart-section" style={{ background: '#fff', padding: '20px', borderRadius: '15px', marginTop: '25px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 className="section-title">Savdo va Ombor Harakati Grafigi (↔️ suring)</h3>
            <select className="period-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="week">1 Hafta</option>
              <option value="month">1 Oy</option>
              <option value="year">1 Yil</option>
            </select>
          </div>
          
          <div className="chart-scroll-holder" style={{ width: '100%', overflowX: 'auto', paddingBottom: '10px' }}>
            {chartData.length > 0 ? (
              <div style={{ width: chartWidth, minWidth: '100%', height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="label" 
                      interval={0} 
                      angle={-35} 
                      textAnchor="end" 
                      height={70}
                      tick={{fill: '#94a3b8', fontSize: 10}} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 11}} 
                      width={55}
                      tickFormatter={formatYAxis} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      formatter={(val, name, props) => [val.toLocaleString() + " so'm", props.payload.tur]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--primary-color)" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                      dot={{ r: 5, fill: 'var(--primary-color)', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8 }}
                      animationDuration={1200}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8'}}>
                Ma'lumotlar mavjud emas
              </div>
            )}
          </div>
        </div>

        <div className="lists-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px'}}>
          <div className="stat-card">
            <div className="stat-header"><div className="icon-box blue-bg"><TbUsers className="icon-svg" /></div><span className="stat-label">Top mijozlar (Eng ko'p xarid)</span></div>
            <div className="list-content">
              {stats.topMijozlar.map((customer, idx) => (
                <div key={customer.id || idx} className="list-row">
                  <span>{customer.ism}</span>
                  <strong style={{color: '#10b981'}}>{Number(customer.jamiXarid).toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-header"><div className="icon-box orange-bg"><TbUserExclamation className="icon-svg" /></div><span className="stat-label">Eng ko'p qarzdorlar</span></div>
            <div className="list-content">
              {stats.topQarzdorlar.map((debtor, idx) => (
                <div key={debtor.id || idx} className="list-row"><span>{debtor.ism}</span><strong style={{color: '#ef4444'}}>{Number(debtor.qarzdorlik).toLocaleString()}</strong></div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;