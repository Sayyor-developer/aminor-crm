import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../DataContext'; 
import './moliya.css';

const Moliya = ({ open }) => {
  // Barcha ma'lumotlarni Context-dan olamiz
  const { sotuvlar, jamiKirim, jamiChiqim, sofFoyda, loading } = useData();
  const [vaqtFiltr, setVaqtFiltr] = useState('1oy'); 

  // --- MOLIYA ANALITIKASI VA GRAFIK LOGIKASI ---
  const moliyaStatistika = useMemo(() => {
    const bugun = new Date();
    let filterDate = new Date();
    
    if (vaqtFiltr === '7kun') filterDate.setDate(bugun.getDate() - 7);
    else if (vaqtFiltr === '1oy') filterDate.setMonth(bugun.getMonth() - 1);
    else if (vaqtFiltr === '1yil') filterDate.setFullYear(bugun.getFullYear() - 1);

    // Sotuvlarni filtrlash
    const filteredSales = (sotuvlar || [])
      .filter(s => new Date(s.sana) >= filterDate && new Date(s.sana) <= bugun)
      .sort((a, b) => new Date(a.sana) - new Date(b.sana));

    const chartData = filteredSales.map((s, index) => ({
      fullKey: `${s.sana}-${index}`, 
      label: new Date(s.sana).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' }),
      sotuv: Number(s.tulangan || 0),
      mijoz: s.mijozIsm || "Noma'lum",
      soat: s.vaqt || "" 
    }));

    const finalData = chartData.length > 0 ? chartData : [{ label: 'Ma\'lumot yo\'q', sotuv: 0 }];

    return {
      rentabellik: jamiKirim > 0 ? ((sofFoyda / jamiKirim) * 100).toFixed(1) : 0,
      chartData: finalData,
      chartWidth: chartData.length > 6 ? `${chartData.length * 80}px` : '100%'
    };
  }, [sotuvlar, vaqtFiltr, jamiKirim, sofFoyda]);

  const formatMoney = (val) => Math.round(val || 0).toLocaleString('uz-UZ').replace(/,/g, ' ');

  const formatYAxis = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val;
  };

  if (loading) return <div className="loading-text">Yuklanmoqda...</div>;

  return (
    <div className={`moliya-wrapper ${open ? 'sidebar-moliya-open' : 'sidebar-moliya-closed'}`}>
      <div className="moliya-container">
        <header className="header-section">
          <h2 className="header-title">Moliya Analitikasi</h2>
          <p className="header-subtitle">Direktor boshqaruvi bilan sinxronlangan</p>
        </header>

        <section className="stats-grid">
          <div className="stat-card border-green">
            <div className="stat-card-top">
               <div className="icon-box bg-green-soft"><TrendingUp size={20}/></div>
               <span className="trend-val text-kirim">Tushum</span>
            </div>
            <div className="stat-label">Haqiqiy Kirim (Naqd)</div>
            <div className="stat-value">{formatMoney(jamiKirim)} <small>so'm</small></div>
          </div>

          <div className="stat-card border-red">
            <div className="stat-card-top">
               <div className="icon-box bg-red-soft"><TrendingDown size={20}/></div>
               <span className="trend-val text-chiqim">Xarajat</span>
            </div>
            <div className="stat-label">Jami Chiqimlar</div>
            <div className="stat-value">{formatMoney(jamiChiqim)} <small>so'm</small></div>
          </div>

          <div className="stat-card border-blue">
            <div className="stat-card-top">
               <div className="icon-box bg-blue-soft"><DollarSign size={20}/></div>
               <span className="trend-val bg-blue-soft">Net</span>
            </div>
            <div className="stat-label">Sof Foyda</div>
            <div className="stat-value" style={{ color: sofFoyda >= 0 ? '#10b981' : '#ef4444' }}>
              {formatMoney(sofFoyda)} <small>so'm</small>
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="white-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="card-title">Sotuv grafigi</h3>
              <select 
                value={vaqtFiltr} 
                onChange={(e) => setVaqtFiltr(e.target.value)}
                className="moliya-select"
              >
                <option value="1oy">1 oy</option>
                <option value="1yil">1 yil</option>
              </select>
            </div>

            <div className="chart-scroll-wrapper" style={{ width: '100%', overflowX: 'auto' }}>
              <div style={{ width: moliyaStatistika.chartWidth, minWidth: '100%', height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={moliyaStatistika.chartData}>
                    <defs>
                      <linearGradient id="colorSotuv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="fullKey" 
                      fontSize={10} 
                      tickFormatter={(val, i) => moliyaStatistika.chartData[i]?.label || ""}
                    />
                    <YAxis tickFormatter={formatYAxis} fontSize={10} />
                    <Tooltip 
                       content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="custom-tooltip" style={{ background: '#fff', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                              <p style={{ margin: 0, fontWeight: 'bold' }}>{d.label}</p>
                              <p style={{ margin: 0, color: '#3b82f6' }}>{formatMoney(d.sotuv)} so'm</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sotuv" 
                      stroke="#3b82f6" 
                      fill="url(#colorSotuv)" 
                      strokeWidth={3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="white-card">
            <h3 className="card-title">Moliyaviy Xulosa</h3>
            <div className="period-box" style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px' }}>
              <div className="data-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Kirim:</span> <b>{formatMoney(jamiKirim)} so'm</b>
              </div>
              <div className="data-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Chiqim:</span> <b style={{color: '#ef4444'}}>-{formatMoney(jamiChiqim)} so'm</b>
              </div>
              <hr />
              <div className="data-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: sofFoyda >= 0 ? '#10b981' : '#ef4444' }}>
                <span>SOF FOYDA:</span> <span>{formatMoney(sofFoyda)} so'm</span>
              </div>
              <div className="data-row" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <span style={{color: '#64748b'}}>Rentabellik:</span> <b>{moliyaStatistika.rentabellik}%</b>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Moliya;