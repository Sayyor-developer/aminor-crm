import React, { useMemo, useState } from 'react';
import { DollarSign, UserMinus, CalendarDays, Search, Table } from 'lucide-react'; 
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../DataContext'; 
import './moliya.css';

const Moliya = ({ open }) => {
  // mijozlar ni ham Context dan olamiz
  const { sotuvlar, mijozlar, /* jamiKirim, */ sofFoyda, jamiQarzlar, loading } = useData();
  const [vaqtFiltr, setVaqtFiltr] = useState('1oy'); 

  const [sanaDan, setSanaDan] = useState('');
  const [sanaGacha, setSanaGacha] = useState('');
  const [filteredList, setFilteredList] = useState([]); 
  const [searchTriggered, setSearchTriggered] = useState(false);

  // --- FUNKSIYA: mijozId orqali ismni topish ---
  const getMijozIsm = (id) => {
    const mijoz = mijozlar.find(m => m.id === id);
    return mijoz ? mijoz.ism : "Noma'lum";
  };

  const bugungiSotuv = useMemo(() => {
    const bugun = new Date().toLocaleDateString('en-CA'); 
    return (sotuvlar || [])
      .filter(s => s.sana === bugun)
      .reduce((sum, s) => sum + Number(s.tulangan || 0), 0);
  }, [sotuvlar]);

  const handleSearch = () => {
    if (!sanaDan || !sanaGacha) return;
    
    const start = new Date(sanaDan);
    const end = new Date(sanaGacha);
    end.setHours(23, 59, 59, 999);

    const results = (sotuvlar || []).filter(s => {
      const sDate = new Date(s.sana);
      return sDate >= start && sDate <= end;
    });

    setFilteredList(results);
    setSearchTriggered(true);
  };

  const tanlanganTotal = useMemo(() => {
    return filteredList.reduce((sum, s) => sum + Number(s.tulangan || 0), 0);
  }, [filteredList]);

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
    }));

    return {
      chartData: chartData.length > 0 ? chartData : [{ label: 'Ma\'lumot yo\'q', sotuv: 0 }],
    };
  }, [sotuvlar, vaqtFiltr]);

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
            <div className="stat-label">Umumiy Sotuv</div>
            <div className="stat-value" style={{ color: sofFoyda >= 0 ? '#10b981' : '#ef4444' }}>
              {formatMoney(sofFoyda)} <small>so'm</small>
            </div>
          </div>

          <div className="stat-card border-purple">
            <div className="stat-card-top">
               <div className="icon-box bg-orange-soft"><UserMinus size={20} /></div>
               <span className="trend-val text-orange">Qarz</span>
            </div>
            <div className="stat-label">Umumiy Qarzlar</div>
            <div className="stat-value" style={{ color: 'black' }}>
              {formatMoney(jamiQarzlar)} <small>so'm</small>
            </div>
          </div>
        </section>

        <section className="moliya-main-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '20px' }}>
          
          {/* CHAP TARAF: SANA BO'YICHA QIDIRUV (KATTA) */}
          <div className="white-card">
            <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="card-title" style={{ margin: 0 }}>Sana bo'yicha hisobot</h3>
                <div className="search-inputs-row" style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <div className="input-field">
                        <label style={{ fontSize: '12px', color: '#64748b' }}>Dan:</label>
                        <input type="date" value={sanaDan} onChange={(e) => setSanaDan(e.target.value)} className="moliya-date-input" />
                    </div>
                    <div className="input-field">
                        <label style={{ fontSize: '12px', color: '#64748b' }}>Gacha:</label>
                        <input type="date" value={sanaGacha} onChange={(e) => setSanaGacha(e.target.value)} className="moliya-date-input" />
                    </div>
                    <button onClick={handleSearch} className="moliya-search-btn">
                        <Search size={18} /> Ko'rsatish
                    </button>
                </div>
            </div>

            {searchTriggered ? (
                <div className="search-results-area">
                    <div className="total-summary-mini" style={{ padding: '15px', background: '#f0fdf4', borderRadius: '10px', marginBottom: '15px', border: '1px solid #dcfce7' }}>
                        <span style={{ color: 'var(--primary-color)', fontSize: '14px', fontWeight: '500' }}>Tanlangan davr uchun jami tushum:</span>
                        <div style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{formatMoney(tanlanganTotal)} so'm</div>
                    </div>
                    
                    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                        <table className="moliya-mini-table">
                            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                <tr>
                                    <th>Sana</th>
                                    <th>Mijoz ismi</th>
                                    <th>Mahsulot</th>
                                    <th>Summa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredList.length > 0 ? (
                                    filteredList.map((s, idx) => (
                                        <tr key={idx}>
                                            <td>{s.sana}</td>
                                            {/* BU YERDA MIJOZ ISMINI TOPAMIZ */}
                                            <td style={{ fontWeight: '500' }}>{getMijozIsm(s.mijozId)}</td>
                                            <td>{s.mahsulot}</td>
                                            <td className="text-kirim">+{formatMoney(s.tulangan)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Ma'lumot topilmadi</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="empty-search-state" style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                    <Table size={48} style={{ marginBottom: '10px', opacity: 0.3 }} />
                    <p style={{ fontSize: '16px' }}>Sana oralig'ini tanlang va "Ko'rsatish" tugmasini bosing</p>
                </div>
            )}
          </div>

          {/* O'NG TARAF: DINAMIKA (KICHIK) */}
          <div className="white-card">
            <div className="chart-header" style={{ marginBottom: '20px' }}>
              <h3 className="card-title">Dinamika</h3>
              <select 
                value={vaqtFiltr} 
                onChange={(e) => setVaqtFiltr(e.target.value)}
                className="moliya-select-mini"
              >
                <option value="1oy">1 oy</option>
                <option value="1yil">1 yil</option>
              </select>
            </div>

            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moliyaStatistika.chartData}>
                  <defs>
                    <linearGradient id="colorSotuv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={formatYAxis} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    formatter={(value) => [`${formatMoney(value)} so'm`, 'Sotuv']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="sotuv" stroke="var(--primary-color)" fill="url(#colorSotuv)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
};

export default Moliya;