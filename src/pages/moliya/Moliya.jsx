import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../DataContext'; 
import './moliya.css';

const Moliya = ({ open }) => {
  // Context-dan barcha hisob-kitoblarni va funksiyalarni olamiz
  const { sotuvlar, jamiKirim, jamiChiqim, sofFoyda, loading } = useData();
  const [vaqtFiltr, setVaqtFiltr] = useState('1oy'); 

  // --- MOLIYA ANALITIKASI VA GRAFIK LOGIKASI ---
  const moliyaStatistika = useMemo(() => {
    const bugun = new Date();
    bugun.setHours(23, 59, 59, 999); // Kun oxirigacha
    
    let filterDate = new Date();
    if (vaqtFiltr === '7kun') filterDate.setDate(bugun.getDate() - 7);
    else if (vaqtFiltr === '1oy') filterDate.setMonth(bugun.getMonth() - 1);
    else if (vaqtFiltr === '1yil') filterDate.setFullYear(bugun.getFullYear() - 1);
    filterDate.setHours(0, 0, 0, 0); // Kun boshidan

    // Sotuvlarni filtrlash va tartiblash
    const filteredSales = (sotuvlar || [])
      .filter(s => {
        const sDate = new Date(s.sana);
        return sDate >= filterDate && sDate <= bugun;
      })
      .sort((a, b) => new Date(a.sana) - new Date(b.sana));

    // Grafik uchun formatlash
    const chartData = filteredSales.map((s, index) => ({
      fullKey: `${s.sana}-${index}`, 
      label: new Date(s.sana).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' }),
      sotuv: Number(s.tulangan || 0),
      mijoz: s.mijozIsm || "Noma'lum"
    }));

    const finalData = chartData.length > 0 ? chartData : [{ label: 'Ma\'lumot yo\'q', sotuv: 0 }];

    return {
      rentabellik: jamiKirim > 0 ? ((sofFoyda / jamiKirim) * 100).toFixed(1) : 0,
      chartData: finalData,
      chartWidth: chartData.length > 8 ? `${chartData.length * 80}px` : '100%'
    };
  }, [sotuvlar, vaqtFiltr, jamiKirim, sofFoyda]);

  // Pullarni chiroyli chiqarish uchun formatlash
  const formatMoney = (val) => Math.round(val || 0).toLocaleString('uz-UZ').replace(/,/g, ' ');

  // Grafik o'qi uchun qisqartma (masalan: 1.5M, 200k)
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
          <h2 className="header-title">Moliya bo'limi</h2>
          <p className="header-subtitle">Biznesning real vaqtdagi moliyaviy holati</p>
        </header>

        {/* Tepadagi 3 ta asosiy karta */}
        <section className="stats-grid">
          <div className="stat-card border-green">
            <div className="stat-card-top">
               <div className="icon-box bg-green-soft"><TrendingUp size={20}/></div>
               <span className="trend-val text-kirim">Tushum</span>
            </div>
            <div className="stat-label">Jami Kirim (Naqd)</div>
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
               <span className="trend-val text-blue">Net</span>
            </div>
            <div className="stat-label">Sof Foyda</div>
            <div className="stat-value" style={{ color: sofFoyda >= 0 ? '#10b981' : '#ef4444' }}>
              {formatMoney(sofFoyda)} <small>so'm</small>
            </div>
          </div>
        </section>

        {/* Grafik va Xulosa qismi */}
        <section className="content-grid">
          <div className="white-card chart-section-card">
            <div className="chart-header">
              <h3 className="card-title">Sotuvlar Dinamikasi</h3>
              <select 
                value={vaqtFiltr} 
                onChange={(e) => setVaqtFiltr(e.target.value)}
                className="moliya-select"
              >
                <option value="7kun">7 kun</option>
                <option value="1oy">1 oy</option>
                <option value="1yil">1 yil</option>
              </select>
            </div>

            <div className="chart-scroll-wrapper">
              <div style={{ width: moliyaStatistika.chartWidth, minWidth: '100%', height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={moliyaStatistika.chartData}>
                    <defs>
                      <linearGradient id="colorSotuv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="fullKey" 
                      fontSize={11} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val, i) => moliyaStatistika.chartData[i]?.label || ""}
                    />
                    <YAxis 
                      tickFormatter={formatYAxis} 
                      fontSize={11} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                       content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="custom-tooltip">
                              <p className="tooltip-date">{d.label}</p>
                              <p className="tooltip-value">{formatMoney(d.sotuv)} so'm</p>
                              {d.mijoz && <p className="tooltip-mijoz">{d.mijoz}</p>}
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
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="white-card">
            <h3 className="card-title">Moliyaviy Hisobot</h3>
            <div className="summary-box">
              <div className="summary-row">
                <span><b>Jami Tushum:</b></span> 
                <span className="val-kirim">{formatMoney(jamiKirim)} so'm</span>
              </div>
              <div className="summary-row">
                <span><b>Jami Xarajatlar:</b></span> 
                <span className="val-chiqim">-{formatMoney(jamiChiqim)} so'm</span>
              </div>
              <div className="divider"></div>
              <div className="summary-row total-row" style={{ color: sofFoyda >= 0 ? '#10b981' : '#ef4444' }}>
                <span><b>SOF FOYDA:</b></span> 
                <span>{formatMoney(sofFoyda)} so'm</span>
              </div>
             {/*  <div className="summary-row profitability">
                <span>Rentabellik ko'rsatkichi:</span> 
                <span className="profit-badge">{moliyaStatistika.rentabellik}%</span>
              </div> */}
            </div>
          
          </div>
        </section>
      </div>
    </div>
  );
};

export default Moliya;