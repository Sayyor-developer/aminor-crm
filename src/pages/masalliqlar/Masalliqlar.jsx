import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
  X, AlertTriangle, Package, Printer, History, ShoppingCart
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

  // --- STATE-LAR ---
  const [qidiruvMatni, setQidiruvMatni] = useState('');
  const [joriyBet, setJoriyBet] = useState(1);
  const betdagiSoni = 10;

  const [qoshishModalOchiq, setQoshishModalOchiq] = useState(false);
  const [tahrirlashModalOchiq, setTahrirlashModalOchiq] = useState(false);
  const [ochirishModalOchiq, setOchirishModalOchiq] = useState(false);
  const [buyurtmaModalOchiq, setBuyurtmaModalOchiq] = useState(false);
  const [tarixModalOchiq, setTarixModalOchiq] = useState(false);

  const [tanlangan, setTanlangan] = useState(null);
  const [yangiMasalliq, setYangiMasalliq] = useState({
    nomi: '', miqdori: '', birligi: 'kg', narxi: '', zavod: '', status: true
  });

  const [tarix, setTarix] = useState([]);

  // --- YORDAMCHI FUNKSIYALAR (NARX UCHUN) ---
  const formatNumber = (val) => {
    if (!val) return '';
    return val.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const parseNumber = (val) => {
    return val.toString().replace(/\s/g, '');
  };

  // --- FILTRLASH ---
  const filtrlangan = useMemo(() => {
    return (masalliqlar || []).filter(m =>
      (m.nomi || '').toLowerCase().includes(qidiruvMatni.toLowerCase()) ||
      (m.zavod || '').toLowerCase().includes(qidiruvMatni.toLowerCase())
    );
  }, [masalliqlar, qidiruvMatni]);

  // --- PAGINATION ---
  const jamiBetlar = Math.ceil(filtrlangan.length / betdagiSoni);
  const joriyMasalliqlar = useMemo(() => {
    const boshlanishIndeksi = (joriyBet - 1) * betdagiSoni;
    return filtrlangan.slice(boshlanishIndeksi, boshlanishIndeksi + betdagiSoni);
  }, [filtrlangan, joriyBet]);

  // --- FUNKSIYALAR ---
  const masalliqQoshish = () => {
    if (!yangiMasalliq.nomi.trim()) { toast.error("Nomini kiriting!"); return; }
    if (!yangiMasalliq.miqdori || yangiMasalliq.miqdori < 0) { toast.error("Miqdorni to'g'ri kiriting!"); return; }

    const id = Date.now();
    setMasalliqlar([{ 
      ...yangiMasalliq, 
      id, 
      miqdori: Number(yangiMasalliq.miqdori), 
      narxi: Number(parseNumber(yangiMasalliq.narxi)) 
    }, ...masalliqlar]);
    
    setYangiMasalliq({ nomi: '', miqdori: '', birligi: 'kg', narxi: '', zavod: '', status: true });
    setQoshishModalOchiq(false);
    setJoriyBet(1);
    toast.success("Ro'yxatga qo'shildi!");
  };

  const statusniOzgartirish = (id) => {
    setMasalliqlar(masalliqlar.map(m => m.id === id ? { ...m, status: !m.status } : m));
    toast.success("Holat yangilandi");
  };

  const buyurtmaBerish = () => {
    if (!tanlangan.yangiMiqdor || tanlangan.yangiMiqdor <= 0) {
      toast.error("Miqdorni kiriting!");
      return;
    }
    const jamiSumma = Number(tanlangan.yangiMiqdor) * Number(tanlangan.narxi);
    const joriySana = new Date().toISOString().split('T')[0];

    chiqimQoshish({
      id: Date.now(),
      turi: "Masalliq xaridi",
      manbaa: `${tanlangan.nomi} (${tanlangan.zavod})`,
      summa: jamiSumma,
      sana: joriySana
    });

    masalliqMiqdoriniYangilash(tanlangan.id, tanlangan.yangiMiqdor);

    const yangiKirim = {
      id: Date.now() + 1,
      sana: joriySana,
      nomi: tanlangan.nomi,
      miqdor: Number(tanlangan.yangiMiqdor),
      summa: jamiSumma,
      xodim: "Admin"
    };
    setTarix([yangiKirim, ...tarix]);

    setBuyurtmaModalOchiq(false);
    toast.success(`Kirim qilindi: -${jamiSumma.toLocaleString()} so'm`);
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
    const yangilanganTanlangan = {
      ...tanlangan,
      narxi: Number(parseNumber(tanlangan.narxi))
    };
    setMasalliqlar(masalliqlar.map(m => m.id === tanlangan.id ? yangilanganTanlangan : m));
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

        <div className="m-title-area" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="m-main-icon"><Package size={22} /></div>
            <h1>Masalliqlar bazasi</h1>
          </div>
          <div className='masalliq-qoshish-kirim' style={{ display: 'flex', gap: '10px' }}>
            <button className="m-add-btn" style={{ backgroundColor: 'var(--primary-color)' }} onClick={() => setQoshishModalOchiq(true)}>
              <Plus size={18} /> Yangi masalliq
            </button>
            <button className="m-add-btn" style={{ background: 'var(--primary-color)' }} onClick={() => setTarixModalOchiq(true)}>
              <History size={18} /> Kirim Tarixi
            </button>
          </div>
        </div>

        <div className="m-data-card">
          <div className="m-search-box">
            <Search className="m-search-icon" size={20} />
            <input className="m-custom-input m-pl-40" placeholder="Nom yoki zavod bo'yicha qidirish..." onChange={e => { setQidiruvMatni(e.target.value); setJoriyBet(1); }} />
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
                  <th className="text-center">Buyurtma berish</th>
                  <th className="text-center">Boshqaruv</th>
                </tr>
              </thead>
              <tbody>
                {joriyMasalliqlar.length > 0 ? joriyMasalliqlar.map(m => (
                  <tr key={m.id} className={m.status ? 'm-row-active' : 'm-row-disabled'}>
                    <td className="m-font-bold">{m.nomi}</td>
                    <td>{m.miqdori} <span className="m-tag">{m.birligi}</span></td>
                    <td className="m-price-col">{Number(m.narxi).toLocaleString()}</td>
                    <td>{m.zavod}</td>
                    <td className="text-center">
                      <div className={`m-toggle ${m.status ? 'm-toggle-on' : 'm-toggle-off'}`} onClick={() => statusniOzgartirish(m.id)}>
                        <div className="m-toggle-circle" />
                      </div>
                    </td>
                    <td className="text-center">
                      <button className="m-icon-btn" style={{ background: 'var(--primary-color)', margin: '0 auto' }} onClick={() => { setTanlangan({ ...m, yangiMiqdor: '' }); setBuyurtmaModalOchiq(true); }}>
                        <ShoppingCart size={16} />
                      </button>
                    </td>
                    <td className="text-center">
                      <div className="m-action-flex" style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button className="m-icon-btn m-edit" onClick={() => { setTanlangan(m); setTahrirlashModalOchiq(true); }}><Edit size={16} /></button>
                        <button className="m-icon-btn m-delete" onClick={() => { setTanlangan(m); setOchirishModalOchiq(true); }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Ma'lumot topilmadi.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {jamiBetlar > 1 && (
            <div className="m-pagination-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
              <span style={{ color: '#64748b', fontSize: 'var(--font-size-14)' }}>Jami: <b>{filtrlangan.length}</b> ta</span>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <button className="m-nav-btn" disabled={joriyBet === 1} onClick={() => setJoriyBet(v => v - 1)}><ChevronLeft size={16} /></button>
                <button className="m-nav-btn" disabled={joriyBet === jamiBetlar} onClick={() => setJoriyBet(v => v + 1)}><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALLAR --- */}

      {/* YANGI MASALLIQ QOSHISH MODAL */}
      {qoshishModalOchiq && (
        <div className="m-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="m-modal" style={{ backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '450px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div className="m-modal-head" style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: '500' }}>Yangi masalliq qo'shish</span>
              <X className="m-close" style={{ cursor: 'pointer', opacity: 0.8 }} onClick={() => setQoshishModalOchiq(false)} />
            </div>

            <div className="m-modal-body" style={{ padding: '20px' }}>
              <div className="m-modal-field" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#666', marginBottom: '5px', fontSize: 'var(--font-size-14)' }}>Masalliq nomi</label>
                <input className="m-custom-input" placeholder="Nomi" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={yangiMasalliq.nomi} onChange={e => setYangiMasalliq({ ...yangiMasalliq, nomi: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#666', marginBottom: '5px', fontSize: 'var(--font-size-14)' }}>Miqdori</label>
                  <input className="m-custom-input" type="number" placeholder="0" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={yangiMasalliq.miqdori} onChange={e => setYangiMasalliq({ ...yangiMasalliq, miqdori: e.target.value })} />
                </div>
                <div style={{ width: '100px' }}>
                  <label style={{ display: 'block', color: '#666', marginBottom: '5px', fontSize: 'var(--font-size-14)' }}>Birligi</label>
                  <select className="m-custom-select" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white' }} value={yangiMasalliq.birligi} onChange={e => setYangiMasalliq({ ...yangiMasalliq, birligi: e.target.value })}>
                    <option value="kg">kg</option>
                    <option value="litr">litr</option>
                    <option value="dona">dona</option>
                  </select>
                </div>
              </div>

              <div className="m-modal-field" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#666', marginBottom: '5px', fontSize: 'var(--font-size-14)' }}>Sotib olingan narxi (1 birlik uchun)</label>
                <input
                  className="m-custom-input"
                  type="text"
                  placeholder="0"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                  value={formatNumber(yangiMasalliq.narxi)}
                  onChange={e => setYangiMasalliq({ ...yangiMasalliq, narxi: e.target.value })}
                />
              </div>

              <div className="m-modal-field" style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', color: '#666', marginBottom: '5px', fontSize: 'var(--font-size-14)' }}>Ta'minotchi / Zavod</label>
                <input className="m-custom-input" placeholder="Kompaniya nomi" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={yangiMasalliq.zavod} onChange={e => setYangiMasalliq({ ...yangiMasalliq, zavod: e.target.value })} />
              </div>

              <button className="m-save-btn" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: 'var(--font-size-16)', cursor: 'pointer' }} onClick={masalliqQoshish}>Saqlash va Tasdiqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* SOTIB OLISH MODAL */}
      {buyurtmaModalOchiq && tanlangan && (
        <div className="m-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="m-modal" style={{ backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '400px', overflow: 'hidden' }}>
            <div className="m-modal-head" style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Kirim: {tanlangan.nomi}</span>
              <X className="m-close" style={{ cursor: 'pointer' }} onClick={() => setBuyurtmaModalOchiq(false)} />
            </div>
            <div className="m-modal-body" style={{ padding: '20px' }}>
              <div className="m-modal-field" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Sotib olingan miqdor ({tanlangan.birligi})</label>
                <input className="m-custom-input" type="number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={tanlangan.yangiMiqdor} onChange={e => setTanlangan({ ...tanlangan, yangiMiqdor: e.target.value })} />
              </div>
              <div className="m-total-label" style={{ marginBottom: '15px', padding: '10px', background: '#f8fafc', borderRadius: '5px', textAlign: 'center' }}>
                Umumiy chiqim: <b>{(Number(tanlangan.yangiMiqdor) * tanlangan.narxi).toLocaleString()} so'm</b>
              </div>
              <button className="m-save-btn" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }} onClick={buyurtmaBerish}>Kirimni yakunlash</button>
            </div>
          </div>
        </div>
      )}

      {/* TAHRIRLASH MODAL */}
      {tahrirlashModalOchiq && tanlangan && (
        <div className="m-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="m-modal" style={{ backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '450px', overflow: 'hidden' }}>
            <div className="m-modal-head" style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Tahrirlash</span>
              <X className="m-close" style={{ cursor: 'pointer' }} onClick={() => setTahrirlashModalOchiq(false)} />
            </div>
            <div className="m-modal-body" style={{ padding: '20px' }}>
              <div className="m-modal-field" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Nomi</label>
                <input className="m-custom-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={tanlangan.nomi} onChange={e => setTanlangan({ ...tanlangan, nomi: e.target.value })} />
              </div>
              <div className="m-modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div><label style={{ display: 'block', marginBottom: '5px' }}>Miqdor</label><input className="m-custom-input" type="number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={tanlangan.miqdori} onChange={e => setTanlangan({ ...tanlangan, miqdori: e.target.value })} /></div>
                <div><label style={{ display: 'block', marginBottom: '5px' }}>Birlik</label><select className="m-custom-select" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white' }} value={tanlangan.birligi} onChange={e => setTanlangan({ ...tanlangan, birligi: e.target.value })}><option value="kg">kg</option><option value="litr">litr</option><option value="dona">dona</option></select></div>
              </div>
              <div className="m-modal-field" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Narxi</label>
                <input
                  className="m-custom-input"
                  type="text"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                  value={formatNumber(tanlangan.narxi)}
                  onChange={e => setTanlangan({ ...tanlangan, narxi: e.target.value })}
                />
              </div>
              <button className="m-save-btn" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }} onClick={masalliqniYangilash}>O'zgarishlarni saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* TARIX MODAL */}
      {tarixModalOchiq && (
        <div className="m-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="m-modal" style={{ backgroundColor: 'white', borderRadius: '12px', width: '95%', maxWidth: '700px', overflow: 'hidden' }}>
            <div className="m-modal-head" style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Masalliqlar kirim tarixi</span>
              <X className="m-close" style={{ cursor: 'pointer' }} onClick={() => setTarixModalOchiq(false)} />
            </div>
            <div className="m-modal-body" style={{ padding: '20px' }}>
              <button className="m-add-btn" style={{ marginBottom: '15px', backgroundColor: 'var(--primary-color)', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={tarixExportPDF}><Printer size={16} /> PDF Hisobot</button>
              <div className="m-table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="m-data-table">
                  <thead><tr><th>Sana</th><th>Nomi</th><th>Miqdor</th><th>Summa</th></tr></thead>
                  <tbody>
                    {tarix.length > 0 ? tarix.map(t => (
                      <tr key={t.id}><td>{t.sana}</td><td>{t.nomi}</td><td>{t.miqdor}</td><td>{t.summa.toLocaleString()}</td></tr>
                    )) : <tr><td colSpan="4" className="text-center" style={{ padding: '20px' }}>Tarix bo'sh</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* O'CHIRISH MODAL */}
      {ochirishModalOchiq && (
        <div className="m-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="m-modal m-modal-sm" style={{ backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '350px', padding: '30px', textAlign: 'center' }}>
            <div className="m-modal-body">
              <div className="m-warn-circle" style={{ color: 'var(--primary-color)', marginBottom: '15px', display: 'flex', justifyContent: 'center' }}><AlertTriangle size={48} /></div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>O'chirishni tasdiqlaysizmi?</h3>
              <p style={{ color: '#64748b' }}><b>{tanlangan?.nomi}</b> butunlay o'chiriladi.</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                <button className="m-btn-gray" style={{ padding: '8px 20px', borderRadius: '5px', border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: 'white' }} onClick={() => setOchirishModalOchiq(false)}>Bekor qilish</button>
                <button style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '8px 25px', borderRadius: '5px', border: 'none', cursor: 'pointer' }} onClick={tasdiqlanganOchirish}>O'chirish</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Masalliqlar;