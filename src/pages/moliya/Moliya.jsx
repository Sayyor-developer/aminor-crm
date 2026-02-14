import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../DataContext'; 
import './moliya.css';

const Moliya = ({ open }) => {
  const { sotuvlar = [], tannarxlar = [] } = useData();
  const [vaqtFiltr, setVaqtFiltr] = useState('1oy'); 

  const moliyaStatistika = useMemo(() => {
    const bugun = new Date();
    let filterDate = new Date();
    
    if (vaqtFiltr === '7kun') filterDate.setDate(bugun.getDate() - 7);
    else if (vaqtFiltr === '1oy') filterDate.setMonth(bugun.getMonth() - 1);
    else if (vaqtFiltr === '1yil') filterDate.setFullYear(bugun.getFullYear() - 1);

    const filteredSales = sotuvlar
      .filter(s => new Date(s.sana) >= filterDate && new Date(s.sana) <= bugun)
      .sort((a, b) => new Date(a.sana) - new Date(b.sana));

    // --- ANIQ BIZNES MATEMATIKASI ---
    let jamiKirim = 0;      
    let jamiTannarx = 0;    

    filteredSales.forEach(sotuv => {
      const sotuvSummasi = Number(sotuv.summa || 0);
      jamiKirim += sotuvSummasi;
      
      // Tannarxlar bazasidan mahsulotni topish
      const mahsulotTannarxi = tannarxlar.find(t => t.materialTuri === sotuv.mahsulotNomi);
      
      if (mahsulotTannarxi) {
        // Haqiqiy chiqim: (Mahsulotning 1 dona tannarxi * sotilgan miqdor)
        jamiTannarx += (Number(mahsulotTannarxi.narx) * Number(sotuv.miqdor || 1));
      }
    });

    // Sof Foyda = Jami tushum - Jami tannarx
    const sofFoida = jamiKirim - jamiTannarx;

    const chartData = filteredSales.map((s, index) => ({
      id: index,
      label: new Date(s.sana).toLocaleDateString('uz-UZ', {day:'2-digit', month:'short'}),
      sotuv: Number(s.summa || 0)
    }));

    return {
      jamiKirim,
      jamiChiqim: jamiTannarx,
      sofFoida,
      rentabellik: jamiKirim > 0 ? ((sofFoida / jamiKirim) * 100).toFixed(1) : 0,
      chartData: chartData.length > 0 ? chartData : [{ label: 'Ma\'lumot yo\'q', sotuv: 0 }],
      chartWidth: chartData.length > 6 ? `${chartData.length * 110}px` : '100%'
    };
  }, [sotuvlar, tannarxlar, vaqtFiltr]);

  const formatMoney = (val) => Math.round(val).toLocaleString('uz-UZ').replace(/,/g, ' ');

  return (
    <div className={`moliya-wrapper ${open ? 'sidebar-moliya-open' : 'sidebar-moliya-closed'}`}>
      <div className="moliya-container">
        
        <header className="header-section">
          <h2 className="header-title">Moliya Analitikasi</h2>
          <p className="header-subtitle">Realizatsiya qilingan tovarlar bo'yicha sof foyda</p>
        </header>

        <section className="stats-grid">
          <div className="stat-card border-green">
            <div className="stat-card-top">
               <div className="icon-box bg-green-soft"><TrendingUp size={20}/></div>
               <span className="trend-val text-kirim">Savdo</span>
            </div>
            <div className="stat-label">Jami Kirim</div>
            <div className="stat-value">{formatMoney(moliyaStatistika.jamiKirim)} <small>so'm</small></div>
          </div>

          <div className="stat-card border-red">
            <div className="stat-card-top">
               <div className="icon-box bg-red-soft"><TrendingDown size={20}/></div>
               <span className="trend-val text-chiqim">Xarajat</span>
            </div>
            <div className="stat-label">Sotilgan tovar tannarxi</div>
            <div className="stat-value">{formatMoney(moliyaStatistika.jamiChiqim)} <small>so'm</small></div>
          </div>

          <div className="stat-card border-blue">
            <div className="stat-card-top">
               <div className="icon-box bg-blue-soft"><DollarSign size={20}/></div>
               <span className="trend-val bg-blue-soft">Net</span>
            </div>
            <div className="stat-label">Haqiqiy Sof Foyda</div>
            <div className="stat-value">{formatMoney(moliyaStatistika.sofFoida)} <small>so'm</small></div>
          </div>

          <div className="stat-card border-purple">
            <div className="stat-card-top">
               <div className="icon-box bg-purple-soft"><Calendar size={20}/></div>
               <span className="trend-val bg-purple-soft">Margin</span>
            </div>
            <div className="stat-label">Rentabellik</div>
            <div className="stat-value">{moliyaStatistika.rentabellik}%</div>
          </div>
        </section>

        <section className="content-grid">
          <div className="white-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Savdo Dinamikasi</h3>
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

            <div className="chart-scroll-wrapper" style={{ width: '100%', overflowX: 'auto', paddingBottom: '15px' }}>
              <div style={{ width: moliyaStatistika.chartWidth, minWidth: '100%', height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={moliyaStatistika.chartData}>
                    <defs>
                      <linearGradient id="colorSotuv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} angle={-30} textAnchor="end" height={60} />
                    <YAxis hide={true} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none' }}
                      formatter={(value) => [formatMoney(value) + " so'm", "Savdo"]} 
                    />
                    <Area type="monotone" dataKey="sotuv" stroke="var(--primary-color)" fill="url(#colorSotuv)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="white-card">
            <h3 className="card-title">Moliyaviy Xulosa</h3>
            <div className="period-box" style={{ borderRadius: '12px', padding: '15px', background: '#f8fafc' }}>
              <div className="data-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{color: '#64748b'}}>Umumiy Savdo:</span> 
                <span style={{ fontWeight: '600' }}>{formatMoney(moliyaStatistika.jamiKirim)} so'm</span>
              </div>
              <div className="data-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{color: '#64748b'}}>Tannarx (Chiqim):</span> 
                <span style={{ fontWeight: '600', color: '#ef4444' }}>-{formatMoney(moliyaStatistika.jamiChiqim)} so'm</span>
              </div>
              <hr style={{ border: '0.5px solid #e2e8f0', margin: '15px 0' }} />
              <div className="data-row" style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontSize: '18px', fontWeight: 'bold' }}>
                <span>SOF FOYDA:</span> 
                <span>{formatMoney(moliyaStatistika.sofFoida)} so'm</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Moliya;