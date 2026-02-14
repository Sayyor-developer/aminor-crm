import React, { useState, useMemo } from 'react';
import {
  User, Settings, BarChart3, Lock,
  TrendingUp, Package, Users, DollarSign, /* Trash2,
  AlertTriangle, */ X, Eye, EyeOff
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
  const [tempName, setTempName] = useState('');
  const [vaqtFiltr, setVaqtFiltr] = useState('7kun');
  const [activeModal, setActiveModal] = useState(null);

  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);

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
        label: item.sana.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' }),
        qiymat: item.qiymat,
        tur: item.tur,
      }));

    return {
      daromad: jamiKirim.toLocaleString(),
      mijozlar: mijozlar.length.toLocaleString(),
      qarz: jamiQarzlar.toLocaleString(),
      chartData: chartData.length > 0 ? chartData : [{ label: 'Ma\'lumot yo\'q', qiymat: 0 }],
      chartWidth: chartData.length > 6 ? `${chartData.length * 80}px` : '100%'
    };
  }, [sotuvlar, products, mijozlar, jamiKirim, jamiQarzlar, vaqtFiltr]);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setFullname(tempName);
      setActiveModal(null);
      toast.success("Profil yangilandi!");
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.new.length < 4) {
      toast.error("Parol kamida 4 ta belgidan iborat bo'lsin!");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("Parollar mos kelmadi!");
      return;
    }
    toast.success("Parol yangilandi!");
    setPasswords({ new: '', confirm: '' });
    setShowPass(false);
    setActiveModal(null);
  };

 /*  const handleConfirmReset = () => {
    if (clearAllData) {
      clearAllData();
      setActiveModal(null);
      toast.error("Ma'lumotlar tozalandi!");
    }
  }; */

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
            <button className="action-btn profile-btn" onClick={() => { setTempName(fullname); setActiveModal('profile'); }}>
              <User size={18} /> {fullname}
            </button>
            <button className="action-btn security-btn" onClick={() => setActiveModal('security')}>
              <Lock size={18} /> Xavfsizlik
            </button>
          </div>
        </header>

        <div className="d-stats-container">
          {[
            { label: 'Umumiy Savdo', value: `${stats.daromad} so'm`, icon: DollarSign, color: 'emerald' },
            { label: 'Jami Mijozlar', value: stats.mijozlar, icon: Users, color: 'blue' },
            { label: 'Kutilayotgan Qarz', value: `${stats.qarz} so'm`, icon: Package, color: 'amber' },
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
        </div>

        <div className="main-card">
          <div className="card-top">
            <div className="title-box">
              <BarChart3 size={20} className="red-icon" />
              <h3>Biznes Dinamikasi</h3>
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    <Tooltip />
                    <Area type="monotone" dataKey="qiymat" stroke="var(--primary-color)" strokeWidth={3} fill="url(#colorDir)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

       {/*  <div className="main-card danger-zone-card">
          <div className="card-top">
            <div className="title-box">
              <AlertTriangle size={20} className="red-icon" />
              <h3>Xavfli Hudud</h3>
            </div>
          </div>
          <div className="card-content danger-content">
            <p>Statistikani tozalash ma'lumotlarni butunlay o'chirib yuboradi.</p>
            <button className="delete-all-btn" onClick={() => setActiveModal('danger')}>
              <Trash2 size={18} /> Ma'lumotlarni o'chirish
            </button>
          </div>
        </div> */}
      </div>

      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content">
            <div className={`modal-header ${activeModal === 'danger' ? 'danger-head' : 'dark-head'}`}>
              <h3 className="modal-title">
                {activeModal === 'profile' ? "Profilni tahrirlash" :
                  activeModal === 'security' ? "Parolni yangilash" : "Tasdiqlash"}
              </h3>
              <X onClick={() => setActiveModal(null)} className="close-icon" size={20} />
            </div>

            <div className="modal-body">
              {activeModal === 'profile' && (
                <form onSubmit={handleProfileUpdate}>
                  <div className="f-input-group">
                    <User className="f-input-icon" size={18} />
                    <input
                      className="name-input custom-p"
                      placeholder="Direktor F.I.O"
                      value={tempName}
                      onChange={e => setTempName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="modal-footer-btns">
                    <button type="button" className="btn-cancel-modal" onClick={() => setActiveModal(null)}>Bekor qilish</button>
                    <button type="submit" className="btn-save-modal">Saqlash</button>
                  </div>
                </form>
              )}

              {activeModal === 'security' && (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="f-input-group">
                    <Lock className="f-input-icon" size={18} />
                    <input
                      type={showPass ? "text" : "password"}
                      className="name-input custom-p"
                      placeholder="Yangi kod"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      required
                    />
                    <div
                      className="eye-icon"
                      onClick={(e) => {
                        e.stopPropagation(); // Mana shu qator modal yopilib ketishini to'xtatadi
                        setShowPass(!showPass);
                      }}
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                  </div>

                  <div className="f-input-group">
                    <Lock className="f-input-icon" size={18} />
                    <input
                      type={showPass ? "text" : "password"}
                      className="name-input custom-p"
                      placeholder="Qayta kiriting"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      required
                    />
                  </div>

                  <div className="modal-footer-btns">
                    <button type="button" className="btn-cancel-modal" onClick={() => { setActiveModal(null); setShowPass(false); }}>Bekor qilish</button>
                    <button type="submit" className="btn-save-modal dark-btn">Yangilash</button>
                  </div>
                </form>
              )}

              {/* {activeModal === 'danger' && (
                <div className="delete-confirm-box">
                  <p className="danger-text">Haqiqatan ham barcha statistikani o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.</p>
                  <div className="modal-footer-btns">
                    <button className="btn-cancel-modal" onClick={() => setActiveModal(null)}>Bekor qilish</button>
                    <button className="btn-save-modal danger-btn" onClick={handleConfirmReset}>Ha, o'chirilsin</button>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Direktor;