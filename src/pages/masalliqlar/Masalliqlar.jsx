import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, 
  X, AlertTriangle, Package, Printer, History, ShoppingCart
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import './masalliqlar.css';

const Masalliqlar = ({ open }) => {
  // --- BAZA (Masalliqlar va Tarix) ---
  const [masalliqlar, setMasalliqlar] = useState([
    { id: 1, nomi: 'Bug\'doy uni', miqdori: 500, birligi: 'kg', narxi: 5000, zavod: 'Toshkent Un Zavodi', status: true },
    { id: 2, nomi: 'Shakar (Oq)', miqdori: 300, birligi: 'kg', narxi: 8500, zavod: 'Xorazm Shakar', status: true },
    { id: 3, nomi: 'Paxta yog\'i', miqdori: 150, birligi: 'litr', narxi: 16000, zavod: 'Farg\'ona Yog\'', status: false },
    { id: 4, nomi: 'Tuxum (S1)', miqdori: 2000, birligi: 'dona', narxi: 1200, zavod: 'Parranda Sanoat', status: true },
    { id: 5, nomi: 'Sut 3.2%', miqdori: 200, birligi: 'litr', narxi: 7000, zavod: 'Namangan Sut', status: true },
    { id: 16, nomi: 'Vanilin', miqdori: 10, birligi: 'kg', narxi: 100000, zavod: 'Pishiriq Zavod', status: true },
    // Sinab ko'rish uchun qo'shimcha ma'lumotlar
    { id: 6, nomi: 'Margarin', miqdori: 50, birligi: 'kg', narxi: 22000, zavod: 'Zavod 1', status: true },
    { id: 7, nomi: 'Tuz', miqdori: 100, birligi: 'kg', narxi: 2000, zavod: 'Zavod 2', status: true },
    { id: 8, nomi: 'Xamirturush', miqdori: 20, birligi: 'kg', narxi: 45000, zavod: 'Zavod 3', status: true },
    { id: 9, nomi: 'Kunjut', miqdori: 15, birligi: 'kg', narxi: 60000, zavod: 'Zavod 4', status: true },
    { id: 10, nomi: 'Asal', miqdori: 10, birligi: 'kg', narxi: 80000, zavod: 'Zavod 5', status: true },
    { id: 11, nomi: 'Yong\'oq', miqdori: 30, birligi: 'kg', narxi: 95000, zavod: 'Zavod 6', status: true },
  ]);

  const [tarix, setTarix] = useState([
    { id: 101, sana: '2026-02-07', nomi: 'Bug\'doy uni', miqdor: 100, summa: 500000, xodim: 'Admin' }
  ]);

  // --- INTERFEYS VA PAGINATION HOLATLARI ---
  const [qidiruvMatni, setQidiruvMatni] = useState('');
  const [joriyBet, setJoriyBet] = useState(1);
  const betdagiSoni = 10; // HAR BIR SAHIFADA 10 TA MAHSULOT

  const [tahrirlashModalOchiq, setTahrirlashModalOchiq] = useState(false);
  const [ochirishModalOchiq, setOchirishModalOchiq] = useState(false);
  const [buyurtmaModalOchiq, setBuyurtmaModalOchiq] = useState(false);
  const [tarixModalOchiq, setTarixModalOchiq] = useState(false);
  
  const [tanlangan, setTanlangan] = useState(null);
  const [yangiMasalliq, setYangiMasalliq] = useState({ 
    nomi: '', miqdori: '', birligi: 'kg', narxi: '', zavod: '', status: true 
  });

  // --- FILTRLASH MANTIQI ---
  const filtrlangan = useMemo(() => {
    return masalliqlar.filter(m =>
      m.nomi.toLowerCase().includes(qidiruvMatni.toLowerCase()) ||
      m.zavod.toLowerCase().includes(qidiruvMatni.toLowerCase())
    );
  }, [masalliqlar, qidiruvMatni]);

  // --- PAGINATION HISOB-KITOBI ---
  const jamiBetlar = Math.ceil(filtrlangan.length / betdagiSoni);
  
  const joriyMasalliqlar = useMemo(() => {
    const boshlanishIndeksi = (joriyBet - 1) * betdagiSoni;
    return filtrlangan.slice(boshlanishIndeksi, boshlanishIndeksi + betdagiSoni);
  }, [filtrlangan, joriyBet]);

  // --- FUNKSIYALAR ---
  const statusniOzgartirish = (id) => {
    setMasalliqlar(masalliqlar.map(m => m.id === id ? { ...m, status: !m.status } : m));
    toast.success("Holat yangilandi");
  };

  const masalliqQoshish = () => {
    if (!yangiMasalliq.nomi.trim()) { toast.error("Nomini kiriting!"); return; }
    const id = Date.now();
    setMasalliqlar([{ ...yangiMasalliq, id, miqdori: Number(yangiMasalliq.miqdori), narxi: Number(yangiMasalliq.narxi) }, ...masalliqlar]);
    setYangiMasalliq({ nomi: '', miqdori: '', birligi: 'kg', narxi: '', zavod: '', status: true });
    setJoriyBet(1);
    toast.success("Ro'yxatga qo'shildi!");
  };

  const buyurtmaBerish = () => {
    if (!tanlangan.yangiMiqdor || tanlangan.yangiMiqdor <= 0) {
      toast.error("Miqdorni kiriting!");
      return;
    }
    const jamiSumma = tanlangan.yangiMiqdor * tanlangan.narxi;
    const yangiKirim = {
      id: Date.now(),
      sana: new Date().toISOString().split('T')[0],
      nomi: tanlangan.nomi,
      miqdor: Number(tanlangan.yangiMiqdor),
      summa: jamiSumma,
      xodim: "Admin"
    };

    setTarix([yangiKirim, ...tarix]);
    setMasalliqlar(masalliqlar.map(m => 
      m.id === tanlangan.id ? { ...m, miqdori: m.miqdori + Number(tanlangan.yangiMiqdor) } : m
    ));
    setBuyurtmaModalOchiq(false);
    toast.success("Kirim qilindi!");
  };

  const tarixExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Kirim Tarixi", 14, 15);
    autoTable(doc, {
      startY: 22,
      head: [['Sana', 'Nomi', 'Miqdor', 'Summa']],
      body: tarix.map(t => [t.sana, t.nomi, t.miqdor, t.summa.toLocaleString()]),
    });
    doc.save("tarix.pdf");
  };

  const masalliqniYangilash = () => {
    setMasalliqlar(masalliqlar.map(m => m.id === tanlangan.id ? tanlangan : m));
    setTahrirlashModalOchiq(false);
    toast.success("Yangilandi!");
  };

  const tasdiqlanganOchirish = () => {
    setMasalliqlar(masalliqlar.filter(m => m.id !== tanlangan.id));
    setOchirishModalOchiq(false);
    toast.error("O'chirildi");
  };

  return (
    <div className={`m-page ${open ? 'm-sidebar-open' : 'm-sidebar-closed'}`}>
      <Toaster position="top-right" />
      <div className="m-container">
        
        {/* Sarlavha qismi */}
        <div className="m-title-area" style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <div className="m-main-icon"><Package size={22} /></div>
            <h1>Masalliqlar bo`limi (zavodga kirishi)</h1>
          </div>
          <button className="m-add-btn" style={{width: 'auto', background: 'var(--primary-color)'}} onClick={() => setTarixModalOchiq(true)}>
            <History size={18} /> Kirim Tarixi
          </button>
        </div>

        {/* Yangi masalliq qo'shish formasi */}
        <div className="m-data-card">
          <div className="m-card-subtitle">Yangi masalliq turi va birligini tanlash</div>
          <div className="m-input-row">
            <input className="m-custom-input" placeholder="Nomi" value={yangiMasalliq.nomi} onChange={e => setYangiMasalliq({ ...yangiMasalliq, nomi: e.target.value })} />
            <div className="m-split-input">
              <input className="m-custom-input" type="number" placeholder="Miqdor" value={yangiMasalliq.miqdori} onChange={e => setYangiMasalliq({ ...yangiMasalliq, miqdori: e.target.value })} />
              <select className="m-custom-select" value={yangiMasalliq.birligi} onChange={e => setYangiMasalliq({ ...yangiMasalliq, birligi: e.target.value })}>
                <option value="kg">kg</option>
                <option value="litr">litr</option>
                <option value="dona">dona</option>
              </select>
            </div>
            <input className="m-custom-input" type="number" placeholder="Narxi" value={yangiMasalliq.narxi} onChange={e => setYangiMasalliq({ ...yangiMasalliq, narxi: e.target.value })} />
            <input className="m-custom-input" placeholder="Zavod/Ta'minotchi" value={yangiMasalliq.zavod} onChange={e => setYangiMasalliq({ ...yangiMasalliq, zavod: e.target.value })} />
          </div>
          <button className="m-add-btn" onClick={masalliqQoshish}>
            <Plus size={18} /> Ro'yxatga qo'shish (tasdiqlash)
          </button>
        </div>

        {/* Jadval qismi */}
        <div className="m-data-card">
          <div className="m-search-box">
            <Search className="m-search-icon" size={20} />
            <input className="m-custom-input m-pl-40" placeholder="Qidirish..." onChange={e => { setQidiruvMatni(e.target.value); setJoriyBet(1); }} />
          </div>

          <div className="m-table-wrapper">
            <table className="m-data-table">
              <thead>
                <tr>
                  <th>Masalliq</th>
                  <th>Ombordagi miqdor</th>
                  <th>Narxi (so'm)</th>
                  <th>Ta'minotchi</th>
                  <th className="text-center">Active</th>
                  <th className="text-center">Sotib olish</th>
                  <th className="text-center">Boshqaruv</th>
                </tr>
              </thead>
              <tbody>
                {joriyMasalliqlar.length > 0 ? joriyMasalliqlar.map(m => (
                  <tr key={m.id} className={m.status ? 'm-row-active' : 'm-row-disabled'}>
                    <td className="m-font-bold">{m.nomi}</td>
                    <td>{m.miqdori} <span className="m-tag">{m.birligi}</span></td>
                    <td className="m-price-col">{m.narxi.toLocaleString()}</td>
                    <td>{m.zavod}</td>
                    <td className="text-center">
                      <div className={`m-toggle ${m.status ? 'm-toggle-on' : 'm-toggle-off'}`} onClick={() => statusniOzgartirish(m.id)}>
                        <div className="m-toggle-circle" />
                      </div>
                    </td>
                    <td className="text-center">
                      <button className="m-icon-btn" style={{background: 'var(--primary-color)', margin: '0 auto'}} onClick={() => { setTanlangan({...m, yangiMiqdor: ''}); setBuyurtmaModalOchiq(true); }}>
                        <ShoppingCart size={16} />
                      </button>
                    </td>
                    <td className="text-center">
                      <div className="m-action-flex">
                        <button className="m-icon-btn m-edit" onClick={() => { setTanlangan(m); setTahrirlashModalOchiq(true); }}><Edit size={16} /></button>
                        <button className="m-icon-btn m-delete" style={{background: 'var(--primary-color)'}} onClick={() => { setTanlangan(m); setOchirishModalOchiq(true); }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" className="m-empty-msg" style={{textAlign: 'center', padding: '20px'}}>Topilmadi.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* --- MANA PAGINATION QISMI (TO'LIQ) --- */}
          {jamiBetlar > 1 && (
            <div className="m-pagination-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px'}}>
              <span className="m-total-count" style={{color: '#64748b', fontSize: '14px'}}>
                Jami: <b>{filtrlangan.length}</b> tadan {(joriyBet - 1) * betdagiSoni + 1}-{Math.min(joriyBet * betdagiSoni, filtrlangan.length)} ko'rsatilyapti
              </span>
              <div className="m-page-btns" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <button 
                  className="m-nav-btn" 
                  disabled={joriyBet === 1} 
                  onClick={() => setJoriyBet(v => v - 1)}
                  style={{padding: '5px 10px', borderRadius: '4px', cursor: joriyBet === 1 ? 'not-allowed' : 'pointer'}}
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="m-num-group" style={{display: 'flex', gap: '5px'}}>
                  {Array.from({ length: jamiBetlar }, (_, i) => (
                    <button 
                      key={i} 
                      className={`m-num-btn ${joriyBet === i + 1 ? 'm-num-active' : ''}`} 
                      onClick={() => setJoriyBet(i + 1)}
                      style={{
                        width: '30px', 
                        height: '30px', 
                        borderRadius: '4px', 
                        border: '1px solid #e2e8f0',
                        backgroundColor: joriyBet === i + 1 ? 'var(--primary-color)' : 'white',
                        color: joriyBet === i + 1 ? 'white' : '#1e293b'
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  className="m-nav-btn" 
                  disabled={joriyBet === jamiBetlar} 
                  onClick={() => setJoriyBet(v => v + 1)}
                  style={{padding: '5px 10px', borderRadius: '4px', cursor: joriyBet === jamiBetlar ? 'not-allowed' : 'pointer'}}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALLAR QISMI (O'ZGARISSIZ) --- */}
      {/* 1. Sotib olish modali */}
      {buyurtmaModalOchiq && tanlangan && (
        <div className="m-overlay">
          <div className="m-modal">
            <div className="m-modal-head">
              <span>Sotib olish: {tanlangan.nomi}</span>
              <X className="m-close" size={20} onClick={() => setBuyurtmaModalOchiq(false)} />
            </div>
            <div className="m-modal-body">
              <div className="m-modal-field">
                <label>Miqdorni kiriting ({tanlangan.birligi})</label>
                <input className="m-custom-input" type="number" value={tanlangan.yangiMiqdor} onChange={e => setTanlangan({...tanlangan, yangiMiqdor: e.target.value})} />
              </div>
              <div style={{marginBottom: '10px'}}>Umumiy summa: {(tanlangan.yangiMiqdor * tanlangan.narxi).toLocaleString()} so'm</div>
              <button className="m-save-btn" onClick={buyurtmaBerish}>Tasdiqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Kirim tarixi modali */}
      {tarixModalOchiq && (
        <div className="m-overlay">
          <div className="m-modal" style={{maxWidth: '650px'}}>
            <div className="m-modal-head">
              <span>Masalliqlar kirim tarixi</span>
              <X className="m-close" size={20} onClick={() => setTarixModalOchiq(false)} />
            </div>
            <div className="m-modal-body">
              <button className="m-add-btn" style={{marginBottom: '15px'}} onClick={tarixExportPDF}>
                <Printer size={16} /> PDF ko'rinishida chop etish
              </button>
              <div className="m-table-wrapper" style={{maxHeight: '350px'}}>
                <table className="m-data-table">
                  <thead>
                    <tr><th>Sana</th><th>Nomi</th><th>Miqdor</th><th>Summa</th></tr>
                  </thead>
                  <tbody>
                    {tarix.map(t => (
                      <tr key={t.id}>
                        <td>{t.sana}</td>
                        <td>{t.nomi}</td>
                        <td>{t.miqdor}</td>
                        <td>{t.summa.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tahrirlash modali */}
      {tahrirlashModalOchiq && tanlangan && (
        <div className="m-overlay">
          <div className="m-modal">
            <div className="m-modal-head">
              <span>Tahrirlash</span>
              <X className="m-close" size={20} onClick={() => setTahrirlashModalOchiq(false)} />
            </div>
            <div className="m-modal-body">
              <div className="m-modal-field"><label>Nomi</label><input className="m-custom-input" value={tanlangan.nomi} onChange={e => setTanlangan({ ...tanlangan, nomi: e.target.value })} /></div>
              <div className="m-modal-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <div><label>Miqdor</label><input className="m-custom-input" type="number" value={tanlangan.miqdori} onChange={e => setTanlangan({ ...tanlangan, miqdori: e.target.value })} /></div>
                <div><label>Birlik</label><select className="m-custom-select" value={tanlangan.birligi} onChange={e => setTanlangan({ ...tanlangan, birligi: e.target.value })}><option value="kg">kg</option><option value="litr">litr</option><option value="dona">dona</option></select></div>
              </div>
              <div className="m-modal-field"><label>Narxi</label><input className="m-custom-input" type="number" value={tanlangan.narxi} onChange={e => setTanlangan({ ...tanlangan, narxi: e.target.value })} /></div>
              <button className="m-save-btn" onClick={masalliqniYangilash}>Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. O'chirish modali */}
      {ochirishModalOchiq && (
        <div className="m-overlay">
          <div className="m-modal m-modal-sm">
            <div className="m-modal-body" style={{textAlign: 'center'}}>
              <div className="m-warn-circle"><AlertTriangle size={36} /></div>
              <h3 className="m-modal-title">O'chirilsinmi?</h3>
              <p className="m-modal-text"><b>{tanlangan?.nomi}</b> o'chirib tashlanadi.</p>
              <div className="m-modal-btns">
                <button className="m-btn-gray" onClick={() => setOchirishModalOchiq(false)}>Yo'q</button>
                <button className="m-btn-danger" onClick={tasdiqlanganOchirish}>Ha</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Masalliqlar;