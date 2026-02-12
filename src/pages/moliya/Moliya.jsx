import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar   } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../DataContext'; 
import './moliya.css';

const Moliya = ({ open }) => {
  const { sotuvlar = [] } = useData();
  const [vaqtFiltr, setVaqtFiltr] = useState('7kun'); 

  // --- DINAMIK HISOBLASH VA SKROLL GRAFIK TIZIMI ---
  const moliyaStatistika = useMemo(() => {
    const bugun = new Date();
    let filterDate = new Date();
    
    // Vaqt filtrini hisoblash
    if (vaqtFiltr === '7kun') filterDate.setDate(bugun.getDate() - 7);
    else if (vaqtFiltr === '1oy') filterDate.setMonth(bugun.getMonth() - 1);
    else if (vaqtFiltr === '1yil') filterDate.setFullYear(bugun.getFullYear() - 1);

    // 1. Sotuvlarni filtrlash va vaqt bo'yicha saralash
    const filteredSales = sotuvlar
      .filter(s => new Date(s.sana) >= filterDate)
      .sort((a, b) => new Date(a.sana) - new Date(b.sana))
      .map((s, index) => ({
        id: index,
        // Soatbay ko'rinish (Moliya uchun muhim)
        label: new Date(s.sana).toLocaleDateString('uz-UZ', {day:'2-digit', month:'short'}) + " " + 
               new Date(s.sana).toLocaleTimeString('uz-UZ', {hour:'2-digit', minute:'2-digit'}),
        sotuv: Number(s.summa || 0)
      }));

    // 2. Statistik raqamlarni hisoblash
    const jamiKirim = filteredSales.reduce((sum, s) => sum + s.sotuv, 0);
    const jamiChiqim = jamiKirim * 0.6; // Taxminiy xarajat
    const sofFoida = jamiKirim - jamiChiqim;

    // 3. Grafik kengligini hisoblash (Har bir sotuvga 110px)
    const chartWidth = Math.max(100, filteredSales.length * 110);

    return {
      jamiKirim,
      jamiChiqim,
      sofFoida,
      rentabellik: jamiKirim > 0 ? ((sofFoida / jamiKirim) * 100).toFixed(1) : 0,
      chartData: filteredSales.length > 0 ? filteredSales : [{ label: 'Sotuv yo\'q', sotuv: 0 }],
      chartWidth: filteredSales.length > 6 ? `${chartWidth}px` : '100%'
    };
  }, [sotuvlar, vaqtFiltr]);


  

  return (
    <div className={`moliya-wrapper ${open ? 'sidebar-moliya-open' : 'sidebar-moliya-closed'}`}>
      <div className="moliya-container">
        
        <header className="header-section">
          <h2 className="header-title">Moliya Analitikasi</h2>
          <p className="header-subtitle">Real vaqtdagi har bir tranzaksiya grafigi</p>
        </header>

        {/* STATISTIKA KARTALARI */}
        <section className="stats-grid">
          <div className="stat-card border-green">
            <div className="stat-card-top">
               <div className="icon-box bg-green-soft"><TrendingUp size={20}/></div>
               <span className="trend-val text-kirim">Faol</span>
            </div>
            <div className="stat-label">Umumiy Kirim</div>
            <div className="stat-value">{moliyaStatistika.jamiKirim.toLocaleString()} <small style={{fontSize: '12px'}}>so'm</small></div>
          </div>

          <div className="stat-card border-red">
            <div className="stat-card-top">
               <div className="icon-box bg-red-soft"><TrendingDown size={20}/></div>
               <span className="trend-val text-chiqim">Taxminiy</span>
            </div>
            <div className="stat-label">Umumiy Chiqim</div>
            <div className="stat-value">{moliyaStatistika.jamiChiqim.toLocaleString()} <small style={{fontSize: '12px'}}>so'm</small></div>
          </div>

          <div className="stat-card border-blue">
            <div className="stat-card-top">
               <div className="icon-box bg-blue-soft"><DollarSign size={20}/></div>
               <span className="trend-val bg-blue-soft">Sof</span>
            </div>
            <div className="stat-label">Sof Foida</div>
            <div className="stat-value">{moliyaStatistika.sofFoida.toLocaleString()} <small style={{fontSize: '12px'}}>so'm</small></div>
          </div>

          <div className="stat-card border-purple">
            <div className="stat-card-top">
               <div className="icon-box bg-purple-soft"><Calendar size={20}/></div>
               <span className="trend-val bg-purple-soft">Yaxshi</span>
            </div>
            <div className="stat-label">Rentabellik</div>
            <div className="stat-value">{moliyaStatistika.rentabellik}%</div>
          </div>
        </section>

        {/* GRAFIK SECTION - SKROLL BILAN */}
        <section className="content-grid">
          <div className="white-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Sotuvlar Xronologiyasi (↔️ suring)</h3>
              <select 
                value={vaqtFiltr} 
                onChange={(e) => setVaqtFiltr(e.target.value)}
                className="moliya-select"
              >
                <option value="7kun">1 hafta</option>
                <option value="1oy">1 oy</option>
                <option value="1yil">1 yil</option>
              </select>
            </div>

            {/* GRAFIKNING ASOSIY QISMI */}
            <div className="chart-scroll-wrapper" style={{ width: '100%', overflowX: 'auto', paddingBottom: '15px' }}>
              <div style={{ width: moliyaStatistika.chartWidth, minWidth: '100%', height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={moliyaStatistika.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                    <defs>
                      <linearGradient id="colorSotuv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="label" 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      interval={0} 
                      angle={-30} 
                      textAnchor="end" 
                      height={60}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [value.toLocaleString() + " so'm", "Savdo miqdori"]} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sotuv" 
                    stroke="var(--primary-color)" 
                      fill="url(#colorSotuv)" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: 'var(--primary-color)', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7 }}
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="white-card">
            <h3 className="card-title">Tezkor Hisobot</h3>
            <div className="period-box p-blue" style={{ borderRadius: '12px', padding: '15px', background: '#f8fafc' }}>
              <div className="stat-label" style={{ color: '#64748b', marginBottom: '10px' }}>Tanlangan davr bo'yicha</div>
              <div className="data-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#475569' }}>Jami Kirim:</span> 
                <span style={{ fontWeight: '600' }}>{moliyaStatistika.jamiKirim.toLocaleString()} so'm</span>
              </div>
              <div className="data-row foida-row" style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 'bold' }}>
                <span>Taxminiy foida:</span> 
                <span>{moliyaStatistika.sofFoida.toLocaleString()} so'm</span>
              </div>
              <hr style={{ border: '0.5px solid #e2e8f0', margin: '15px 0' }} />
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
                * Rentabellik ko'rsatkichi umumiy kirimga nisbatan sof foydaning ulushini bildiradi.
              </p>
            </div>
          </div>
        </section>

        {/* RESET TUGMASI */}
        <div className="reset-section" style={{marginTop: '30px', textAlign: 'left'}}>
          
        </div>

       
      </div>
    </div>
  );
};

export default Moliya;