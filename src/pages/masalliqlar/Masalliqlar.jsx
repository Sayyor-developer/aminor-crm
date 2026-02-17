import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, Plus, Edit, Trash2, Package, Printer, History, ShoppingCart, AlertTriangle, X
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
    masalliqMiqdoriniYangilash
  } = useData();

  const [qidiruvMatni, setQidiruvMatni] = useState('');
  const [qoshishModalOchiq, setQoshishModalOchiq] = useState(false);
  const [tahrirlashModalOchiq, setTahrirlashModalOchiq] = useState(false);
  const [ochirishModalOchiq, setOchirishModalOchiq] = useState(false);
  const [buyurtmaModalOchiq, setBuyurtmaModalOchiq] = useState(false);

  const [tanlangan, setTanlangan] = useState(null);
  const [yangiMasalliq, setYangiMasalliq] = useState({
    nomi: '', miqdori: '', birligi: 'kg', narxi: '', zavod: '', status: true
  });

  const [tarix, setTarix] = useState([]);

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

  const masalliqQoshish = () => {
    if (!yangiMasalliq.nomi.trim()) { toast.error("Nomini kiriting!"); return; }
    const id = Date.now();
    setMasalliqlar([{ 
      ...yangiMasalliq, 
      id, 
      miqdori: Number(yangiMasalliq.miqdori), 
      narxi: Number(parseNumber(yangiMasalliq.narxi)) 
    }, ...masalliqlar]);
    
    // Formani tozalash
    setYangiMasalliq({ nomi: '', miqdori: '', birligi: 'kg', narxi: '', zavod: '', status: true });
    setQoshishModalOchiq(false);
    toast.success("Ro'yxatga qo'shildi!");
  };

  const statusniOzgartirish = (id) => {
    setMasalliqlar(prev => prev.map(m => m.id === id ? { ...m, status: !m.status } : m));
    toast.success("Holat yangilandi");
  };

  const buyurtmaBerish = useCallback(() => {
    if (!tanlangan.yangiMiqdor || tanlangan.yangiMiqdor <= 0) {
      toast.error("Miqdorni kiriting!");
      return;
    }
    const jamiSumma = Number(tanlangan.yangiMiqdor) * Number(tanlangan.narxi);
    const joriySana = new Date().toLocaleString();

    chiqimQoshish({
      id: Date.now(),
      turi: "Masalliq xaridi",
      manbaa: `${tanlangan.nomi}`,
      summa: jamiSumma,
      sana: joriySana
    });

    masalliqMiqdoriniYangilash(tanlangan.id, tanlangan.yangiMiqdor);

    const yangiKirim = {
      id: Date.now() + 1,
      sana: joriySana,
      nomi: tanlangan.nomi,
      miqdor: Number(tanlangan.yangiMiqdor),
      birligi: tanlangan.birligi,
      summa: jamiSumma,
      zavod: tanlangan.zavod // Tarixga ta'minotchini biriktirish
    };
    
    setTarix(prev => [yangiKirim, ...prev]);
    setBuyurtmaModalOchiq(false);
    toast.success(`Kirim qilindi!`);
  }, [tanlangan, chiqimQoshish, masalliqMiqdoriniYangilash]);

  const tarixExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Kirim Tarixi", 14, 15);
    autoTable(doc, {
      startY: 22,
      head: [['Sana', 'Nomi', 'Miqdor', 'Summa', 'Ta\'minotchi']],
      body: tarix.map(t => [t.sana, t.nomi, `${t.miqdor} ${t.birligi}`, t.summa.toLocaleString(), t.zavod]),
    });
    doc.save("tarix.pdf");
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
              placeholder="Qidirish (Nomi yoki Ta'minotchi bo'yicha)..." 
              value={qidiruvMatni}
              onChange={e => setQidiruvMatni(e.target.value)} 
            />
          </div>

          <div className="m-table-wrapper">
            <table className="m-data-table">
              <thead>
                <tr>
                  <th>Masalliq</th>
                  <th>Xozirgi xarid</th>
                  <th>Narxi (1 birlik)</th>
                  <th>Ta'minotchi</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Kirim</th>
                  <th className="text-center">Boshqaruv</th>
                </tr>
              </thead>
              <tbody>
                {filtrlangan.length > 0 ? filtrlangan.map(m => (
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
                      <button className="m-buy-icon-btn" onClick={() => { setTanlangan({ ...m, yangiMiqdor: '' }); setBuyurtmaModalOchiq(true); }}>
                        <ShoppingCart size={16} />
                      </button>
                    </td>
                    <td className="text-center">
                      <div className="m-action-flex">
                        <button className="m-icon-btn m-edit" onClick={() => { setTanlangan(m); setTahrirlashModalOchiq(true); }}><Edit size={16} /></button>
                        <button className="m-icon-btn m-delete" onClick={() => { setTanlangan(m); setOchirishModalOchiq(true); }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="7" className="text-center" style={{padding: '20px'}}>Ma'lumot topilmadi</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="m-history-section">
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
                  {tarix.length > 0 ? tarix.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontSize: '12px', color: '#64748b' }}>{t.sana}</td>
                      <td className="m-font-bold">{t.nomi}</td>
                      <td><span className="m-history-qty">{t.miqdor} {t.birligi}</span></td>
                      <td className="m-price-col">{t.summa.toLocaleString()} so'm</td>
                      <td>{t.zavod}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="text-center" style={{ padding: '30px', color: '#94a3b8' }}>Kirimlar mavjud emas</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALLAR --- */}
      
      {/* QO'SHISH MODALI */}
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
                  <label>Miqdori</label>
                  <input className="m-custom-input" type="number" placeholder="0" value={yangiMasalliq.miqdori} onChange={e => setYangiMasalliq({ ...yangiMasalliq, miqdori: e.target.value })} />
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
              <input className="m-custom-input" placeholder="0" value={formatNumber(yangiMasalliq.narxi)} onChange={e => setYangiMasalliq({ ...yangiMasalliq, narxi: e.target.value })} />
              
              <label>Ta'minotchi / Zavod</label>
              <input className="m-custom-input" placeholder="Zavod nomi" value={yangiMasalliq.zavod} onChange={e => setYangiMasalliq({ ...yangiMasalliq, zavod: e.target.value })} />

              <button className="m-save-btn" onClick={masalliqQoshish}>Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* KIRIM QILISH MODALI */}
      {buyurtmaModalOchiq && tanlangan && (
        <div className="m-overlay">
          <div className="m-modal" style={{ maxWidth: '400px' }}>
            <div className="m-modal-head">
              <span>Kirim: {tanlangan.nomi}</span>
              <X className="m-close" onClick={() => setBuyurtmaModalOchiq(false)} />
            </div>
            <div className="m-modal-body">
              <label>Sotib olingan miqdor ({tanlangan.birligi})</label>
              <input 
                className="m-custom-input" 
                type="number" 
                autoFocus
                placeholder="0"
                value={tanlangan.yangiMiqdor} 
                onChange={e => setTanlangan({ ...tanlangan, yangiMiqdor: e.target.value })} 
              />
              <div className="m-summary-box">
                Jami xarid summasi:<br/>
                <b style={{fontSize: '18px', color: 'var(--primary-color)'}}>
                  {(Number(tanlangan.yangiMiqdor || 0) * tanlangan.narxi).toLocaleString()} so'm
                </b>
              </div>
              <button className="m-save-btn" onClick={buyurtmaBerish}>Tasdiqlash va Kirim qilish</button>
            </div>
          </div>
        </div>
      )}

      {/* TAHRIRLASH MODALI */}
      {tahrirlashModalOchiq && tanlangan && (
        <div className="m-overlay">
          <div className="m-modal">
            <div className="m-modal-head">
              <span>Tahrirlash: {tanlangan.nomi}</span>
              <X className="m-close" onClick={() => setTahrirlashModalOchiq(false)} />
            </div>
            <div className="m-modal-body">
              <label>Nomi</label>
              <input className="m-custom-input" value={tanlangan.nomi} onChange={e => setTanlangan({ ...tanlangan, nomi: e.target.value })} />
              
              <label>Narxi (1 birlik)</label>
              <input className="m-custom-input" value={formatNumber(tanlangan.narxi)} onChange={e => setTanlangan({ ...tanlangan, narxi: e.target.value })} />
              
              <label>Ta'minotchi</label>
              <input className="m-custom-input" value={tanlangan.zavod} onChange={e => setTanlangan({ ...tanlangan, zavod: e.target.value })} />

              <button className="m-save-btn" onClick={masalliqniYangilash}>O'zgarishlarni saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* O'CHIRISH MODALI */}
      {ochirishModalOchiq && (
        <div className="m-overlay">
          <div className="m-modal m-modal-sm">
            <div className="m-modal-body" style={{ textAlign: 'center' }}>
              <AlertTriangle size={48} color="#ef4444" style={{marginBottom: '10px'}} />
              <h3>O'chirilsinmi?</h3>
              <p><b>{tanlangan?.nomi}</b> butunlay o'chiriladi.</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button className="m-btn-gray" onClick={() => setOchirishModalOchiq(false)}>Bekor qilish</button>
                <button className="m-save-btn" style={{backgroundColor: '#ef4444'}} onClick={() => { setMasalliqlar(prev => prev.filter(m => m.id !== tanlangan.id)); setOchirishModalOchiq(false); toast.error("O'chirildi"); }}>Ha, o'chirilsin</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Masalliqlar;