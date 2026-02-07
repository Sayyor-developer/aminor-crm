import React, { useState, useMemo } from 'react';
import { 
  User, 
  Settings, 
  BarChart3, 
  Lock, 
  Save, 
  ChevronRight,
  TrendingUp,
  Package,
  Users,
  DollarSign
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useData } from '../../DataContext'; // Markaziy bazani ulaymiz
import './direktor.css';

const Direktor = ({ open }) => {
  const { mijozlar, sotuvlar } = useData(); // Real ma'lumotlarni olish

  const [fullname, setFullname] = useState('Alisher Valiyev');
  const [isEditingName, setIsEditingName] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');

  // --- DINAMIK STATISTIKANI HISOBLASH ---
  const stats = useMemo(() => {
    const jamiDaromad = sotuvlar.reduce((sum, s) => sum + s.summa, 0);
    const jamiMijozlar = mijozlar.length;
    const jamiQarz = mijozlar.reduce((sum, m) => sum + Number(m.qarzdorlik), 0);
    
    // Grafik uchun oxirgi 7 ta sotuvni tayyorlash (namuna sifatida)
    const chartData = sotuvlar.slice(-7).map((s, index) => ({
      name: new Date(s.sana).toLocaleDateString('uz-UZ', { weekday: 'short' }),
      sales: s.summa
    }));

    return {
      daromad: jamiDaromad.toLocaleString(),
      mijozlar: jamiMijozlar.toLocaleString(),
      qarz: jamiQarz.toLocaleString(),
      grafik: chartData.length > 0 ? chartData : [
        { name: 'Dush', sales: 4000 },
        { name: 'Sesh', sales: 3000 },
        { name: 'Chor', sales: 2000 },
        { name: 'Pay', sales: 2780 },
        { name: 'Jum', sales: 1890 },
      ]
    };
  }, [sotuvlar, mijozlar]);

  const toastOptions = {
    position: "top-right",
    autoClose: 3000,
    theme: "colored"
  };

  const handleSaveName = () => {
    setIsEditingName(false);
    toast.success("Direktor nomi o'zgartirildi", toastOptions);
  };

  const handleChangeCode = (e) => {
    e.preventDefault();
    if (!currentCode || !newCode || !confirmCode) {
      toast.error('Barcha maydonlarni to\'ldiring', toastOptions);
      return;
    }
    if (newCode !== confirmCode) {
      toast.error('Yangi kodlar mos kelmadi', toastOptions);
      return;
    }
    toast.success("Xavfsizlik kodi muvaffaqiyatli yangilandi", toastOptions);
    setCurrentCode(''); setNewCode(''); setConfirmCode('');
  };

  return (
    <div className={`direktor-page ${open ? 'shifted' : 'collapsed'}`}>
      <ToastContainer />
      <div className="direktor-wrapper">
        
        {/* Breadcrumb */}
        <div className="breadcrumb-nav">
          <span>Admin Panel</span>
          <ChevronRight size={14} />
          <span className="active-link">Direktor Sozlamalari</span>
        </div>

        {/* Dinamik Statistik Kartochkalar */}
        <div className="stats-container">
          {[
            { label: 'Umumiy Savdo', value: `${stats.daromad} so'm`, icon: DollarSign, color: 'emerald' },
            { label: 'Jami Mijozlar', value: stats.mijozlar, icon: Users, color: 'blue' },
            { label: 'Kutilayotgan Qarz', value: `${stats.qarz} so'm`, icon: Package, color: 'amber' },
            { label: 'Tizim Holati', value: 'Faol', icon: TrendingUp, color: 'purple' },
          ].map((stat, i) => (
            <div key={i} className="mini-card">
              <div className={`mini-icon ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <div className="mini-info">
                <p>{stat.label}</p>
                <h4>{stat.value}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="direktor-grid">
          {/* Chap ustun */}
          <div className="left-column">
            
            <div className="main-card">
              <div className="card-top">
                <div className="title-box">
                  <User size={20} className="red-icon" />
                  <h3>Direktor Profili</h3>
                </div>
                <button 
                  className="action-btn"
                  onClick={() => isEditingName ? handleSaveName() : setIsEditingName(true)}
                >
                  {isEditingName ? <Save size={16} /> : <Settings size={16} />}
                  {isEditingName ? "Saqlash" : "Tahrirlash"}
                </button>
              </div>
              <div className="card-content">
                <p className="field-label">Direktor F.I.O</p>
                {isEditingName ? (
                  <input 
                    type="text" 
                    className="name-input"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <div className="profile-info">
                    <div className="avatar-circle">{fullname.charAt(0)}</div>
                    <span className="fullname-text">{fullname}</span>
                  </div>
                )}
                <p className="sub-text">Bu ism tizimdagi barcha rasmiy hujjatlarda direktor sifatida ko'rinadi.</p>
              </div>
            </div>

            {/* Dinamik Grafik */}
            <div className="main-card">
              <div className="card-top">
                <div className="title-box">
                  <BarChart3 size={20} className="red-icon" />
                  <h3>Sotuvlar Dinamikasi</h3>
                </div>
              </div>
              <div className="card-content">
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.grafik}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#ef4444" 
                        strokeWidth={3} 
                        fill="url(#colorSales)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* O'ng ustun - Xavfsizlik */}
          <div className="right-column">
            <div className="main-card">
              <div className="card-top">
                <div className="title-box">
                  <Lock size={20} className="red-icon" />
                  <h3>Xavfsizlik Sozlamalari</h3>
                </div>
              </div>
              <form className="card-content security-form" onSubmit={handleChangeCode}>
                <div className="input-item">
                  <label>Hozirgi Parol</label>
                  <input 
                    type="password" 
                    placeholder="••••••"
                    value={currentCode}
                    onChange={(e) => setCurrentCode(e.target.value)}
                  />
                </div>
                <div className="input-item">
                  <label>Yangi Parol</label>
                  <input 
                    type="password" 
                    placeholder="••••••"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                  />
                </div>
                <div className="input-item">
                  <label>Parolni tasdiqlash</label>
                  <input 
                    type="password" 
                    placeholder="••••••"
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value)}
                  />
                </div>
                <button type="submit" className="save-code-btn">
                  Yangi parolni saqlash
                </button>
              </form>
            </div>

            <div className="red-banner">
              <div className="banner-txt">
                <h4>Eslatma!</h4>
                <p>Parolni xavfsizlik maqsadida har 30 kunda yangilab turish tavsiya etiladi.</p>
              </div>
              <Lock className="banner-icon" size={80} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Direktor;