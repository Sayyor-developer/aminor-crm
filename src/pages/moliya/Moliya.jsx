import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../DataContext'; 
import './moliya.css';

const Moliya = ({ open }) => {
  const { sotuvlar, jamiKirim, jamiChiqim, sofFoyda } = useData();
  const [vaqtFiltr, setVaqtFiltr] = useState('1oy'); 

  // --- MOLIYA ANALITIKASI VA GRAFIK LOGIKASI ---
  const moliyaStatistika = useMemo(() => {
    const bugun = new Date();
    let filterDate = new Date();
    
    // Vaqt boyicha filtrni aniqlash
    if (vaqtFiltr === '7kun') filterDate.setDate(bugun.getDate() - 7);
    else if (vaqtFiltr === '1oy') filterDate.setMonth(bugun.getMonth() - 1);
    else if (vaqtFiltr === '1yil') filterDate.setFullYear(bugun.getFullYear() - 1);

    // Sotuvlarni filtrlash va vaqt boyicha tartiblash
    const filteredSales = (sotuvlar || [])
      .filter(s => new Date(s.sana) >= filterDate && new Date(s.sana) <= bugun)
      .sort((a, b) => new Date(a.sana) - new Date(b.sana));

    // HAR BIR SOTUVNI ALOHIDA NUQTA QILIB TAYYORLASH
    const chartData = filteredSales.map((s, index) => {
      const sanaObj = new Date(s.sana);
      const kunLabel = sanaObj.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' });
      
      return {
        // Har bir nuqta uchun unikal kalit (index bilan)
        fullKey: `${s.sana}-${index}`, 
        label: kunLabel,
        sotuv: Number(s.tulangan || 0),
        mijoz: s.mijozIsm || "Noma'lum",
        soat: s.vaqt || "" // Agar ma'lumotlar bazasida vaqt bo'lsa
      };
    });

    // Ma'lumot kam bo'lganda bo'sh chiqmasligi uchun
    const finalData = chartData.length > 0 ? chartData : [{ label: 'Ma\'lumot yo\'q', sotuv: 0 }];

    return {
      rentabellik: jamiKirim > 0 ? ((sofFoyda / jamiKirim) * 100).toFixed(1) : 0,
      chartData: finalData,
      // Har bir nuqtaga 80px joy ajratamiz, shunda scroll ishlaydi
      chartWidth: chartData.length > 6 ? `${chartData.length * 80}px` : '100%'
    };
  }, [sotuvlar, vaqtFiltr, jamiKirim, sofFoyda]);

  // Pullarni chiroyli formatlash uchun funksiya
  const formatMoney = (val) => Math.round(val || 0).toLocaleString('uz-UZ').replace(/,/g, ' ');

  // Y-o'qi uchun qisqartma (100k, 1M kabi)
  const formatYAxis = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val;
  };

  return (
    <div className={`moliya-wrapper ${open ? 'sidebar-moliya-open' : 'sidebar-moliya-closed'}`}>
      <div className="moliya-container">
        
        {/* Yuqori Sarlavha */}
        <header className="header-section">
          <h2 className="header-title">Moliya Analitikasi</h2>
          <p className="header-subtitle">Haqiqiy pul oqimi va xarajatlar asosida</p>
        </header>

        {/* Statistik Kartochkalar */}
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
            <div className="stat-label">Jami Chiqimlar (Masalliq + Tovuq)</div>
            <div className="stat-value">{formatMoney(jamiChiqim)} <small>so'm</small></div>
          </div>

          <div className="stat-card border-blue">
            <div className="stat-card-top">
               <div className="icon-box bg-blue-soft"><DollarSign size={20}/></div>
               <span className="trend-val bg-blue-soft">Net</span>
            </div>
            <div className="stat-label">Haqiqiy Sof Foyda</div>
            <div className="stat-value" style={{ color: sofFoyda >= 0 ? '#10b981' : '#ef4444' }}>
              {formatMoney(sofFoyda)} <small>so'm</small>
            </div>
          </div>
        </section>

        {/* Grafik va Xulosa qismi */}
        <section className="content-grid">
          <div className="white-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Tushum Dinamikasi (Har bir sotuv)</h3>
              <select 
                value={vaqtFiltr} 
                onChange={(e) => setVaqtFiltr(e.target.value)}
                className="moliya-select"
              >
                
                <option value="1oy">1 oy</option>
                <option value="1yil">1 yil</option>
              </select>
            </div>

            {/* Scroll bo'lishi uchun wrapper */}
            <div className="chart-scroll-wrapper" style={{ width: '100%', overflowX: 'auto', paddingBottom: '15px' }}>
              <div style={{ width: moliyaStatistika.chartWidth, minWidth: '100%', height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={moliyaStatistika.chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSotuv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="fullKey" 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      angle={-35} 
                      textAnchor="end" 
                      height={60}
                      interval={0}
                      tickFormatter={(val, i) => moliyaStatistika.chartData[i]?.label || ""}
                    />
                    <YAxis 
                      tickFormatter={formatYAxis}
                      fontSize={10}
                      stroke="#94a3b8"
                    />
                    {/* CUSTOM TOOLTIP: Har bir nuqtaga borganda alohida ma'lumot chiqaradi */}
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }}>
                              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px' }}>{data.label} {data.soat}</p>
                              <p style={{ margin: '5px 0 0', color: 'var(--primary-color)', fontWeight: '600' }}>Tushum: {formatMoney(data.sotuv)} so'm</p>
                              <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Mijoz: {data.mijoz}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sotuv" 
                      stroke="var(--primary-color)" 
                      fill="url(#colorSotuv)" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: "var(--primary-color)", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="white-card">
            <h3 className="card-title">Moliyaviy Xulosa</h3>
            <div className="period-box" style={{ borderRadius: '12px', padding: '15px', background: '#f8fafc' }}>
              <div className="data-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{color: '#64748b'}}>Haqiqiy Tushum:</span> 
                <span style={{ fontWeight: '600' }}>{formatMoney(jamiKirim)} so'm</span>
              </div>
              <div className="data-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{color: '#64748b'}}>Jami Xarajatlar:</span> 
                <span style={{ fontWeight: '600', color: '#ef4444' }}>-{formatMoney(jamiChiqim)} so'm</span>
              </div>
              <hr style={{ border: '0.5px solid #e2e8f0', margin: '15px 0' }} />
              <div className="data-row" style={{ display: 'flex', justifyContent: 'space-between', color: sofFoyda >= 0 ? '#10b981' : '#ef4444', fontSize: '18px', fontWeight: 'bold' }}>
                <span>SOF FOYDA:</span> 
                <span>{formatMoney(sofFoyda)} so'm</span>
              </div>
              <div className="data-row" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '14px' }}>
                <span style={{color: '#64748b'}}>Rentabellik:</span> 
                <span style={{ fontWeight: '600' }}>{moliyaStatistika.rentabellik}%</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Moliya;