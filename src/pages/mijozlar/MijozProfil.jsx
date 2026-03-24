import React, { useMemo, useState, useEffect, useRef } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MdPhone, MdEdit, MdDelete, MdLocationOn, 
  MdPerson, MdHistory, MdCheckCircle,
  MdArrowBack, MdClose, MdSave, MdHelpOutline, MdAddShoppingCart,
  MdPayments, MdCreditCard, MdAccountBalanceWallet, MdDoneAll,
  MdChevronLeft, MdChevronRight, MdVisibility, MdDownload
} from 'react-icons/md'; 
import { useData } from '../../DataContext';
import toast, { Toaster } from 'react-hot-toast'; 
import html2pdf from 'html2pdf.js'; 
import './mijozlar.css';

const MijozProfil = ({ open }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pdfExportRef = useRef(); 
  
  const { 
    mijozlar = [], 
    sotuvlar = [], 
    mijozOchirish, 
    mijozYangilash, 
    sotuvQoshish,
    sotuvYangilash,
    sotuvOchirish,
    products = [], 
    productYangilash
  } = useData();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSotuvModal, setShowSotuvModal] = useState(false);
  const [showTolovModal, setShowTolovModal] = useState(false);
  const [showSotuvDeleteModal, setShowSotuvDeleteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false); 

  const [selectedSotuv, setSelectedSotuv] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [sotuvData, setSotuvData] = useState({ 
    mahsulot: '', miqdor: '', narx: '' 
  });

  const [tolovData, setTolovData] = useState({
    tolovTuri: 'naqd', tulanganSumma: ''
  });

  const [formData, setFormData] = useState({ ism: '', telefon: '', manzil: '', qarzdorlik: 0 });

  const mijoz = useMemo(() => mijozlar.find(m => String(m.id) === String(id)), [mijozlar, id]);

  useEffect(() => {
    if (mijoz) {
      setFormData({
        ism: mijoz.ism || '', 
        telefon: mijoz.telefon || '',
        manzil: mijoz.manzil || '', 
        qarzdorlik: mijoz.qarzdorlik || 0, 
        id: mijoz.id
      });
    }
  }, [mijoz]);

  const eskiSotuvlarList = useMemo(() => {
    const bugun = new Date();
    const joriyOy = bugun.getMonth();
    const joriyYil = bugun.getFullYear();

    return sotuvlar.filter(s => {
      const sSana = new Date(s.sana);
      return String(s.mijozId) === String(id) && 
             (sSana.getMonth() < joriyOy || sSana.getFullYear() < joriyYil);
    }).sort((a, b) => new Date(b.sana).getTime() - new Date(a.sana).getTime());
  }, [sotuvlar, id]);

  const hammaJoriyOySotuvlari = useMemo(() => {
    const bugun = new Date();
    const oy = bugun.getMonth();
    const yil = bugun.getFullYear();
    
    return sotuvlar.filter(s => {
      const sSana = new Date(s.sana);
      return String(s.mijozId) === String(id) && 
             sSana.getMonth() === oy && 
             sSana.getFullYear() === yil;
    }).sort((a, b) => new Date(b.sana).getTime() - new Date(a.sana).getTime());
  }, [sotuvlar, id]);

  const oydanQolganQarzVal = useMemo(() => {
    return eskiSotuvlarList.reduce((sum, s) => sum + (Number(s.summa || 0) - Number(s.tulangan || 0)), 0);
  }, [eskiSotuvlarList]);

  const eskiSotuvlarTotal = useMemo(() => {
    const jami = eskiSotuvlarList.reduce((sum, s) => sum + Number(s.summa || 0), 0);
    const tulangan = eskiSotuvlarList.reduce((sum, s) => sum + Number(s.tulangan || 0), 0);
    return { jami, tulangan, qoldiq: jami - tulangan };
  }, [eskiSotuvlarList]);

  const joriyOyJamiSumma = useMemo(() => {
    return hammaJoriyOySotuvlari.reduce((sum, s) => sum + (Number(s.summa || 0) - Number(s.tulangan || 0)), 0);
  }, [hammaJoriyOySotuvlari]);

  const totalPages = Math.ceil(hammaJoriyOySotuvlari.length / itemsPerPage);
  const joriySahifaSotuvlari = useMemo(() => {
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    return hammaJoriyOySotuvlari.slice(firstIndex, lastIndex);
  }, [hammaJoriyOySotuvlari, currentPage]);

  const handleDownloadPDF = () => {
    const element = pdfExportRef.current;
    const options = {
      margin: 10,
      filename: `${mijoz.ism}_xaridlar_tarixi.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    const loadingToast = toast.loading("PDF tayyorlanmoqda...");
    html2pdf().set(options).from(element).save()
      .then(() => {
        toast.dismiss(loadingToast);
        toast.success("Muvaffaqiyatli saqlandi!");
      })
      .catch(() => {
        toast.dismiss(loadingToast);
        toast.error("Xatolik yuz berdi!");
      });
  };

  const handleSotuvBajarish = async (e) => {
    e.preventDefault();
    const miqdor = parseFloat(sotuvData.miqdor);
    const narx = parseFloat(String(sotuvData.narx).replace(/\s/g, ""));
    const jami = miqdor * narx;

    const loader = toast.loading("Saqlanmoqda...");
    try {
        if (isEditMode) {
            const eskiSotuvQarz = Number(selectedSotuv.summa || 0) - Number(selectedSotuv.tulangan || 0);
            const yangiQarzBalansOzgardi = jami - eskiSotuvQarz;
            
            await mijozYangilash({ ...mijoz, qarzdorlik: Number(mijoz.qarzdorlik) + yangiQarzBalansOzgardi });
            await sotuvYangilash({ 
                ...selectedSotuv, 
                mahsulot: sotuvData.mahsulot, 
                miqdor, 
                summa: jami
            });
            toast.success("Sotuv yangilandi!");
        } else {
            const mahsulot = products.find(p => p.name === sotuvData.mahsulot);
            if (!mahsulot || parseFloat(mahsulot.stock) < miqdor) {
                toast.dismiss(loader);
                return toast.error("Omborda yetarli qoldiq yo'q!");
            }
            
            const isoSana = new Date().toISOString().split('T')[0];
            await productYangilash({ ...mahsulot, stock: parseFloat(mahsulot.stock) - miqdor });
            await mijozYangilash({ 
                ...mijoz, 
                qarzdorlik: parseFloat(mijoz.qarzdorlik || 0) + jami, 
                oxirgiXarid: isoSana 
            });
            await sotuvQoshish({ 
                mijozId: mijoz.id, 
                mahsulot: sotuvData.mahsulot, 
                miqdor, 
                summa: jami, 
                tulangan: 0, 
                sana: isoSana
            });
            toast.success("Muvaffaqiyatli saqlandi!");
        }
        setShowSotuvModal(false);
        setIsEditMode(false);
        setSotuvData({ mahsulot: '', miqdor: '', narx: '' });
    } catch (err) {
        toast.error("Xato: " + err.message);
    } finally {
        toast.dismiss(loader);
    }
  };

  const handleTolovBajarish = async (e) => {
    e.preventDefault();
    const rawTulangan = String(tolovData.tulanganSumma).replace(/\s/g, "");
    let tolovSummasi = rawTulangan === '' ? 0 : parseFloat(rawTulangan);

    const loader = toast.loading("Jarayon bajarilmoqda...");
    try {
        const yangiUmumiyQarz = Math.max(0, parseFloat(mijoz.qarzdorlik || 0) - tolovSummasi);
        await mijozYangilash({ ...mijoz, qarzdorlik: yangiUmumiyQarz });

        if (tolovSummasi > 0) {
            let qolganTolov = tolovSummasi;
            const joriySotuvlarCopy = [...hammaJoriyOySotuvlari].reverse(); 
            
            for (let s of joriySotuvlarCopy) {
                const qoldiqQarz = Number(s.summa) - Number(s.tulangan || 0);
                if (qolganTolov > 0 && qoldiqQarz > 0) {
                    const tolanishiKerak = Math.min(qoldiqQarz, qolganTolov);
                    await sotuvYangilash({
                        ...s,
                        tulangan: Number(s.tulangan || 0) + tolanishiKerak
                    });
                    qolganTolov -= tolanishiKerak;
                }
            }
        }
        toast.success(tolovSummasi > 0 ? "To'lov qabul qilindi!" : "Sotuvlar qarzga o'tkazildi!");
        setShowTolovModal(false);
        setTolovData({ tolovTuri: 'naqd', tulanganSumma: '' });
        setCurrentPage(1);
    } catch (err) {
        toast.error("Xato: " + err.message);
    } finally {
        toast.dismiss(loader);
    }
  };

  // SIZ AYTGAN ASOSIY QISM: Xaridni yopish va tarixga saqlash
  const handleConfirmMonth = async () => {
    if (hammaJoriyOySotuvlari.length === 0) return toast.error("Tasdiqlash uchun joriy oyda sotuvlar mavjud emas!");
    const loader = toast.loading("Oyni yopish...");
    try {
        for (let s of hammaJoriyOySotuvlari) {
            const eskiSana = new Date(s.sana);
            eskiSana.setMonth(eskiSana.getMonth() - 1); 
            await sotuvYangilash({ ...s, sana: eskiSana.toISOString().split('T')[0] });
        }
        toast.success("Barcha sotuvlar tarixga o'tkazildi!");
        setCurrentPage(1);
    } catch (err) {
        toast.error("Xato: " + err.message);
    } finally {
        toast.dismiss(loader);
    }
  };

  const handleEditSotuv = (s) => {
    setSelectedSotuv(s);
    setIsEditMode(true);
    setSotuvData({ 
      mahsulot: s.mahsulot, 
      miqdor: s.miqdor, 
      narx: s.summa / s.miqdor
    });
    setShowSotuvModal(true);
  };

  const handleAmountChange = (val) => {
    const rawValue = val.replace(/\s/g, "");
    if (rawValue === "" || !isNaN(rawValue)) {
      setTolovData({ ...tolovData, tulanganSumma: rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ") });
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
        await mijozYangilash(formData);
        toast.success("Ma'lumotlar yangilandi!");
        setShowEditModal(false);
    } catch (err) {
        toast.error("Xato: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (mijoz) {
      try {
          await mijozOchirish(mijoz.id);
          toast.success("Mijoz o'chirildi!");
          setShowDeleteModal(false);
          navigate('/mijozlar');
      } catch (err) {
          toast.error("O'chirishda xato!");
      }
    }
  };

  const handleDeleteSotuv = async () => {
    try {
        const sQarz = Number(selectedSotuv.summa || 0) - Number(selectedSotuv.tulangan || 0);
        await mijozYangilash({ ...mijoz, qarzdorlik: Number(mijoz.qarzdorlik) - sQarz });
        await sotuvOchirish(selectedSotuv.id);
        toast.success("Sotuv o'chirildi!");
        setShowSotuvDeleteModal(false);
    } catch (err) {
        toast.error("Xato yuz berdi!");
    }
  };

  if (!mijoz) return <div className="loading-state">Yuklanmoqda...</div>;

  return (
    <div className={`mijoz-profil-page ${open ? 'open' : 'closed'}`}>
      <Toaster position="top-right" reverseOrder={false} containerStyle={{ zIndex: 99999 }} />

      <div className="mp-top-navigation no-print">
        <button className="back-btn-circle" onClick={() => navigate('/mijozlar')}><MdArrowBack size={22} /></button>
        <div className="mp-breadcrumb-simple">Mijozlar / <strong>{mijoz.ism}</strong></div>
      </div>

      <div className="profil-grid-wrapper">
        <aside className="profil-aside-card no-print-section">
          <div className="inner-card">
            <div className="top-btns no-print">
              <button className="edit-icon-btn" onClick={() => setShowEditModal(true)}><MdEdit /></button>
              <button className="delete-icon-btn" onClick={() => setShowDeleteModal(true)}><MdDelete /></button>
            </div>
            <div className="user-main-info">
              <div className="user-avatar"><MdPerson size={40} /></div>
              <h2>{mijoz.ism}</h2>
              <span className="id-badge">ID: #{mijoz.id}</span>
            </div>
            
            <div className={`balance-status-box ${mijoz.qarzdorlik > 0 ? 'is-debt' : 'is-ok'}`} style={{ marginTop: '20px' }}>
              <small>Umumiy qarz balansi</small>
              <p>-{Number(mijoz.qarzdorlik).toLocaleString()} UZS</p>
            </div>

            <div className="contact-list">
              <div className="contact-row"><MdPhone className="row-icon" /> <span>{mijoz.telefon}</span></div>
              <div className="contact-row"><MdLocationOn className="row-icon" /> <span>{mijoz.manzil || 'Noma\'lum'}</span></div>
            </div>
          </div>
        </aside>

        <main className="profil-main-content">
          <div className="content-tabs no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="tab-left"><button className="active"><MdHistory size={22}  /> Sotuvlar (Joriy oy)</button></div>
            <div className="tab-right-actions">
              <button className="btn-add-sotuv" style={{background:'var(--primary-color)'}} onClick={() => { setIsEditMode(false); setSotuvData({ mahsulot: '', miqdor: '', narx: '' }); setShowSotuvModal(true); }}>
                <MdAddShoppingCart /> Yangi sotuv
              </button>
            </div>
          </div>

          <div className="history-table-container joriy-oy-print">
            <table className="mijoz-table">
              <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 5 }}>
                <tr><th>Sana</th><th>Mahsulot</th><th>Summa</th><th>Xodim</th><th className="no-print">Amallar</th></tr>
              </thead>
              <tbody>
                {joriySahifaSotuvlari.length > 0 ? joriySahifaSotuvlari.map((s, i) => (
                  <tr key={i}>
                    <td>{s.sana}</td>
                    <td className="bold-text">{s.mahsulot} ({s.miqdor} kg)</td>
                    <td className="bold-text">{Number(s.summa).toLocaleString()} UZS</td>
                    <td><div className="admin-tag"><MdCheckCircle /> Admin</div></td>
                    <td className="no-print">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEditSotuv(s)} style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><MdEdit size={18} /></button>
                        <button onClick={() => { setSelectedSotuv(s); setShowSotuvDeleteModal(true); }} style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><MdDelete size={18} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (<tr><td colSpan="5" className="empty-row">Ushbu oyda hali sotuvlar yo'q</td></tr>)}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-container no-print">
              <div className="pagination-info">Jami: {hammaJoriyOySotuvlari.length} ta xarid</div>
              <div className="pagination-controls">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="pag-nav-btn"><MdChevronLeft size={20} /></button>
                <div className="pag-current-box"><span className="pag-number-display">{currentPage}</span></div>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="pag-nav-btn"><MdChevronRight size={20} /></button>
              </div>
            </div>
          )}

          <div className="bottom-action-bar no-print" style={{ display: 'flex', gap: '20px', marginTop: '20px', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Joriy oy xaridi (qarz):</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{Number(joriyOyJamiSumma).toLocaleString()} UZS</div>
            </div>
            
            <button className="btn-confirm-all" style={{ background: 'var(--primary-color)', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'var(--font-weight-700)', fontSize: 'var(--font-size-16)' }} 
              onClick={() => { setTolovData({ tolovTuri: 'naqd', tulanganSumma: '' }); setShowTolovModal(true); }}>
              <MdPayments size={22} /> To'lov / Tasdiqlash
            </button>
            
            <button className="btn-confirm-all" style={{ background: 'var(--primary-color)', color: '#fff', padding: '12px 20px', borderRadius: '10px', border: 'none', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'var(--font-weight-700)' }} onClick={handleConfirmMonth}>
              <MdDoneAll size={20} /> Xaridni yopish 
            </button>
          </div>

          {eskiSotuvlarList.length > 0 && (
            <div className="history-link-box no-print" onClick={() => setShowHistoryModal(true)} style={{ marginTop: '20px', padding: '15px', background: '#fff', borderRadius: '10px', border: '1px dashed #cbd5e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MdHistory size={24} color="#64748b" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#1e293b' }}>Eski oylar tarixi</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Barcha eski xaridlar ro'yxati</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', fontSize: '18px', color: oydanQolganQarzVal > 0 ? '#ef4444' : '#22c55e' }}>
                  {oydanQolganQarzVal > 0 ? `-${Number(oydanQolganQarzVal).toLocaleString()}` : '0'} UZS
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>Ko'rish <MdVisibility size={16} /></div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- MODAL QISMLARI (ORIGINAL STYLE) --- */}

      {showSotuvModal && (
        <div className="logout-modal-overlay" onClick={() => setShowSotuvModal(false)}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>{isEditMode ? "Sotuvni tahrirlash" : "Mahsulot sotish"}</h3>
              <button className="close-btn" onClick={() => setShowSotuvModal(false)}><MdClose size={24}/></button>
            </div>
            <form onSubmit={handleSotuvBajarish} className="edit-form">
              <div className="form-group"><label>Mahsulot</label>
                <select className="input-style" value={sotuvData.mahsulot} onChange={(e) => {
                  const p = products.find(x => x.name === e.target.value);
                  setSotuvData({...sotuvData, mahsulot: e.target.value, narx: p ? p.price : ''});
                }} required>
                  <option value="">Tanlang...</option>
                  {products.map(p => <option key={p.id} value={p.name}>{p.name} ({p.stock} kg)</option>)}
                </select>
              </div>
              <div style={{display:'flex', gap:'10px'}}>
                <div className="form-group" style={{flex:1}}><label>Miqdor (kg)</label><input type="number" step="0.01" value={sotuvData.miqdor} onChange={(e) => setSotuvData({...sotuvData, miqdor: e.target.value})} required /></div>
                <div className="form-group" style={{flex:1}}><label>Narx</label><input type="number" value={sotuvData.narx} onChange={(e) => setSotuvData({...sotuvData, narx: e.target.value})} required /></div>
              </div>
              <div className="total-display-box">Summa: {(Number(sotuvData.miqdor) * Number(sotuvData.narx)).toLocaleString()} UZS</div>
              <div className="edit-modal-footer"><button type="submit" className="btn-save" style={{background:'var(--primary-color)'}}>{isEditMode ? "Saqlash" : "Tasdiqlash"}</button></div>
            </form>
          </div>
        </div>
      )}

      {showTolovModal && (
        <div className="logout-modal-overlay" onClick={() => setShowTolovModal(false)}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header"><h3>To'lovni tasdiqlash</h3><button className="close-btn" onClick={() => setShowTolovModal(false)}><MdClose size={24}/></button></div>
            <form onSubmit={handleTolovBajarish} className="edit-form">
              <div className="form-group"><label>To'lov turi</label>
                <div className="payment-type-grid">
                  {['naqd', 'karta', 'perevod'].map(t => (
                    <button key={t} type="button" className={`pay-type-btn ${tolovData.tolovTuri === t ? 'active' : ''}`} onClick={() => setTolovData({...tolovData, tolovTuri: t})}>
                      {t === 'naqd' ? <MdPayments /> : t === 'karta' ? <MdCreditCard /> : <MdAccountBalanceWallet />} {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group"><label>To'lanayotgan summa</label><input type="text" value={tolovData.tulanganSumma} onChange={(e) => handleAmountChange(e.target.value)} placeholder="0" /></div>
              <div className="edit-modal-footer"><button type="submit" className="btn-save" style={{ background: 'var(--primary-color)' }}>Tasdiqlash</button></div>
            </form>
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="logout-modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="edit-modal-content" style={{ maxWidth: '950px', width: '98%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header no-print">
              <h3>Xaridlar tarixi</h3>
              <button className="close-btn" onClick={() => setShowHistoryModal(false)}><MdClose size={24}/></button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '10px' }}>
                <div ref={pdfExportRef} style={{ padding: '20px', background: '#fff' }}>
                    <div className="pdf-header" style={{ marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                      <h2 style={{ margin: 0 }}>{mijoz.ism}</h2>
                      <p style={{ color: '#666' }}>Xaridlar tarixi hisoboti</p>
                    </div>
                    <table className="mijoz-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={{ border: '1px solid #dee2e6', padding: '12px', textAlign: 'left' }}>SANA</th>
                                <th style={{ border: '1px solid #dee2e6', padding: '12px', textAlign: 'left' }}>MAHSULOT</th>
                                <th style={{ border: '1px solid #dee2e6', padding: '12px', textAlign: 'center' }}>BIRLIK</th>
                                <th style={{ border: '1px solid #dee2e6', padding: '12px', textAlign: 'center' }}>1 KG NARXI</th>
                                <th style={{ border: '1px solid #dee2e6', padding: '12px', textAlign: 'center' }}>MIQDOR</th>
                                <th style={{ border: '1px solid #dee2e6', padding: '12px', textAlign: 'right' }}>SUMMA</th>
                            </tr>
                        </thead>
                        <tbody>
                          {eskiSotuvlarList.map((s, i) => (
                            <tr key={i}>
                              <td style={{ border: '1px solid #dee2e6', padding: '12px' }}>{s.sana}</td>
                              <td style={{ border: '1px solid #dee2e6', padding: '12px', fontWeight: 'bold' }}>{s.mahsulot}</td>
                              <td style={{ border: '1px solid #dee2e6', padding: '12px', textAlign: 'center' }}>kg</td>
                              <td style={{ border: '1px solid #dee2e6', padding: '12px', textAlign: 'center' }}>{Number(s.summa / s.miqdor).toLocaleString()}</td>
                              <td style={{ border: '1px solid #dee2e6', padding: '12px', textAlign: 'center' }}>{s.miqdor}</td>
                              <td style={{ border: '1px solid #dee2e6', padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>{Number(s.summa).toLocaleString()} UZS</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: '#f8f9fa' }}><td colSpan="5" style={{ textAlign: 'right', fontWeight: 'bold', padding: '12px' }}>JAMI XARIDLAR:</td><td style={{ textAlign: 'right', fontWeight: 'bold', padding: '12px' }}>{eskiSotuvlarTotal.jami.toLocaleString()} UZS</td></tr>
                          <tr><td colSpan="5" style={{ textAlign: 'right', fontWeight: 'bold', color: '#22c55e', padding: '12px' }}>TO'LANGAN SUMMA:</td><td style={{ textAlign: 'right', fontWeight: 'bold', color: '#22c55e', padding: '12px' }}>{eskiSotuvlarTotal.tulangan.toLocaleString()} UZS</td></tr>
                          <tr style={{ background: '#fff1f2' }}><td colSpan="5" style={{ textAlign: 'right', fontWeight: 'bold', color: '#e11d48', padding: '12px' }}>ESKI QARZ:</td><td style={{ textAlign: 'right', fontWeight: 'bold', color: '#e11d48', padding: '12px' }}>{eskiSotuvlarTotal.qoldiq.toLocaleString()} UZS</td></tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <div className="edit-modal-footer no-print"><button onClick={handleDownloadPDF} style={{background:'var(--primary-color)'}} className="btn-save"><MdDownload /> PDF Yuklash</button></div>
          </div>
        </div>
      )}

      {showSotuvDeleteModal && (
        <div className="logout-modal-overlay" onClick={() => setShowSotuvDeleteModal(false)}>
          <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon"><MdHelpOutline size={48} color="var(--primary-color)" /></div>
            <h3 className="logout-modal-title">O'chirilsinmi?</h3>
            <div className="logout-modal-actions">
              <button className="logout-btn-cancel" onClick={() => setShowSotuvDeleteModal(false)}>Yo'q</button>
              <button className="logout-btn-confirm" onClick={handleDeleteSotuv} style={{ background: 'var(--primary-color)' }}>Ha</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="logout-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header"><h3>Tahrirlash</h3><button className="close-btn" onClick={() => setShowEditModal(false)}><MdClose size={24}/></button></div>
            <form onSubmit={handleSaveEdit} className="edit-form">
              <div className="form-group"><label>Ism</label><input type="text" value={formData.ism} onChange={(e) => setFormData({...formData, ism: e.target.value})} /></div>
              <div className="form-group"><label>Telefon</label><input type="text" value={formData.telefon} onChange={(e) => setFormData({...formData, telefon: e.target.value})} /></div>
              <div className="edit-modal-footer"><button type="submit" className="btn-save" style={{background:'var(--primary-color)'}}><MdSave /> Saqlash</button></div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="logout-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon"><MdHelpOutline size={48} color="var(--primary-color)" /></div>
            <h3 className="logout-modal-title">Mijoz o'chirilsinmi?</h3>
            <div className="logout-modal-actions">
              <button className="logout-btn-cancel" onClick={() => setShowDeleteModal(false)}>Yo'q</button>
              <button className="logout-btn-confirm" onClick={handleDelete} style={{ background: 'var(--primary-color)' }}>Ha</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MijozProfil;