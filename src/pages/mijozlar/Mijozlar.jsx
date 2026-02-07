import React, { useState, useMemo } from 'react';
import { 
  Search, UserPlus, Edit, Trash2, X, AlertTriangle, 
  Printer, History, ShoppingCart, TrendingDown, TrendingUp, CheckCircle2 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; 
import html2pdf from 'html2pdf.js';
import { useData } from '../../DataContext';
import './mijozlar.css';

const Mijozlar = ({ open }) => {
  const { mijozlar, mijozQoshish, mijozOchirish, mijozYangilash, sotuvQoshish } = useData();

  // --- STATE-LAR ---
  const [qidiruvMatni, setQidiruvMatni] = useState('');
  const [filtrStatus, setFiltrStatus] = useState('all');
  const [tanlangan, setTanlangan] = useState(null);

  const [tahrirlashModalOchiq, setTahrirlashModalOchiq] = useState(false);
  const [ochirishModalOchiq, setOchirishModalOchiq] = useState(false);
  const [profilModalOchiq, setProfilModalOchiq] = useState(false);
  const [sotishModalOchiq, setSotishModalOchiq] = useState(false);

  const [sotuvData, setSotuvData] = useState({ mahsulot: '', miqdor: '', narx: '' });
  const [yangiMijozState, setYangiMijozState] = useState({ 
    ism: '', telefon: '+998', qarzdorlik: '', oxirgiXarid: '', status: true 
  });

  // --- PDF EXPORT ---
  const handleDownloadPDF = () => {
    const element = document.getElementById('pdf-content');
    const opt = {
      margin: 10,
      filename: `${tanlangan.ism}_hisobot.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
    toast.success("PDF yuklab olinmoqda...");
  };

  // --- FUNKSIYALAR ---

  const handleToggleStatus = (e, m) => {
    e.stopPropagation(); 
    mijozYangilash({ ...m, status: !m.status });
    toast.success(m.status ? "Mijoz nofaol qilindi" : "Mijoz faollashtirildi");
  };

  const handleMijozQoshish = () => {
    const ism = yangiMijozState.ism.trim();
    const tel = yangiMijozState.telefon.trim();

    // 1. Ism tekshiruvi
    if (!ism) {
      return toast.error("Ismni kiriting!");
    }
    // 2. Raqam +998 bilan boshlanishi tekshiruvi
    if (!tel.startsWith('+998')) {
      return toast.error("Raqam +998 bilan boshlanishi shart!");
    }
    // 3. Uzunlik tekshiruvi
    if (tel.length !== 13) {
      return toast.error("Raqam 13 ta belgidan iborat bo'lishi shart!");
    }

    const qarz = yangiMijozState.qarzdorlik === '' ? 0 : Number(yangiMijozState.qarzdorlik);

    const yangi = { 
        ...yangiMijozState, 
        id: Date.now(), 
        ism: ism,
        qarzdorlik: qarz, 
        tolovTarixi: [] 
    };
    
    mijozQoshish(yangi);
    setYangiMijozState({ ism: '', telefon: '+998', qarzdorlik: '', oxirgiXarid: '', status: true });
    toast.success("Mijoz qo'shildi!");
  };

  const handleMijozYangilash = () => {
    if (!tanlangan.ism.trim()) return toast.error("Ism bo'sh bo'lmasin");
    mijozYangilash({ ...tanlangan, qarzdorlik: Number(tanlangan.qarzdorlik) });
    setTahrirlashModalOchiq(false);
    toast.success("Ma'lumotlar yangilandi");
  };

  const handleSotuvBajarish = () => {
    if (!sotuvData.mahsulot || !sotuvData.miqdor || !sotuvData.narx) {
      return toast.error("Ma'lumotlarni to'liq kiriting!");
    }
    
    const jamiSumma = Number(sotuvData.miqdor) * Number(sotuvData.narx);
    const joriySana = new Date().toISOString().split('T')[0];

    const yangilanganMijoz = {
      ...tanlangan,
      qarzdorlik: Number(tanlangan.qarzdorlik) + jamiSumma,
      oxirgiXarid: joriySana,
      tolovTarixi: [
        { 
          sana: new Date().toLocaleDateString(), 
          miqdor: `+${jamiSumma.toLocaleString()} so'm`,
          izoh: `${sotuvData.mahsulot} (${sotuvData.miqdor} kg)`
        },
        ...(tanlangan.tolovTarixi || [])
      ]
    };
    
    // Global moliya/sotuv bazasiga ham qo'shamiz
    sotuvQoshish({
      id: Date.now(),
      mijozId: tanlangan.id,
      mijozIsmi: tanlangan.ism,
      mahsulot: sotuvData.mahsulot,
      summa: jamiSumma,
      sana: joriySana
    });

    mijozYangilash(yangilanganMijoz);
    setSotishModalOchiq(false);
    setSotuvData({ mahsulot: '', miqdor: '', narx: '' });
    toast.success("Sotuv muvaffaqiyatli saqlandi!");
  };

  const getBalansHolati = (miqdor) => {
    const val = Number(miqdor);
    if (val > 0) return { tekst: "Qarzdor (-)", rang: "text-red", icon: <TrendingDown size={16}/> };
    if (val < 0) return { tekst: "Haqdor (+)", rang: "text-green", icon: <TrendingUp size={16}/> };
    return { tekst: "0 (Qarzsiz)", rang: "text-blue", icon: <CheckCircle2 size={16}/> };
  };

  const formatBalans = (miqdor) => {
    const val = Number(miqdor);
    if (val > 0) return `-${val.toLocaleString()}`;
    if (val < 0) return `+${Math.abs(val).toLocaleString()}`;
    return "0";
  };

  const filtrlangan = useMemo(() => {
    return mijozlar.filter(m => {
      const qidiruvMos = m.ism.toLowerCase().includes(qidiruvMatni.toLowerCase()) || m.telefon.includes(qidiruvMatni);
      if (filtrStatus === 'debt') return qidiruvMos && m.qarzdorlik > 0;
      return qidiruvMos;
    });
  }, [mijozlar, qidiruvMatni, filtrStatus]);

  return (
    <div className={`mijozlar-sahifa ${open ? 'sidebar-ochiq' : 'sidebar-yopiq'}`}>
      <Toaster position="top-right" />
      <div className="konteyner">
        <div className="header">
          <div className="header-icon"><UserPlus size={20} /></div>
          <h1>Mijozlar Bazasi</h1>
        </div>

        {/* QO'SHISH CARD */}
        <div className="card">
          <div className="card-title">Yangi mijoz qo'shish</div>
          <div className="input-guruhi">
            <input className="input-style" placeholder="F.I.O" value={yangiMijozState.ism} onChange={e => setYangiMijozState({...yangiMijozState, ism: e.target.value})} />
            <input className="input-style" placeholder="Telefon (+998XXXXXXXXX)" maxLength={13} value={yangiMijozState.telefon} onChange={e => setYangiMijozState({...yangiMijozState, telefon: e.target.value})} />
            <input className="input-style" type="number" placeholder="Boshlang'ich qarz" value={yangiMijozState.qarzdorlik} onChange={e => setYangiMijozState({...yangiMijozState, qarzdorlik: e.target.value})} />
            <input className="input-style" type="date" value={yangiMijozState.oxirgiXarid} onChange={e => setYangiMijozState({...yangiMijozState, oxirgiXarid: e.target.value})} />
          </div>
          <button className="btn-blue btn-full" onClick={handleMijozQoshish}>Qo'shish</button>
        </div>

        {/* FILTR VA JADVAL */}
        <div className="card">
          <div className="filtr-wrapper">
            <div className="qidiruv-blok">
              <Search className="qidiruv-icon" size={18} />
              <input className="input-style pl-icon" placeholder="Qidiruv..." onChange={e => setQidiruvMatni(e.target.value)} />
            </div>
            <select className="input-style select-filtr" value={filtrStatus} onChange={(e) => setFiltrStatus(e.target.value)}>
              <option value="all">Hammasi</option>
              <option value="debt">Qarzdorlar</option>
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
                  <tr key={m.id} className={m.status ? '' : 'inactive-row'}>
                    <td className={`font-medium ${m.status ? 'ism-active' : ''}`} onClick={() => { if(m.status){ setTanlangan(m); setProfilModalOchiq(true); }}}>
                      {m.ism}
                    </td>
                    <td>{m.telefon}</td>
                    <td>
                      <div className={`flex-col ${getBalansHolati(m.qarzdorlik).rang}`}>
                        <span className="font-bold">{formatBalans(m.qarzdorlik)} so'm</span>
                        <small className="flex-center" style={{gap: '4px'}}>{getBalansHolati(m.qarzdorlik).icon} {getBalansHolati(m.qarzdorlik).tekst}</small>
                      </div>
                    </td>
                    <td>{m.oxirgiXarid || '---'}</td>
                    <td className="text-center switch-td">
                      <button className={`switch ${m.status ? 'switch-on' : 'switch-off'}`} onClick={(e) => handleToggleStatus(e, m)}>
                        <span className={`knopka ${m.status ? 'knopka-on' : 'knopka-off'}`} />
                      </button>
                    </td>
                    <td className="text-center actions-td">
                      <div className="flex-center">
                        <button className="btn-blue btn-icon" onClick={() => {setTanlangan(m); setSotishModalOchiq(true);}}><ShoppingCart size={14}/></button>
                        <button className="btn-blue btn-icon" onClick={() => {setTanlangan(m); setTahrirlashModalOchiq(true);}}><Edit size={14}/></button>
                        <button className="btn-blue btn-red btn-icon" onClick={() => {setTanlangan(m); setOchirishModalOchiq(true);}}><Trash2 size={14}/></button>
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

      {/* 1. TAHRIRLASH */}
      {tahrirlashModalOchiq && tanlangan && (
        <div className="modal-parda">
          <div className="modal-oyna">
            <div className="modal-header"><span>Mijozni Tahrirlash</span><X className="cursor-pointer" onClick={() => setTahrirlashModalOchiq(false)} /></div>
            <div className="modal-body">
              <label className="text-gray">Ism sharifi</label>
              <input className="input-style mb-2" value={tanlangan.ism} onChange={e => setTanlangan({...tanlangan, ism: e.target.value})} />
              <label className="text-gray">Telefon</label>
              <input className="input-style mb-2" value={tanlangan.telefon} onChange={e => setTanlangan({...tanlangan, telefon: e.target.value})} />
              <label className="text-gray">Joriy Qarz (so'm)</label>
              <input className="input-style mb-4" type="number" value={tanlangan.qarzdorlik} onChange={e => setTanlangan({...tanlangan, qarzdorlik: e.target.value})} />
              <button className="btn-blue btn-full" onClick={handleMijozYangilash}>O'zgarishlarni Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. O'CHIRISH */}
      {ochirishModalOchiq && tanlangan && (
        <div className="modal-parda">
          <div className="modal-oyna modal-delete">
            <div className="modal-body text-center">
              <AlertTriangle size={48} color="#ef4444" style={{margin: '0 auto 15px'}} />
              <h3>O'chirishni tasdiqlaysizmi?</h3>
              <p><b>{tanlangan.ism}</b> bazadan o'chiriladi.</p>
              <div className="flex-center delete-btns" style={{marginTop: '20px', gap: '10px'}}>
                <button className="btn-cancel" onClick={() => setOchirishModalOchiq(false)}>Bekor qilish</button>
                <button className="btn-red-confirm" onClick={() => {mijozOchirish(tanlangan.id); setOchirishModalOchiq(false); toast.error("Mijoz o'chirildi");}}>Ha, o'chirilsin</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SOTUV */}
      {sotishModalOchiq && tanlangan && (
        <div className="modal-parda">
          <div className="modal-oyna">
            <div className="modal-header"><span>Yangi Sotuv: {tanlangan.ism}</span><X className="cursor-pointer" onClick={() => setSotishModalOchiq(false)} /></div>
            <div className="modal-body">
              <label className="text-gray">Mahsulot</label>
              <select className="input-style mb-2 select-sotuv" value={sotuvData.mahsulot} onChange={e => setSotuvData({...sotuvData, mahsulot: e.target.value})}>
                <option value="">Tanlang...</option>
                <option value="Mol go'shti">Mol go'shti</option>
                <option value="Qo'y go'shti">Qo'y go'shti</option>
                <option value="Kolbasa">Kolbasa</option>
              </select>
              <div className="input-guruhi">
                <div>
                   <label className="text-gray">Miqdori (kg)</label>
                   <input type="number" className="input-style" placeholder="0.0" value={sotuvData.miqdor} onChange={e => setSotuvData({...sotuvData, miqdor: e.target.value})} />
                </div>
                <div>
                   <label className="text-gray">Narxi (1kg)</label>
                   <input type="number" className="input-style" placeholder="0" value={sotuvData.narx} onChange={e => setSotuvData({...sotuvData, narx: e.target.value})} />
                </div>
              </div>
              <div className="total-box">
                Jami: {(Number(sotuvData.miqdor) * Number(sotuvData.narx)).toLocaleString()} so'm
              </div>
              <button className="btn-blue btn-full" onClick={handleSotuvBajarish}>Sotuvni yakunlash</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PROFIL */}
      {profilModalOchiq && tanlangan && (
        <div className="modal-parda" onClick={() => setProfilModalOchiq(false)}>
          <div className="modal-oyna profil-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span>Mijoz Ma'lumotlari</span>
              <X className="cursor-pointer" onClick={() => setProfilModalOchiq(false)} />
            </div>
            <div className="modal-body">
              <div id="pdf-content">
                <div className="profil-grid">
                  <div className="profil-info-card text-center">
                    <div className="avatar-big" style={{margin: '0 auto 15px'}}>{tanlangan.ism[0]}</div>
                    <h2 style={{fontSize: '1.4rem'}}>{tanlangan.ism}</h2>
                    <p className="text-gray">{tanlangan.telefon}</p>
                    <div className={`total-box ${getBalansHolati(tanlangan.qarzdorlik).rang}`} style={{fontSize: '1.3rem', marginTop: '15px'}}>
                      {formatBalans(tanlangan.qarzdorlik)} so'm
                    </div>
                  </div>
                  
                  <div className="profil-history-card">
                    <h4 style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px'}}>
                      <History size={18}/> Amallar tarixi
                    </h4>
                    <div className="history-list">
                      {tanlangan.tolovTarixi && tanlangan.tolovTarixi.length > 0 ? (
                        tanlangan.tolovTarixi.map((t, i) => (
                          <div key={i} className="history-item flex-between" style={{borderLeft: '3px solid #2563eb', padding: '10px', marginBottom: '8px', background: '#f8fafc'}}>
                            <div className="flex-col">
                              <span style={{fontWeight: '600'}}>{t.sana}</span>
                              <small className="text-gray">{t.izoh}</small>
                            </div>
                            <b className="text-red">{t.miqdor}</b>
                          </div>
                        ))
                      ) : (
                        <p className="no-data">Hozircha amallar mavjud emas</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <button className="btn-blue btn-full" style={{marginTop: '20px', gap: '8px'}} onClick={handleDownloadPDF}>
                <Printer size={16}/> PDF variantda yuklab olish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mijozlar;