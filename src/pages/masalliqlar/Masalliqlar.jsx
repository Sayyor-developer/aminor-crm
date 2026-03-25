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
    supabase
  } = useData();

  const [qidiruvMatni, setQidiruvMatni] = useState('');
  const [qoshishModalOchiq, setQoshishModalOchiq] = useState(false);
  const [tahrirlashModalOchiq, setTahrirlashModalOchiq] = useState(false);
  const [ochirishModalOchiq, setOchirishModalOchiq] = useState(false);

  const [tanlangan, setTanlangan] = useState(null);
  const [yangiMasalliq, setYangiMasalliq] = useState({
    nomi: '', 
    miqdori: '', 
    birlik: 'kg', 
    narxi: '', 
    zavod: '', 
    status: true
  });

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
    if (!val) return 0;
    return Number(val.toString().replace(/\s/g, ''));
  };

  const filtrlangan = useMemo(() => {
    return (masalliqlar || []).filter(m =>
      (m.nomi || '').toLowerCase().includes(qidiruvMatni.toLowerCase()) ||
      (m.zavod || '').toLowerCase().includes(qidiruvMatni.toLowerCase())
    );
  }, [masalliqlar, qidiruvMatni]);

  // --- CRUD FUNKSIYALAR ---
  const handleMasalliqQoshish = async () => {
    if (!yangiMasalliq.nomi.trim()) {
      toast.error("Masalliq nomini kiriting!");
      return;
    }
    const t = toast.loading("Saqlanmoqda...");
    try {
      const { data, error } = await supabase
        .from('masalliqlar')
        .insert([{
          nomi: yangiMasalliq.nomi.trim(),
          miqdori: Number(yangiMasalliq.miqdori || 0),
          birlik: yangiMasalliq.birlik,
          narxi: parseNumber(yangiMasalliq.narxi),
          zavod: yangiMasalliq.zavod.trim() || '---',
          status: true
        }])
        .select();
      if (error) throw error;
      setMasalliqlar([data[0], ...masalliqlar]);
      setYangiMasalliq({ nomi: '', miqdori: '', birlik: 'kg', narxi: '', zavod: '', status: true });
      setQoshishModalOchiq(false);
      toast.success("Ro'yxatga qo'shildi!", { id: t });
    } catch (err) {
      toast.error("Xatolik yuz berdi!", { id: t });
    }
  };

  const handleYangilash = async () => {
    const t = toast.loading("Yangilanmoqda...");
    try {
      const { error } = await supabase
        .from('masalliqlar')
        .update({
          nomi: tanlangan.nomi,
          miqdori: Number(tanlangan.miqdori),
          birlik: tanlangan.birlik,
          narxi: parseNumber(tanlangan.narxi),
          zavod: tanlangan.zavod
        })
        .eq('id', tanlangan.id);
      if (error) throw error;
      setMasalliqlar(prev => prev.map(m => m.id === tanlangan.id ? { ...tanlangan, narxi: parseNumber(tanlangan.narxi) } : m));
      setTahrirlashModalOchiq(false);
      toast.success("Muvaffaqiyatli yangilandi!", { id: t });
    } catch (err) {
      toast.error("Yangilashda xato!");
    }
  };

  const handleOchirish = async () => {
    const t = toast.loading("O'chirilmoqda...");
    try {
      const { error } = await supabase.from('masalliqlar').delete().eq('id', tanlangan.id);
      if (error) throw error;
      setMasalliqlar(prev => prev.filter(m => m.id !== tanlangan.id));
      setOchirishModalOchiq(false);
      toast.success("O'chirildi", { id: t });
    } catch (err) {
      toast.error("O'chirishda xato!");
    }
  };

  const handleStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase.from('masalliqlar').update({ status: !currentStatus }).eq('id', id);
      if (error) throw error;
      setMasalliqlar(prev => prev.map(m => m.id === id ? { ...m, status: !currentStatus } : m));
      toast.success("Holat o'zgardi");
    } catch (err) {
      toast.error("Xatolik!");
    }
  };

  // --- TASDIQLASH (MOLIYA BILAN ALOQA YO'Q) ---
  const barchasiniTasdiqlash = async () => {
    const tasdiqlanadiganlar = masalliqlar.filter(m => m.status === true);
    
    if (tasdiqlanadiganlar.length === 0) {
      toast.error("Tasdiqlash uchun aktiv masalliqlar yo'q!");
      return;
    }

    const t = toast.loading("Jarayon bajarilmoqda...");
    const joriyVaqt = new Date().toLocaleString();

    try {
      // 1. Tarix uchun ma'lumot tayyorlash
      const yangiTarixElementlari = tasdiqlanadiganlar.map(m => ({
        id: Date.now() + Math.random(),
        sana: joriyVaqt,
        nomi: m.nomi,
        miqdor: m.miqdori,
        birligi: m.birlik,
        summa: Number(m.miqdori) * Number(m.narxi || 0),
        zavod: m.zavod || '---'
      }));

      // 2. Supabase-dan o'chirish
      const ids = tasdiqlanadiganlar.map(m => m.id);
      const { error: delErr } = await supabase.from('masalliqlar').delete().in('id', ids);
      if (delErr) throw delErr;

      // 3. State-larni yangilash (Moliya funksiyasi chaqirilmadi!)
      setTarix(prev => [...yangiTarixElementlari, ...prev]);
      setMasalliqlar(prev => prev.filter(m => !ids.includes(m.id)));
      
      toast.success("Masalliqlar omborga qabul qilindi va arxivlandi!", { id: t });
    } catch (error) {
      console.error(error);
      toast.error("Xatolik yuz berdi!", { id: t });
    }
  };

  const tarixExportPDF = () => {
    if (tarix.length === 0) return toast.error("Tarix bo'sh!");
    const doc = new jsPDF();
    const sana = new Date().toLocaleDateString();
    doc.setFontSize(18);
    doc.text("Masalliqlar Kirim Hisoboti", 14, 15);
    doc.setFontSize(10);
    doc.text(`Sana: ${sana}`, 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [['Sana', 'Masalliq Nomi', 'Miqdor', 'Jami Summa', 'Ta\'minotchi']],
      body: tarix.map(t => [
        t.sana, 
        t.nomi, 
        `${t.miqdor} ${t.birligi}`, 
        t.summa.toLocaleString() + " so'm", 
        t.zavod
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save(`masalliqlar_hisoboti_${sana}.pdf`);
    toast.success("PDF yuklab olindi!");
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
                    <td>{m.miqdori} <span className="m-tag">{m.birlik}</span></td>
                    <td className="m-price-col">{Number(m.narxi || 0).toLocaleString()} so'm</td>
                    <td>{m.zavod || '---'}</td>
                    <td className="text-center">
                      <div className={`m-toggle ${m.status ? 'm-toggle-on' : 'm-toggle-off'}`} onClick={() => handleStatus(m.id, m.status)}>
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
              </tbody>
            </table>
          </div>
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eee' }}>
            <button className="m-save-btn" style={{ padding: '10px 15px', display: 'flex', gap: '10px'}} onClick={barchasiniTasdiqlash}>
              <CheckCircle size={20} /> Tasdiqlash (Faqat Ombor)
            </button>
          </div>
        </div>

        {/* --- MODALLAR --- */}

        {/* QOSHISH */}
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
                    <select className="m-custom-select" value={yangiMasalliq.birlik} onChange={e => setYangiMasalliq({ ...yangiMasalliq, birlik: e.target.value })}>
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
                <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Umumiy summa:</span>
                  <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '16px' }}>
                    {(Number(yangiMasalliq.miqdori || 0) * parseNumber(yangiMasalliq.narxi)).toLocaleString()} so'm
                  </span>
                </div>
                <button className="m-save-btn" onClick={handleMasalliqQoshish}>Saqlash</button>
              </div>
            </div>
          </div>
        )}

        {/* TAHRIRLASH */}
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
                  <div><label>Miqdori</label>
                    <input className="m-custom-input" type="number" value={tanlangan.miqdori} onChange={e => setTanlangan({ ...tanlangan, miqdori: e.target.value })} />
                  </div>
                  <div><label>Birligi</label>
                    <select className="m-custom-select" value={tanlangan.birlik} onChange={e => setTanlangan({ ...tanlangan, birlik: e.target.value })}>
                      <option value="kg">kg</option>
                      <option value="litr">litr</option>
                      <option value="dona">dona</option>
                    </select>
                  </div>
                </div>
                <label>Narxi</label>
                <input className="m-custom-input" value={formatNumber(tanlangan.narxi)} onChange={e => setTanlangan({ ...tanlangan, narxi: e.target.value })} />
                <label>Ta'minotchi</label>
                <input className="m-custom-input" value={tanlangan.zavod} onChange={e => setTanlangan({ ...tanlangan, zavod: e.target.value })} />
                <button className="m-save-btn" onClick={handleYangilash}>Saqlash</button>
              </div>
            </div>
          </div>
        )}

        {/* OCHIRISH */}
        {ochirishModalOchiq && (
          <div className="m-overlay">
            <div className="m-modal m-modal-sm" style={{ maxWidth: '380px' }}>
              <div className="m-modal-body" style={{ textAlign: 'center', padding: '30px 20px' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <AlertTriangle size={32} color="#ef4444" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>O'chirilsinmi?</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
                  Haqiqatan ham ushbu masalliqni o'chirmoqchimisiz?
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button onClick={() => setOchirishModalOchiq(false)} className="m-cancel-btn">Bekor qilish</button>
                  <button onClick={handleOchirish} className="m-delete-confirm-btn">O'chirish</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TARIX */}
        <div className="m-history-section" style={{ marginTop: '40px' }}>
          <div className="m-history-head" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History size={22} color="var(--primary-color)" />
              <h2 style={{margin: 0}}>Kirimlar tarixi</h2>
            </div>
            {tarix.length > 0 && (
              <button className="m-pdf-btn" onClick={tarixExportPDF}>
                <Printer size={16} /> PDF Yuklash
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
    </div>
  );
};

export default Masalliqlar;