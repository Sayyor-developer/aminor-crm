import React, { useState, useMemo } from 'react';
import { 
  User, Settings, BarChart3, Lock, Save, ChevronRight,
  TrendingUp, Package, Users, DollarSign,/*  Trash2, AlertTriangle */
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useData } from '../../DataContext'; 
import './direktor.css';

const Direktor = ({ open }) => {
  const { 
    mijozlar = [], 
    sotuvlar = [], 
    products = [], 
    jamiKirim = 0, 
    jamiQarzlar = 0,
    // clearAllData 
  } = useData(); 

  const [fullname, setFullname] = useState('Alisher Valiyev');
  const [isEditingName, setIsEditingName] = useState(false);
  const [vaqtFiltr, setVaqtFiltr] = useState('7kun'); 
  // const [showModal, setShowModal] = useState(false);

  // Xavfsizlik bo'limi uchun soddalashtirilgan state
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });

  const stats = useMemo(() => {
    const bugun = new Date();
    let filterDate = new Date();

    if (vaqtFiltr === '7kun') filterDate.setDate(bugun.getDate() - 7);
    else if (vaqtFiltr === '1oy') filterDate.setMonth(bugun.getMonth() - 1);
    else if (vaqtFiltr === '1yil') filterDate.setFullYear(bugun.getFullYear() - 1);

    const combined = [
      ...sotuvlar.map(s => ({
        sana: new Date(s.sana),
        qiymat: Number(s.summa || 0),
        tur: 'Sotuv'
      })),
      ...products.map(p => ({
        sana: new Date(p.date || p.sana),
        qiymat: Number(p.price || 0) * Number(p.stock || 0),
        tur: 'Mahsulot Kirimi'
      }))
    ];

    const chartData = combined
      .filter(item => item.sana >= filterDate)
      .sort((a, b) => a.sana - b.sana)
      .map((item, index) => ({
        id: index,
        label: item.sana.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' }) + " " + 
               item.sana.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        qiymat: item.qiymat, 
        tur: item.tur,
        toliqSana: item.sana.toLocaleString('uz-UZ')
      }));

    const chartWidth = Math.max(100, chartData.length * 110);

    return {
      daromad: jamiKirim.toLocaleString(),
      mijozlar: mijozlar.length.toLocaleString(),
      qarz: jamiQarzlar.toLocaleString(),
      chartData: chartData.length > 0 ? chartData : [{ label: 'Ma\'lumot yo\'q', qiymat: 0, tur: 'Mavjud emas' }],
      chartWidth: chartData.length > 6 ? `${chartWidth}px` : '100%'
    };
  }, [sotuvlar, products, mijozlar, jamiKirim, jamiQarzlar, vaqtFiltr]);

  /* const handleConfirmReset = () => {
    if (clearAllData) {
      clearAllData();
      setShowModal(false);
      toast.error("Barcha ma'lumotlar tozalandi!");
    }
  }; */

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.warning("Parollar mos kelmadi!");
      return;
    }
    toast.success("Parol muvaffaqiyatli yangilandi!");
    setPasswords({ new: '', confirm: '' });
  };

  return (
    <div className={`direktor-page ${open ? 'shifted' : 'collapsed'}`}>
      <ToastContainer position="top-right" autoClose={2000} />
      
      <div className="direktor-wrapper">
        <div className="breadcrumb-nav">
          <span>Admin Panel</span> <ChevronRight size={14} /> <span className="active-link">Direktor Sozlamalari</span>
        </div>

        <div className="stats-container">
          {[
            { label: 'Umumiy Savdo', value: `${stats.daromad} so'm`, icon: DollarSign, color: 'emerald' },
            { label: 'Jami Mijozlar', value: stats.mijozlar, icon: Users, color: 'blue' },
            { label: 'Kutilayotgan Qarz', value: `${stats.qarz} so'm`, icon: Package, color: 'amber' },
            { label: 'Tizim Holati', value: 'Faol', icon: TrendingUp, color: 'purple' },
          ].map((stat, i) => (
            <div key={i} className="mini-card">
              <div className={`mini-icon ${stat.color}`}><stat.icon size={22} /></div>
              <div className="mini-info"><p>{stat.label}</p><h4>{stat.value}</h4></div>
            </div>
          ))}
        </div>

        <div className="direktor-grid">
          <div className="left-column">
            <div className="main-card">
              <div className="card-top">
                <div className="title-box"><BarChart3 size={20} className="red-icon" /><h3>Biznes Dinamikasi</h3></div>
                <select className="vaqt-select-direktor" value={vaqtFiltr} onChange={e => setVaqtFiltr(e.target.value)}>
                  <option value="7kun">1 hafta</option>
                  <option value="1oy">1 oy</option>
                  <option value="1yil">1 yil</option>
                </select>
              </div>
              
              <div className="card-content">
                <div className="chart-scroll-box">
                  <div style={{ width: stats.chartWidth, minWidth: '100%', height: '350px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.chartData}>
                        <defs>
                          <linearGradient id="colorDir" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f1f5f9" />
                        <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} interval={0} angle={-30} textAnchor="end" height={60} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          formatter={(value, name, props) => [`${Number(value).toLocaleString()} so'm`, props.payload.tur]}
                          labelFormatter={(label, items) => items[0] ? `Sana: ${items[0].payload.toliqSana}` : label}
                        />
                        <Area type="monotone" dataKey="qiymat" stroke="var(--primary-color)" strokeWidth={3} fill="url(#colorDir)" dot={{ r: 4, fill: 'var(--primary-color)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="danger-zone-card main-card">
                <div className="card-top">
                    <div className="title-box"><AlertTriangle size={20} className="red-icon" /><h3>Xavfli Hudud</h3></div>
                </div>
                <div className="card-content">
                    <p className="danger-text">Barcha savdolar va ombor ma'lumotlarini butunlay o'chirib tashlash.</p>
                    <button className="delete-all-btn" onClick={() => setShowModal(true)}>
                        <Trash2 size={18} /> Statistikani tozalash
                    </button>
                </div>
            </div> */}
          </div>

          <div className="right-column">
             <div className="main-card profile-card-height" style={{marginBottom: '20px'}}>
              <div className="card-top">
                <div className="title-box"><User size={20} className="red-icon" /><h3>Profil</h3></div>
                <button className="action-btn" onClick={() => setIsEditingName(!isEditingName)}>
                  {isEditingName ? <Save size={16} /> : <Settings size={16} />}
                </button>
              </div>
              <div className="card-content">
                <p className="field-label">Direktor F.I.O</p>
                {isEditingName ? 
                  <input className="name-input" value={fullname} onChange={e => setFullname(e.target.value)} autoFocus /> : 
                  <div className="profile-info"><h4>{fullname}</h4></div>
                }
              </div>
            </div>

            <div className="main-card">
              <div className="card-top"><div className="title-box"><Lock size={20} className="red-icon" /><h3>Xavfsizlik</h3></div></div>
              <form className="security-form card-content" onSubmit={handlePasswordSubmit}>
                <div className="input-item">
                  <label>Yangi Parol</label>
                  <input 
                    type="password" 
                    placeholder="••••••" 
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    required
                  />
                </div>
                <div className="input-item">
                  <label>Tasdiqlash</label>
                  <input 
                    type="password" 
                    placeholder="••••••" 
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="save-code-btn">Yangilash</button>
              </form>
            </div>
          </div>
        </div>
      </div>

     {/*  {showModal && (
        <div className="m-modal-overlay">
          <div className="m-modal-card">
            <div className="m-modal-header">
              <AlertTriangle size={45} color="var(--primary-color)" />
              <h3>Ma'lumotlar o'chirilsinmi?</h3>
            </div>
            <p>Bu amalni bajarganingizdan so'ng barcha statistika 0 ga tushadi. Buni ortga qaytarib bo'lmaydi!</p>
            <div className="m-modal-btns">
              <button className="m-btn-no" onClick={() => setShowModal(false)}>Bekor qilish</button>
              <button className="m-btn-yes" onClick={handleConfirmReset}>Ha, o'chirilsin</button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Direktor;