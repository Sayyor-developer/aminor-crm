import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, UserPlus, Edit, Trash2, X, AlertTriangle,
  TrendingDown, TrendingUp, CheckCircle2, Plus
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useData } from '../../DataContext';
import './mijozlar.css';

const Mijozlar = ({ open }) => {
  const navigate = useNavigate();
  const { 
    mijozlar = [], 
    mijozQoshish, 
    mijozOchirish, 
    mijozYangilash, 
  } = useData();

  // --- FORMATLASH VA TOZALASH FUNKSIYALARI ---
  const formatNumber = (num) => {
    if (!num && num !== 0) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const cleanNumber = (str) => {
    return String(str).replace(/\s/g, "");
  };

  const getBugungiSana = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // --- STATE-LAR ---
  const [qidiruvMatni, setQidiruvMatni] = useState('');
  const [filtrStatus, setFiltrStatus] = useState('all');
  const [tanlangan, setTanlangan] = useState(null);

  const [tahrirlashModalOchiq, setTahrirlashModalOchiq] = useState(false);
  const [ochirishModalOchiq, setOchirishModalOchiq] = useState(false);
  const [yangiMijozModalOchiq, setYangiMijozModalOchiq] = useState(false);

  const [yangiMijozState, setYangiMijozState] = useState({
    ism: '',
    telefon: '+998',
    qarzdorlik: '',
    oxirgiXarid: getBugungiSana(),
    status: true
  });

  // --- ASOSIY FUNKSIYALAR ---

  const handleMijozQoshish = async () => {
    const ism = yangiMijozState.ism.trim();
    const tel = yangiMijozState.telefon.trim();

    if (!ism) return toast.error("Ismni kiriting!");

    const obyekt = {
      ism: ism,
      telefon: tel,
      qarzdorlik: yangiMijozState.qarzdorlik === '' ? 0 : Number(cleanNumber(yangiMijozState.qarzdorlik)),
      status: true,
      manzil: '', 
      oxirgixarid: yangiMijozState.oxirgiXarid || getBugungiSana(), 
    };

    try {
      await mijozQoshish(obyekt); 
      setYangiMijozState({
        ism: '',
        telefon: '+998',
        qarzdorlik: '',
        oxirgiXarid: getBugungiSana(),
        status: true
      });
      setYangiMijozModalOchiq(false);
      toast.success("Mijoz muvaffaqiyatli qo'shildi!");
    } catch (error) {
       console.error("Qo'shishda xato:", error.message);
       if (error.message.includes('row-level security')) {
         toast.error("Baza ruxsat bermadi (RLS Policy xatosi)!");
       } else {
         toast.error("Xato: " + error.message);
       }
    }
  };

  const handleMijozYangilash = async () => {
    if (!tanlangan.ism.trim()) return toast.error("Ism bo'sh bo'lmasin");
    
    try {
      await mijozYangilash({ 
        ...tanlangan, 
        qarzdorlik: Number(cleanNumber(tanlangan.qarzdorlik)) 
      });
      setTahrirlashModalOchiq(false);
      toast.success("Ma'lumotlar yangilandi");
    } catch (error) {
      toast.error("Yangilashda xatolik: " + error.message);
    }
  };

  const handleToggleStatus = async (e, m) => {
    e.stopPropagation();
    try {
      await mijozYangilash({ ...m, status: !m.status });
      toast.success(m.status ? "Mijoz nofaol qilindi" : "Mijoz faollashtirildi");
    } catch (err) {
      toast.error("Statusni o'zgartirishda xato!");
    }
  };

  const getBalansHolati = (miqdor) => {
    const val = Number(miqdor);
    if (val > 0) return { tekst: "Qarzdor (-)", rang: "text-red", icon: <TrendingDown size={16} /> };
    if (val < 0) return { tekst: "Haqdor (+)", rang: "text-green", icon: <TrendingUp size={16} /> };
    return { tekst: "0 (Qarzsiz)", rang: "text-blue", icon: <CheckCircle2 size={16} /> };
  };

  const formatBalans = (miqdor) => {
    const val = Number(miqdor);
    if (val > 0) return `-${val.toLocaleString()}`;
    if (val < 0) return `+${Math.abs(val).toLocaleString()}`;
    return "0";
  };

  const filtrlangan = useMemo(() => {
    return (mijozlar || []).filter(m => {
      const qidiruvMos = (m.ism || "").toLowerCase().includes(qidiruvMatni.toLowerCase()) || 
                         (m.telefon || "").includes(qidiruvMatni);
      if (filtrStatus === 'debt') return qidiruvMos && m.qarzdorlik > 0;
      if (filtrStatus === 'no-debt') return qidiruvMos && m.qarzdorlik === 0;
      return qidiruvMos;
    });
  }, [mijozlar, qidiruvMatni, filtrStatus]);

  return (
    <div className={`mijozlar-sahifa ${open ? 'sidebar-ochiq' : 'sidebar-yopiq'}`}>
      <Toaster position="top-right" />
      <div className="konteyner">
        <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-10)' }}>
            <div className="header-icon"><UserPlus size={20} /></div>
            <h1>Mijozlar Bazasi</h1>
          </div>
          <button className="btn-blue" style={{ width: 'auto', padding: 'var(--gap-10) 20px' }} onClick={() => setYangiMijozModalOchiq(true)}>
            <Plus size={18} /> Yangi mijoz qo'shish
          </button>
        </div>

        <div className="card">
          <div className="filtr-wrapper">
            <div className="qidiruv-blok">
              <Search className="qidiruv-icon" size={18} />
              <input className="input-style pl-icon" placeholder="Qidiruv..." onChange={e => setQidiruvMatni(e.target.value)} />
            </div>
            <select className="input-style select-filtr" value={filtrStatus} onChange={(e) => setFiltrStatus(e.target.value)}>
              <option value="all">Hammasi</option>
              <option value="debt">Qarzdorlar</option>
              <option value="no-debt">Qarzsizlar</option>
            </select>
          </div>

          <div className="jadval-qobiq">
            <table className="mijoz-table">
              <thead>
                <tr>
                  <th>F.I.O</th><th>Telefon</th><th>Balans / Holat</th><th>Oxirgi xarid</th><th className="text-center">Status</th><th className="text-center">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filtrlangan.map(m => (
                  <tr 
                    key={m.id} 
                    className={`${m.status ? 'mijoz-row-active' : 'inactive-row'}`}
                    style={{ cursor: m.status ? 'pointer' : 'default' }}
                  >
                    <td 
                      className={`font-medium ${m.status ? 'ism-active' : ''}`}
                      onClick={() => { if (m.status) navigate(`/mijozlar/${m.id}`); }}
                    >
                      {m.ism}
                    </td>
                    <td onClick={() => { if (m.status) navigate(`/mijozlar/${m.id}`); }}>
                      {m.telefon}
                    </td>
                    <td>
                      <div className={`flex-col ${getBalansHolati(m.qarzdorlik).rang}`}>
                        <span className="font-bold">{formatBalans(m.qarzdorlik)} so'm</span>
                        <small className="flex-center" style={{ gap: '4px' }}>{getBalansHolati(m.qarzdorlik).icon} {getBalansHolati(m.qarzdorlik).tekst}</small>
                      </div>
                    </td>
                    <td>{m.oxirgixarid || '---'}</td>
                    <td className="text-center switch-td">
                      <button className={`switch ${m.status ? 'switch-on' : 'switch-off'}`} onClick={(e) => handleToggleStatus(e, m)}>
                        <span className={`knopka ${m.status ? 'knopka-on' : 'knopka-off'}`} />
                      </button>
                    </td>
                    <td className="text-center actions-td">
                      <div className="flex-center">
                        <button className="m-btn-blue m-btn-icon" onClick={(e) => { e.stopPropagation(); setTanlangan(m); setTahrirlashModalOchiq(true); }}><Edit size={14} /></button>
                        <button className="m-btn-blue m-btn-red m-btn-icon" onClick={(e) => { e.stopPropagation(); setTanlangan(m); setOchirishModalOchiq(true); }}><Trash2 size={14} /></button>
                        
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODALLAR --- */}
      {yangiMijozModalOchiq && (
        <div className="modal-parda">
          <div className="modal-oyna">
            <div className="modal-header">
              <span>Yangi mijoz qo'shish</span>
              <X className="cursor-pointer" onClick={() => setYangiMijozModalOchiq(false)} />
            </div>
            <div className="modal-body">
              <label className="text-gray">Ism sharifi</label>
              <input className="input-style mb-2" placeholder="F.I.O" value={yangiMijozState.ism} onChange={e => setYangiMijozState({ ...yangiMijozState, ism: e.target.value })} />
              
              <label className="text-gray">Telefon raqami</label>
              <input className="input-style mb-2" placeholder="Telefon (+998XXXXXXXXX)" maxLength={13} value={yangiMijozState.telefon} onChange={e => setYangiMijozState({ ...yangiMijozState, telefon: e.target.value })} />
              
              <div className="input-guruhi mb-2" style={{ display: 'flex', gap: 'var(--gap-10)' }}>
                <div style={{ flex: 1 }}>
                  <label className="text-gray">Boshlang'ich qarz</label>
                  <input className="input-style" style={{ width: '' }} type="text" placeholder="0" value={formatNumber(yangiMijozState.qarzdorlik)} onChange={e => setYangiMijozState({ ...yangiMijozState, qarzdorlik: cleanNumber(e.target.value) })} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="text-gray">Sana</label>
                  <input className="input-style" style={{ width: '100%' }} type="date" value={yangiMijozState.oxirgiXarid} onChange={e => setYangiMijozState({ ...yangiMijozState, oxirgiXarid: e.target.value })} />
                </div>
              </div>
              <button className="btn-blue btn-full mt-2" onClick={handleMijozQoshish}>Mijozni Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {tahrirlashModalOchiq && tanlangan && (
        <div className="modal-parda">
          <div className="modal-oyna">
            <div className="modal-header"><span>Mijozni Tahrirlash</span><X className="cursor-pointer" onClick={() => setTahrirlashModalOchiq(false)} /></div>
            <div className="modal-body">
              <label className="text-gray">Ism sharifi</label>
              <input className="input-style mb-2" value={tanlangan.ism} onChange={e => setTanlangan({ ...tanlangan, ism: e.target.value })} />
              
              <label className="text-gray">Telefon</label>
              <input className="input-style mb-2" value={tanlangan.telefon} onChange={e => setTanlangan({ ...tanlangan, telefon: e.target.value })} />
              
              <label className="text-gray">Joriy Qarz (so'm)</label>
              <input className="input-style mb-4" type="text" value={formatNumber(tanlangan.qarzdorlik)} onChange={e => setTanlangan({ ...tanlangan, qarzdorlik: cleanNumber(e.target.value) })} />
              
              <button className="btn-blue btn-full" onClick={handleMijozYangilash}>O'zgarishlarni Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {ochirishModalOchiq && tanlangan && (
        <div className="modal-parda">
          <div className="modal-oyna modal-delete">
            <div className="modal-body text-center">
              <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 15px' }} />
              <h3>O'chirishni tasdiqlaysizmi?</h3>
              <p><b>{tanlangan.ism}</b> bazadan o'chiriladi.</p>
              <div className="flex-center delete-btns" style={{ marginTop: '20px', gap: 'var(--gap-10)' }}>
                <button className="btn-cancel" onClick={() => setOchirishModalOchiq(false)}>Bekor qilish</button>
                <button className="btn-red-confirm" onClick={async () => { 
                  try {
                    await mijozOchirish(tanlangan.id); 
                    setOchirishModalOchiq(false); 
                    toast.success("Mijoz o'chirildi"); 
                  } catch (err) {
                    toast.error("O'chirishda xato!");
                  }
                }}>Ha, o'chirilsin</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mijozlar;