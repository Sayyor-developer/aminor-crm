import React, { useState, /* useMemo */ } from 'react';
import {
  User, Settings,/*  BarChart3, */ Lock,
  /* TrendingUp, Package, Users, DollarSign, */ Trash2,
  AlertTriangle, X, Eye, EyeOff
} from 'lucide-react';
// import {
//   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
//   AreaChart, Area
// } from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useData } from '../../DataContext';
import './direktor.css';

const Direktor = ({ open }) => {
  const {
   /*  mijozlar = [],
    sotuvlar = [], */
    clearAllData
  } = useData();

  const [fullname, setFullname] = useState('Alisher Valiyev');
  // const [vaqtFiltr, setVaqtFiltr] = useState('7kun');
  const [activeModal, setActiveModal] = useState(null);

  // Modal ichidagi forma uchun state
  const [profileData, setProfileData] = useState({
    name: '',
    newPass: '',
    confirmPass: ''
  });
  const [showPass, setShowPass] = useState(false);

  // --- STATISTIKA ---
  /* const stats = useMemo(() => {
    const bugun = new Date();
    let filterDate = new Date();
    if (vaqtFiltr === '7kun') filterDate.setDate(bugun.getDate() - 7);
    else if (vaqtFiltr === '1oy') filterDate.setMonth(bugun.getMonth() - 1);
    else if (vaqtFiltr === '1yil') filterDate.setFullYear(bugun.getFullYear() - 1); */

   /*  const filteredSales = sotuvlar
      .map(s => ({ sana: new Date(s.sana), summa: parseFloat(s.summa || 0) }))
      .filter(item => item.sana >= filterDate)
      .sort((a, b) => a.sana - b.sana);

    const chartData = filteredSales.map((item, index) => ({
      id: index,
      label: item.sana.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' }),
      qiymat: item.summa,
    }));

    const aniqJamiQarz = mijozlar.reduce((sum, m) => sum + parseFloat(m.qarzdorlik || 0), 0);
    const jamiSavdoSummasi = sotuvlar.reduce((sum, s) => sum + parseFloat(s.summa || 0), 0);

    return {
      daromad: jamiSavdoSummasi.toLocaleString(),
      mijozlar: mijozlar.length.toLocaleString(),
      qarz: aniqJamiQarz.toLocaleString(),
      chartData: chartData.length > 0 ? chartData : [{ label: 'Ma\'lumot yo\'q', qiymat: 0 }],
      chartWidth: chartData.length > 6 ? `${chartData.length * 100}px` : '100%'
    };
  }, [sotuvlar, mijozlar, vaqtFiltr]); */

  // Modalni ochishda joriy ma'lumotlarni yuklash
  const openProfileModal = () => {
    setProfileData({ name: fullname, newPass: '', confirmPass: '' });
    setActiveModal('settings');
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    
    // Ismni yangilash
    if (profileData.name.trim()) {
      setFullname(profileData.name);
    }

    // Parolni tekshirish (agar yozilgan bo'lsa)
    if (profileData.newPass) {
      if (profileData.newPass.length < 4) {
        toast.error("Parol juda qisqa!");
        return;
      }
      if (profileData.newPass !== profileData.confirmPass) {
        toast.error("Parollar mos kelmadi!");
        return;
      }
    }

    toast.success("Ma'lumotlar saqlandi!");
    setActiveModal(null);
    setShowPass(false);
  };

  return (
    <div className={`direktor-page ${open ? 'shifted' : 'collapsed'}`}>
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="direktor-wrapper">
        <header className="direktor-header">
          <div className="header-left">
            <div className="icon-box"><Settings /></div>
            <h1 className="page-title">Direktor Paneli</h1>
          </div>
          
          <div className="header-actions">
            <button className="combined-action-btn single-full-btn" onClick={openProfileModal}>
             
               <Lock size={16} />
               <span className="btn-text">Edit login</span>
            </button>
          </div>
        </header>

        {/* Statistik Kartalar */}
     {/*    <div className="d-stats-container">
          {[
            { label: 'Umumiy Savdo', value: `${stats.daromad} so'm`, icon: DollarSign, color: 'emerald' },
            { label: 'Jami Mijozlar', value: stats.mijozlar, icon: Users, color: 'blue' },
            { label: 'Umumiy Qarzlar', value: `${stats.qarz} so'm`, icon: Package, color: 'amber' },
            { label: 'Tizim Holati', value: 'Faol', icon: TrendingUp, color: 'purple' },
          ].map((stat, i) => (
            <div key={i} className="mini-card">
              <div className={`mini-icon ${stat.color}`}><stat.icon size={22} /></div>
              <div className="mini-info">
                <p>{stat.label}</p>
                <h4>{stat.value}</h4>
              </div>
            </div>
          ))}
        </div> */}

        {/* Grafik qismi */}
       {/*  <div className="main-card">
          <div className="card-top">
            <div className="title-box">
              <BarChart3 size={20} className="red-icon" />
              <h3>Savdo Dinamikasi</h3>
            </div>
            <select className="vaqt-select-direktor" value={vaqtFiltr} onChange={e => setVaqtFiltr(e.target.value)}>
              <option value="7kun">1 hafta</option>
              <option value="1oy">1 oy</option>
              <option value="1yil">1 yil</option>
            </select>
          </div>
          <div className="card-content">
            <div className="chart-scroll-box">
              <div className="chart-container" style={{ width: stats.chartWidth }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartData}>
                    <defs>
                      <linearGradient id="colorDir" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis 
                      stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} 
                      tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                    />
                    <Tooltip formatter={(val) => [val.toLocaleString() + " so'm", 'Savdo']} contentStyle={{ borderRadius: '10px', border: 'none' }} />
                    <Area type="monotone" dataKey="qiymat" stroke="var(--primary-color)" strokeWidth={3} fill="url(#colorDir)" dot={{ r: 4, fill: "var(--primary-color)" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div> */}

        <div className="main-card danger-zone-card">
          <div className="card-top">
            <div className="title-box"><AlertTriangle size={20} className="red-icon" /><h3>Xavfli Hudud</h3></div>
          </div>
          <div className="card-content danger-content">
            <p>Statistikani tozalash ma'lumotlarni butunlay o'chirib yuborada.</p>
            <button className="delete-all-btn" onClick={() => setActiveModal('danger')}><Trash2 size={18} /> Ma'lumotlarni o'chirish</button>
          </div>
        </div>
      </div>

      {/* --- YAGONA MODAL (PROFIL VA XAVFSIZLIK) --- */}
      {activeModal === 'settings' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header dark-head">
              <h3 className="modal-title">Profil va Xavfsizlik</h3>
              <X onClick={() => setActiveModal(null)} className="close-icon" size={20} />
            </div>

            <div className="modal-body">
              <form onSubmit={handleSettingsSubmit}>
                <label className="m-label">F.I.O (Ismni o'zgartirish)</label>
                <div className="f-input-group">
                  <User className="f-input-icon" size={18} />
                  <input
                    className="name-input custom-p"
                    value={profileData.name}
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                  />
                </div>

                <hr className="modal-hr" />
                <label className="m-label">Yangi parol (ixtiyoriy)</label>
                
                <div className="f-input-group">
                  <Lock className="f-input-icon" size={18} />
                  <input
                    type={showPass ? "text" : "password"}
                    className="name-input custom-p"
                    placeholder="Yangi kodni kiriting"
                    value={profileData.newPass}
                    onChange={e => setProfileData({...profileData, newPass: e.target.value})}
                  />
                  <div className="eye-icon" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>

                <div className="f-input-group">
                  <Lock className="f-input-icon" size={18} />
                  <input
                    type={showPass ? "text" : "password"}
                    className="name-input custom-p"
                    placeholder="Parolni tasdiqlang"
                    value={profileData.confirmPass}
                    onChange={e => setProfileData({...profileData, confirmPass: e.target.value})}
                  />
                </div>

                <div className="modal-footer-btns">
                  <button type="button" className="btn-cancel-modal" onClick={() => setActiveModal(null)}>Bekor qilish</button>
                  <button type="submit" className="btn-save-modal dark-btn">Barchasini saqlash</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DANGER MODAL */}
      {activeModal === 'danger' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header danger-head">
              <h3 className="modal-title">Tasdiqlash</h3>
              <X onClick={() => setActiveModal(null)} className="close-icon" size={20} />
            </div>
            <div className="modal-body">
              <p className="danger-text">Haqiqatan ham barcha statistikani o'chirmoqchimisiz?</p>
              <div className="modal-footer-btns">
                <button className="btn-cancel-modal" onClick={() => setActiveModal(null)}>Bekor</button>
                <button className="btn-save-modal danger-btn" onClick={() => { clearAllData(); setActiveModal(null); toast.error("Tozalandi"); }}>Ha, o'chirilsin</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Direktor;