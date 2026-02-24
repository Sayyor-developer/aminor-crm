import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Plus, Edit, Trash2, Package, Printer, History, AlertTriangle, X, CheckCircle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { useData } from '../../DataContext';
import './masalliqlar.css';

const Masalliqlar = ({ open }) => {
  const {
    masalliqlar = [],
    setMasalliqlar,
    chiqimQoshish,
  } = useData();

  const [qidiruvMatni, setQidiruvMatni] = useState('');
  const [qoshishModalOchiq, setQoshishModalOchiq] = useState(false);
  const [tahrirlashModalOchiq, setTahrirlashModalOchiq] = useState(false);
  const [ochirishModalOchiq, setOchirishModalOchiq] = useState(false);

  const [tanlangan, setTanlangan] = useState(null);
  const [yangiMasalliq, setYangiMasalliq] = useState({
    nomi: '', miqdori: '', birligi: 'kg', narxi: '', zavod: '', status: true
  });

  // Tarixni localStorage-da saqlash
  const [tarix, setTarix] = useState(() => {
    const saqlanganTarix = localStorage.getItem('masalliqlar_tarixi');
    return saqlanganTarix ? JSON.parse(saqlanganTarix) : [];
  });

  useEffect(() => {
    localStorage.setItem('masalliqlar_tarixi', JSON.stringify(tarix));
  }, [tarix]);

  const formatNumber = (val) => {
    if (!val) return '';
    return val.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const parseNumber = (val) => {
    return val ? val.toString().replace(/\s/g, '') : '0';
  };

  const filtrlangan = useMemo(() => {
    return (masalliqlar || []).filter(m =>
      (m.nomi || '').toLowerCase().includes(qidiruvMatni.toLowerCase()) ||
      (m.zavod || '').toLowerCase().includes(qidiruvMatni.toLowerCase())
    );
  }, [masalliqlar, qidiruvMatni]);

  // YANGI MASALLIQ QO'SHISH
  const masalliqQoshish = () => {
    if (!yangiMasalliq.nomi.trim()) { toast.error("Nomini kiriting!"); return; }
    const miqdor = Number(yangiMasalliq.miqdori || 0);
    const narx = Number(parseNumber(yangiMasalliq.narxi || 0));
    const id = Date.now();

    setMasalliqlar([{ ...yangiMasalliq, id, miqdori: miqdor, narxi: narx }, ...masalliqlar]);
    setYangiMasalliq({ nomi: '', miqdori: '', birligi: 'kg', narxi: '', zavod: '', status: true });
    setQoshishModalOchiq(false);
    toast.success("Masalliq ro'yxatga qo'shildi!");
  };

  // --- ASOSIY QISM: TASDIQLASH VA PAGENI TOZALASH ---
  const barchasiniTasdiqlash = () => {
    if (masalliqlar.length === 0) {
      toast.error("Tasdiqlash uchun masalliqlar mavjud emas!");
      return;
    }

    const joriySana = new Date().toLocaleString();
    const yangiKirimlar = masalliqlar.map(m => ({
      id: Date.now() + Math.random(),
      sana: joriySana,
      nomi: m.nomi,
      miqdor: m.miqdori,
      birligi: m.birligi,
      summa: Number(m.miqdori) * Number(m.narxi),
      zavod: m.zavod || '---'
    }));

    const jamiChiqim = yangiKirimlar.reduce((sum, item) => sum + item.summa, 0);

    if (jamiChiqim > 0) {
      chiqimQoshish({
        id: Date.now(),
        turi: "Masalliqlar xaridi (Yalpi)",
        manbaa: `Tasdiqlangan xaridlar`,
        summa: jamiChiqim,
        sana: new Date().toISOString().split('T')[0]
      });
    }

    setTarix(prev => [...yangiKirimlar, ...prev]);
    setMasalliqlar([]); // PAGEDAGI MA'LUMOTLARNI O'CHIRISH
    toast.success("Ma'lumotlar tarixga saqlandi va sahifa tozalandi!");
  };

  const statusniOzgartirish = (id) => {
    setMasalliqlar(prev => prev.map(m => m.id === id ? { ...m, status: !m.status } : m));
    toast.success("Holat yangilandi");
  };

  const masalliqniYangilash = () => {
    const yangilanganTanlangan = {
      ...tanlangan,
      narxi: Number(parseNumber(tanlangan.narxi))
    };
    setMasalliqlar(prev => prev.map(m => m.id === tanlangan.id ? yangilanganTanlangan : m));
    setTahrirlashModalOchiq(false);
    toast.success("Yangilandi!");
  };

  const tarixExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Masalliqlar Kirim Tarixi", 14, 15);
    autoTable(doc, {
      startY: 22,
      head: [['Sana', 'Nomi', 'Miqdor', 'Summa', 'Ta\'minotchi']],
      body: tarix.map(t => [t.sana, t.nomi, `${t.miqdor} ${t.birligi}`, t.summa.toLocaleString() + " so'm", t.zavod]),
    });
    doc.save("kirim_tarixi.pdf");
  };

  return (
    <div className={`m-page ${open ? 'm-sidebar-open' : 'm-sidebar-closed'}`}>
      <Toaster position="top-right" />
      <div className="m-container">

        <div className="m-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="m-main-icon"><Package size={22} /></div>
            <h1>Masalliqlar bazasi</h1>
          </div>
          <button className="m-add-btn" onClick={() => setQoshishModalOchiq(true)}>
            <Plus size={18} /> Yangi masalliq
          </button>
        </div>

        <div className="m-data-card">
          <div className="m-search-box">
            <Search className="m-search-icon" size={20} />
            <input 
              className="m-custom-input m-pl-40" 
              placeholder="Qidirish..." 
              value={qidiruvMatni}
              onChange={e => setQidiruvMatni(e.target.value)} 
            />
          </div>

          <div className="m-table-wrapper">
            <table className="m-data-table">
              <thead>
                <tr>
                  <th>Masalliq</th>
                  <th>Miqdor</th>
                  <th>Narxi (1 birlik)</th>
                  <th>Ta'minotchi</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Boshqaruv</th>
                </tr>
              </thead>
              <tbody>
                {filtrlangan.map(m => (
                  <tr key={m.id} className={m.status ? 'm-row-active' : 'm-row-disabled'}>
                    <td className="m-font-bold">{m.nomi}</td>
                    <td>{m.miqdori} <span className="m-tag">{m.birligi}</span></td>
                    <td className="m-price-col">{Number(m.narxi).toLocaleString()}</td>
                    <td>{m.zavod || '---'}</td>
                    <td className="text-center">
                      <div className={`m-toggle ${m.status ? 'm-toggle-on' : 'm-toggle-off'}`} onClick={() => statusniOzgartirish(m.id)}>
                        <div className="m-toggle-circle" />
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="m-action-flex">
                        <button className="m-icon-btn m-edit" onClick={() => { setTanlangan(m); setTahrirlashModalOchiq(true); }}><Edit size={16} /></button>
                        <button className="m-icon-btn m-delete" onClick={() => { setTanlangan(m); setOchirishModalOchiq(true); }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtrlangan.length === 0 && <tr><td colSpan="6" className="text-center">Hozircha ro'yxat bo'sh</td></tr>}
              </tbody>
            </table>
          </div>

          {/* TASDIQLASH TUGMASI */}
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eee' }}>
            <button 
              onClick={barchasiniTasdiqlash}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary-color)', color: 'white',
                padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer'
              }}
            >
              <CheckCircle size={20} /> Tasdiqlash va Kirim qilish
            </button>
          </div>
        </div>

        {/* --- TARIX --- */}
        <div className="m-history-section" style={{ marginTop: '40px' }}>
          <div className="m-history-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History size={22} color="var(--primary-color)" />
              <h2 style={{margin: 0}}>Kirimlar tarixi</h2>
            </div>
            {tarix.length > 0 && (
              <button className="m-pdf-btn" onClick={tarixExportPDF}>
                <Printer size={16} /> PDF Hisobot
              </button>
            )}
          </div>
          <div className="m-data-card">
            <div className="m-table-wrapper" style={{ maxHeight: '400px' }}>
              <table className="m-data-table">
                <thead>
                  <tr>
                    <th>Sana</th>
                    <th>Nomi</th>
                    <th>Miqdor</th>
                    <th>Summa</th>
                    <th>Ta'minotchi</th>
                  </tr>
                </thead>
                <tbody>
                  {tarix.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontSize: '12px', color: '#64748b' }}>{t.sana}</td>
                      <td className="m-font-bold">{t.nomi}</td>
                      <td><span className="m-history-qty">{t.miqdor} {t.birligi}</span></td>
                      <td className="m-price-col">{t.summa.toLocaleString()} so'm</td>
                      <td>{t.zavod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALLAR (KALKULYATOR BILAN) --- */}

      {/* 1. Yangi qo'shish */}
      {qoshishModalOchiq && (
        <div className="m-overlay">
          <div className="m-modal">
            <div className="m-modal-head">
              <span>Yangi masalliq qo'shish</span>
              <X className="m-close" onClick={() => setQoshishModalOchiq(false)} />
            </div>
            <div className="m-modal-body">
              <label>Masalliq nomi</label>
              <input className="m-custom-input" placeholder="Nomi" value={yangiMasalliq.nomi} onChange={e => setYangiMasalliq({ ...yangiMasalliq, nomi: e.target.value })} />
              
              <div className="m-grid-2">
                <div>
                  <label>Miqdori(kg/litr/dona)</label>
                  <input className="m-custom-input" type="number" value={yangiMasalliq.miqdori} onChange={e => setYangiMasalliq({ ...yangiMasalliq, miqdori: e.target.value })} />
                </div>
                <div>
                  <label>Birligi</label>
                  <select className="m-custom-select" value={yangiMasalliq.birligi} onChange={e => setYangiMasalliq({ ...yangiMasalliq, birligi: e.target.value })}>
                    <option value="kg">kg</option>
                    <option value="litr">litr</option>
                    <option value="dona">dona</option>
                  </select>
                </div>
              </div>

              <label>Narxi (1 birlik uchun)</label>
              <input className="m-custom-input" value={formatNumber(yangiMasalliq.narxi)} onChange={e => setYangiMasalliq({ ...yangiMasalliq, narxi: e.target.value })} />
              

              <label>Ta'minotchi / Zavod</label>
              <input className="m-custom-input" placeholder="Zavod nomi" value={yangiMasalliq.zavod} onChange={e => setYangiMasalliq({ ...yangiMasalliq, zavod: e.target.value })} />
              
              {/* AVTO KALKULYATOR */}
              <div className="m-calc-box" style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', margin: '10px 0', border: '1px dashed #cbd5e1' }}>
                <small style={{ color: '#64748b' }}>Umumiy hisob:</small>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
                  {(Number(yangiMasalliq.miqdori || 0) * Number(parseNumber(yangiMasalliq.narxi || 0))).toLocaleString()} so'm
                </div>
              </div>
              <button className="m-save-btn" onClick={masalliqQoshish}>Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Tahrirlash */}
      {tahrirlashModalOchiq && tanlangan && (
        <div className="m-overlay">
          <div className="m-modal">
            <div className="m-modal-head">
              <span>Tahrirlash</span>
              <X className="m-close" onClick={() => setTahrirlashModalOchiq(false)} />
            </div>
            <div className="m-modal-body">
              <label>Nomi</label>
              <input className="m-custom-input" value={tanlangan.nomi} onChange={e => setTanlangan({ ...tanlangan, nomi: e.target.value })} />
              
              <div className="m-grid-2">
                <div>
                  <label>Miqdori</label>
                  <input className="m-custom-input" type="number" value={tanlangan.miqdori} onChange={e => setTanlangan({ ...tanlangan, miqdori: e.target.value })} />
                </div>
                <div>
                  <label>Birligi</label>
                  <select className="m-custom-select" value={tanlangan.birligi} onChange={e => setTanlangan({ ...tanlangan, birligi: e.target.value })}>
                    <option value="kg">kg</option>
                    <option value="litr">litr</option>
                    <option value="dona">dona</option>
                  </select>
                </div>
              </div>

              <label>Narxi (1 birlik uchun)</label>
              <input className="m-custom-input" value={formatNumber(tanlangan.narxi)} onChange={e => setTanlangan({ ...tanlangan, narxi: e.target.value })} />

              {/* AVTO KALKULYATOR */}
              <div className="m-calc-box" style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', margin: '10px 0', border: '1px dashed #cbd5e1' }}>
                <small style={{ color: '#64748b' }}>Jami summa:</small>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>
                  {(Number(tanlangan.miqdori || 0) * Number(parseNumber(tanlangan.narxi || 0))).toLocaleString()} so'm
                </div>
              </div>

              <label>Ta'minotchi / Zavod</label>
              <input className="m-custom-input" value={tanlangan.zavod} onChange={e => setTanlangan({ ...tanlangan, zavod: e.target.value })} />
              
              <button className="m-save-btn" onClick={masalliqniYangilash}>Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. O'chirish */}
      {ochirishModalOchiq && (
        <div className="m-overlay">
          <div className="m-modal m-modal-sm">
            <div className="m-modal-body" style={{ textAlign: 'center', padding: '30px 20px' }}>
              <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 15px' }} />
              <h3>O'chirilsinmi?</h3>
              <p>{tanlangan?.nomi} bazadan o'chiriladi.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => setOchirishModalOchiq(false)} className="m-cancel-btn">Bekor qilish</button>
                <button onClick={() => { setMasalliqlar(prev => prev.filter(m => m.id !== tanlangan.id)); setOchirishModalOchiq(false); toast.error("O'chirildi"); }} className="m-delete-confirm-btn">O'chirish</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Masalliqlar;