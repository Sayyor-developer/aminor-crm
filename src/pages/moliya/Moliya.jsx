import React, { useMemo, useState } from 'react';
import {  DollarSign, UserMinus, CalendarDays } from 'lucide-react'; 
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../DataContext'; 
import './moliya.css';

const Moliya = ({ open }) => {
  const { sotuvlar, jamiKirim, /* jamiChiqim, */ sofFoyda, jamiQarzlar, loading } = useData();
  const [vaqtFiltr, setVaqtFiltr] = useState('1oy'); 

  // --- YANGI: Sana oralig'i uchun state-lar ---
  const [sanaDan, setSanaDan] = useState('');
  const [sanaGacha, setSanaGacha] = useState('');

  // Bugungi sotuvni hisoblash
  const bugungiSotuv = useMemo(() => {
    const bugun = new Date().toLocaleDateString('en-CA'); 
    return (sotuvlar || [])
      .filter(s => s.sana === bugun)
      .reduce((sum, s) => sum + Number(s.tulangan || 0), 0);
  }, [sotuvlar]);

  // --- YANGI: Tanlangan ikki sana orasidagi sotuvni hisoblash ---
  const tanlanganMuddatSotuvi = useMemo(() => {
    if (!sanaDan || !sanaGacha) return 0;
    
    const start = new Date(sanaDan);
    const end = new Date(sanaGacha);
    end.setHours(23, 59, 59, 999); // Kun oxirigacha qamrab olish

    return (sotuvlar || [])
      .filter(s => {
        const sDate = new Date(s.sana);
        return sDate >= start && sDate <= end;
      })
      .reduce((sum, s) => sum + Number(s.tulangan || 0), 0);
  }, [sotuvlar, sanaDan, sanaGacha]);

  const moliyaStatistika = useMemo(() => {
    const bugun = new Date();
    bugun.setHours(23, 59, 59, 999);
    
    let filterDate = new Date();
    if (vaqtFiltr === '7kun') filterDate.setDate(bugun.getDate() - 7);
    else if (vaqtFiltr === '1oy') filterDate.setMonth(bugun.getMonth() - 1);
    else if (vaqtFiltr === '1yil') filterDate.setFullYear(bugun.getFullYear() - 1);
    filterDate.setHours(0, 0, 0, 0);

    const filteredSales = (sotuvlar || [])
      .filter(s => {
        const sDate = new Date(s.sana);
        return sDate >= filterDate && sDate <= bugun;
      })
      .sort((a, b) => new Date(a.sana) - new Date(b.sana));

    const chartData = filteredSales.map((s, index) => ({
      fullKey: `${s.sana}-${index}`, 
      label: new Date(s.sana).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' }),
      sotuv: Number(s.tulangan || 0),
      mijoz: s.mijozIsm || "Noma'lum"
    }));

    return {
      rentabellik: jamiKirim > 0 ? ((sofFoyda / jamiKirim) * 100).toFixed(1) : 0,
      chartData: chartData.length > 0 ? chartData : [{ label: 'Ma\'lumot yo\'q', sotuv: 0 }],
      chartWidth: chartData.length > 8 ? `${chartData.length * 80}px` : '100%'
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
          <h2 className="header-title">Moliya bo'limi</h2>
          <p className="header-subtitle">Biznesning real vaqtdagi moliyaviy holati</p>
        </header>

        <section className="stats-grid">
          <div className="stat-card border-green">
            <div className="stat-card-top">
               <div className="icon-box bg-green-soft"><CalendarDays size={20}/></div>
               <span className="trend-val text-kirim">Bugun</span>
            </div>
            <div className="stat-label">Bugungi Sotuvlar</div>
            <div className="stat-value">{formatMoney(bugungiSotuv)} <small>so'm</small></div>
          </div>

          <div className="stat-card border-blue">
            <div className="stat-card-top">
               <div className="icon-box bg-blue-soft"><DollarSign size={20}/></div>
               <span className="trend-val text-blue">Net</span>
            </div>
            <div className="stat-label">Umumiy kirim</div>
            <div className="stat-value" style={{ color: sofFoyda >= 0 ? '#10b981' : '#ef4444' }}>
              {formatMoney(sofFoyda)} <small>so'm</small>
            </div>
          </div>

          <div className="stat-card border-purple">
            <div className="stat-card-top">
               <div className="icon-box bg-orange-soft"><UserMinus size={20} /></div>
               <span className="trend-val text-orange" style={{ color: 'var(--primary-color)' }}>Qarz</span>
            </div>
            <div className="stat-label">Umumiy Qarzlar</div>
            <div className="stat-value" style={{ color: 'var(--primary-color)' }}>
              {formatMoney(jamiQarzlar)} <small>so'm</small>
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="white-card chart-section-card">
            <div className="chart-header">
              <h3 className="card-title">Sotuvlar Dinamikasi</h3>
              <select 
                value={vaqtFiltr} 
                onChange={(e) => setVaqtFiltr(e.target.value)}
                className="moliya-select"
              >
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
                        <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
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
                      stroke="var(--primary-color)" 
                      fill="url(#colorSotuv)" 
                      strokeWidth={3} 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* O'NG TARAFI: Moliyaviy hisobot o'rniga filtr qo'shildi */}
          <div className="white-card">
            <h3 className="card-title">Sana bo'yicha qidiruv</h3>
            
            <div className="date-filter-inputs" style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Dan:</label>
                    <input 
                        type="date" 
                        value={sanaDan} 
                        onChange={(e) => setSanaDan(e.target.value)} 
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Gacha:</label>
                    <input 
                        type="date" 
                        value={sanaGacha} 
                        onChange={(e) => setSanaGacha(e.target.value)} 
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                    />
                </div>
            </div>

            <div className="summary-box">
              <div className="summary-row total-row" style={{ borderTop: 'none', paddingTop: '0' }}>
                <span style={{ fontSize: '14px' }}><b>TANLANGAN MUDDAT SOTUVI:</b></span> 
              </div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981', marginTop: '5px' }}>
                {formatMoney(tanlanganMuddatSotuvi)} <small style={{ fontSize: '14px' }}>so'm</small>
              </div>

              {/* --- ESKI HISOBOT KOMENTGA OLINDI --- */}
              {/* <div className="summary-row">
                <span><b>Jami Tushum:</b></span> 
                <span className="val-kirim"> {formatMoney(jamiKirim)} so'm</span>
              </div>
              <div className="summary-row">
                <span><b>Jami Xarajatlar:</b></span> 
                <span className="val-chiqim"> {formatMoney(jamiChiqim)} so'm</span>
              </div>
              <div className="summary-row">
                <span><b>Kutilayotgan Qarzlar:</b></span> 
                <span > {formatMoney(jamiQarzlar)} so'm</span>
              </div>
              <div className="divider"></div>
              <div className="summary-row total-row" style={{ color: sofFoyda >= 0 ? '#10b981' : '#ef4444' }}>
                <span><b>SOF FOYDA:</b></span> 
                <span> {formatMoney(sofFoyda)} so'm</span>
              </div> 
              */}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Moliya;