import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../DataContext'; // Markaziy bazani ulaymiz
import './moliya.css';

const Moliya = ({ open }) => {
  const { sotuvlar, /* mijozlar */ } = useData();

  // --- DINAMIK HISOBLASH TIZIMI ---
  const moliyaStatistika = useMemo(() => {
    const bugun = new Date().toLocaleDateString();
    
    // 1. Jami Kirim (Barcha sotuvlar yig'indisi)
    const jamiKirim = sotuvlar.reduce((sum, s) => sum + s.summa, 0);

    // 2. Bugungi Kirim
    const bugungiSotuvlar = sotuvlar.filter(s => new Date(s.sana).toLocaleDateString() === bugun);
    const bugungiKirim = bugungiSotuvlar.reduce((sum, s) => sum + s.summa, 0);

    // 3. Taxminiy Chiqim (Masalan, kirimning 60% i xarajat deb olinsa)
    // Real tizimda xarajatlar jadvali bo'lsa o'shandan olinadi
    const jamiChiqim = jamiKirim * 0.6; 
    const sofFoida = jamiKirim - jamiChiqim;

    // 4. Grafik ma'lumotlarini tayyorlash (Oxirgi 7 ta kirim)
    const chartData = sotuvlar.slice(-7).map(s => ({
      oy: new Date(s.sana).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }),
      sotuv: s.summa
    }));

    return {
      jamiKirim,
      jamiChiqim,
      sofFoida,
      bugungiKirim,
      rentabellik: jamiKirim > 0 ? ((sofFoida / jamiKirim) * 100).toFixed(1) : 0,
      chartData: chartData.length > 0 ? chartData : [{ oy: 'Ma\'lumot yo\'q', sotuv: 0 }]
    };
  }, [sotuvlar]);

  return (
    <div className={`moliya-wrapper ${open ? 'sidebar-moliya-open' : 'sidebar-moliya-closed'}`}>
      <div className="moliya-container">
        
        <header className="header-section">
          <h2 className="header-title">Moliya Analitikasi</h2>
          <p className="header-subtitle">Real vaqtdagi moliyaviy aylanma va hisobotlar</p>
        </header>

        {/* ASOSIY 4 TA KARD */}
        <section className="stats-grid">
          <div className="stat-card border-green">
            <div className="stat-card-top">
               <div className="icon-box bg-green-soft"><TrendingUp size={20}/></div>
               <span className="trend-val text-kirim">Faol</span>
            </div>
            <div className="stat-label">Umumiy Kirim</div>
            <div className="stat-value">{moliyaStatistika.jamiKirim.toLocaleString()}</div>
          </div>

          <div className="stat-card border-red">
            <div className="stat-card-top">
               <div className="icon-box bg-red-soft"><TrendingDown size={20}/></div>
               <span className="trend-val text-chiqim">Taxminiy</span>
            </div>
            <div className="stat-label">Umumiy Chiqim</div>
            <div className="stat-value">{moliyaStatistika.jamiChiqim.toLocaleString()}</div>
          </div>

          <div className="stat-card border-blue">
            <div className="stat-card-top">
               <div className="icon-box bg-blue-soft"><DollarSign size={20}/></div>
               <span className="trend-val bg-blue-soft">Sof</span>
            </div>
            <div className="stat-label">Sof Foida</div>
            <div className="stat-value">{moliyaStatistika.sofFoida.toLocaleString()}</div>
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

        <section className="content-grid">
          {/* GRAFIK QISMI */}
          <div className="white-card">
            <h3 className="card-title">Sotuvlar Dinamikasi (Oxirgi amallar)</h3>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moliyaStatistika.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="oy" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => [value.toLocaleString() + " so'm", "Sotuv"]} />
                  <Area type="monotone" dataKey="sotuv" stroke="#3b82f6" fill="#eff6ff" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DAVRIY STATISTIKA */}
          <div className="white-card">
            <h3 className="card-title">Tezkor Hisobot</h3>
            <div className="period-box p-blue">
              <div className="stat-label">Bugungi holat</div>
              <div className="data-row"><span>Kirim:</span> <span>{moliyaStatistika.bugungiKirim.toLocaleString()}</span></div>
              <div className="data-row foida-row"><span>Taxminiy foida:</span> <span>{(moliyaStatistika.bugungiKirim * 0.4).toLocaleString()}</span></div>
            </div>
            <div className="period-box p-green">
              <div className="stat-label">Jami aylanma</div>
              <div className="data-row"><span>Kirimlar:</span> <span>{moliyaStatistika.jamiKirim.toLocaleString()}</span></div>
              <div className="data-row foida-row"><span>Sof foida:</span> <span>{moliyaStatistika.sofFoida.toLocaleString()}</span></div>
            </div>
          </div>
        </section>

        {/* TO'LOVLAR TARIXI (Real sotuvlar asosida) */}
        <section className="white-card">
          <h3 className="card-title">Oxirgi Kirim Amallari</h3>
          <div className="table-wrapper">
            <table className="main-table">
              <thead>
                <tr>
                  <th>TUR</th>
                  <th>SANA</th>
                  <th>SUMMA</th>
                </tr>
              </thead>
              <tbody>
                {sotuvlar.slice(-5).reverse().map((s, index) => (
                  <tr key={index}>
                    <td><span className="text-kirim">Kirim</span></td>
                    <td>{new Date(s.sana).toLocaleDateString()}</td>
                    <td>{s.summa.toLocaleString()} so'm</td>
                  </tr>
                ))}
                {sotuvlar.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{textAlign: 'center', padding: '20px'}}>Hali ma'lumotlar mavjud emas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Moliya;