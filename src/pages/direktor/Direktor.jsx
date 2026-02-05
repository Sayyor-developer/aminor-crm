import React, { useState } from 'react';
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
import { toast } from 'react-toastify';
import './direktor.css';

const data = [
  { name: 'Dush', sales: 4000, prod: 2400 },
  { name: 'Sesh', sales: 3000, prod: 1398 },
  { name: 'Chor', sales: 2000, prod: 9800 },
  { name: 'Pay', sales: 2780, prod: 3908 },
  { name: 'Jum', sales: 1890, prod: 4800 },
  { name: 'Shan', sales: 2390, prod: 3800 },
  { name: 'Yak', sales: 3490, prod: 4300 },
];

const Direktor = ({ open }) => {
  const [fullname, setFullname] = useState('Alisher Valiyev');
  const [isEditingName, setIsEditingName] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');

  const handleSaveName = () => {
    setIsEditingName(false);
    toast.success('F.I.O muvaffaqiyatli o\'zgartirildi');
  };

  const handleChangeCode = (e) => {
    e.preventDefault();
    if (!currentCode || !newCode || !confirmCode) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }
    if (newCode !== confirmCode) {
      toast.error('Yangi kodlar mos kelmadi');
      return;
    }
    toast.success('Kirish kodi muvaffaqiyatli yangilandi');
    setCurrentCode('');
    setNewCode('');
    setConfirmCode('');
  };

  return (
    <div className={`direktor-page ${open ? 'shifted' : 'collapsed'}`}>
      <div className="direktor-wrapper">
        
        {/* Breadcrumb Section */}
        <div className="breadcrumb-nav">
          <span>Dashboard</span>
          <ChevronRight size={14} />
          <span className="active-link">Direktor Sozlamalari</span>
        </div>

        {/* Statistik Kartochkalar */}
        <div className="stats-container">
          {[
            { label: 'Oylik Daromad', value: '$124,500', icon: DollarSign, color: 'emerald' },
            { label: 'Faol Mijozlar', value: '1,240', icon: Users, color: 'blue' },
            { label: 'Mahsulotlar', value: '850', icon: Package, color: 'amber' },
            { label: 'Samaradorlik', value: '94%', icon: TrendingUp, color: 'purple' },
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
          {/* Chap tomondagi asosiy qism */}
          <div className="left-column">
            
            {/* Ismni tahrirlash */}
            <div className="main-card">
              <div className="card-top">
                <div className="title-box">
                  <User size={20} className="red-icon" />
                  <h3>Direktor Ma'lumotlari</h3>
                </div>
                <button 
                  className="action-btn"
                  onClick={() => isEditingName ? handleSaveName() : setIsEditingName(true)}
                >
                  {isEditingName ? <Save size={16} /> : <Settings size={16} />}
                  {isEditingName ? "Saqlash" : "O'zgartirish"}
                </button>
              </div>
              <div className="card-content">
                <p className="field-label">To'liq ism (Fullname)</p>
                {isEditingName ? (
                  <input 
                    type="text" 
                    className="name-input"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                  />
                ) : (
                  <div className="profile-info">
                    <div className="avatar-circle">{fullname.charAt(0)}</div>
                    <span className="fullname-text">{fullname}</span>
                  </div>
                )}
                <p className="sub-text">Ushbu ism tizimdagi barcha hisobotlarda aks etadi.</p>
              </div>
            </div>

            {/* Grafika/Analitika */}
            <div className="main-card">
              <div className="card-top">
                <div className="title-box">
                  <BarChart3 size={20} className="red-icon" />
                  <h3>Sotuvlar Tahlili</h3>
                </div>
              </div>
              <div className="card-content">
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9B2226" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#9B2226" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#9B2226" 
                        strokeWidth={3} 
                        fill="url(#colorSales)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* O'ng tomondagi xavfsizlik qismi */}
          <div className="right-column">
            <div className="main-card">
              <div className="card-top">
                <div className="title-box">
                  <Lock size={20} className="red-icon" />
                  <h3>Kod o'zgartirish</h3>
                </div>
              </div>
              <form className="card-content security-form" onSubmit={handleChangeCode}>
                <div className="input-item">
                  <label>Joriy kod</label>
                  <input 
                    type="password" 
                    placeholder="••••••"
                    value={currentCode}
                    onChange={(e) => setCurrentCode(e.target.value)}
                  />
                </div>
                <div className="input-item">
                  <label>Yangi kod</label>
                  <input 
                    type="password" 
                    placeholder="••••••"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                  />
                </div>
                <div className="input-item">
                  <label>Tasdiqlash</label>
                  <input 
                    type="password" 
                    placeholder="••••••"
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value)}
                  />
                </div>
                <button type="submit" className="save-code-btn">
                  Kodni yangilash
                </button>
              </form>
            </div>

            {/* Pastki banner */}
            <div className="red-banner">
              <div className="banner-txt">
                <h4>Xavfsizlik!</h4>
                <p>Kodni doimiy yangilab turishni tavsiya qilamiz.</p>
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