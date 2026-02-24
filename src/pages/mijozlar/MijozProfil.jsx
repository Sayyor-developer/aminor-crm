import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react'; 
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
    setProducts 
  } = useData();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSotuvModal, setShowSotuvModal] = useState(false);
  const [showSotuvDeleteModal, setShowSotuvDeleteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false); 

  const [selectedSotuv, setSelectedSotuv] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [sotuvData, setSotuvData] = useState({ 
    mahsulot: '', miqdor: '', narx: '', tolovTuri: 'naqd', tulanganSumma: '' 
  });

  const [formData, setFormData] = useState({ ism: '', telefon: '', manzil: '', qarzdorlik: 0 });

  const mijoz = useMemo(() => mijozlar.find(m => String(m.id) === String(id)), [mijozlar, id]);

  useEffect(() => {
    if (mijoz) {
      setFormData({
        ism: mijoz.ism || '', telefon: mijoz.telefon || '',
        manzil: mijoz.manzil || '', qarzdorlik: mijoz.qarzdorlik || 0, id: mijoz.id
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

  const oydanQolganQarzVal = useMemo(() => {
    return eskiSotuvlarList.reduce((sum, s) => sum + (Number(s.summa || 0) - Number(s.tulangan || 0)), 0);
  }, [eskiSotuvlarList]);

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

  const handleSotuvBajarish = useCallback((e) => {
    e.preventDefault();
    const miqdor = parseFloat(sotuvData.miqdor);
    const narx = parseFloat(String(sotuvData.narx).replace(/\s/g, ""));
    const jami = miqdor * narx;
    const rawTulangan = String(sotuvData.tulanganSumma).replace(/\s/g, "");
    let tolov = rawTulangan === '' ? 0 : parseFloat(rawTulangan);
    const yangiQarz = jami - tolov;

    if (isEditMode) {
      const eskiQarz = Number(selectedSotuv.summa || 0) - Number(selectedSotuv.tulangan || 0);
      const balansOzgardi = yangiQarz - eskiQarz;
      
      mijozYangilash({ ...mijoz, qarzdorlik: Number(mijoz.qarzdorlik) + balansOzgardi });
      sotuvYangilash({ 
        ...selectedSotuv, 
        mahsulot: sotuvData.mahsulot, 
        miqdor, 
        summa: jami, 
        tulangan: tolov, 
        tolovTuri: sotuvData.tolovTuri 
      });
      toast.success("Sotuv yangilandi!");
    } else {
      const mahsulot = products.find(p => p.name === sotuvData.mahsulot);
      if (!mahsulot || parseFloat(mahsulot.stock) < miqdor) return toast.error("Omborda yetarli qoldiq yo'q!");
      
      const isoSana = new Date().toISOString().split('T')[0];
      setProducts(products.map(p => p.id === mahsulot.id ? { ...p, stock: parseFloat(p.stock) - miqdor } : p));
      
      mijozYangilash({ 
        ...mijoz, 
        qarzdorlik: parseFloat(mijoz.qarzdorlik || 0) + yangiQarz, 
        oxirgiXarid: isoSana 
      });

      sotuvQoshish({ 
        id: Date.now(), 
        mijozId: mijoz.id, 
        mijozIsmi: mijoz.ism, 
        mahsulot: sotuvData.mahsulot, 
        miqdor, 
        summa: jami, 
        tulangan: tolov, 
        sana: isoSana, 
        tolovTuri: sotuvData.tolovTuri 
      });
      toast.success("Muvaffaqiyatli saqlandi!");
    }
    setShowSotuvModal(false);
    setIsEditMode(false);
    setSotuvData({ mahsulot: '', miqdor: '', narx: '', tolovTuri: 'naqd', tulanganSumma: '' });
  }, [sotuvData, products, mijoz, mijozYangilash, sotuvQoshish, setProducts, isEditMode, selectedSotuv, sotuvYangilash]);

  const handleConfirmMonth = useCallback(() => {
    const bugun = new Date();
    const oy = bugun.getMonth();
    const yil = bugun.getFullYear();
    const joriySotuvlar = sotuvlar.filter(s => {
      const sSana = new Date(s.sana);
      return String(s.mijozId) === String(id) && sSana.getMonth() === oy && sSana.getFullYear() === yil;
    });
    if (joriySotuvlar.length === 0) return toast.error("Tasdiqlash uchun joriy oyda sotuvlar mavjud emas!");
    
    joriySotuvlar.forEach(s => {
      const eskiSana = new Date(s.sana);
      eskiSana.setMonth(eskiSana.getMonth() - 1);
      sotuvYangilash({ ...s, sana: eskiSana.toISOString().split('T')[0] });
    });
    toast.success("Barcha sotuvlar tarixga o'tkazildi!");
    setCurrentPage(1);
  }, [id, sotuvlar, sotuvYangilash]);

  const handleEditSotuv = (s) => {
    setSelectedSotuv(s);
    setIsEditMode(true);
    setSotuvData({ 
      mahsulot: s.mahsulot, 
      miqdor: s.miqdor, 
      narx: s.summa / s.miqdor, 
      tolovTuri: s.tolovTuri, 
      tulanganSumma: String(s.tulangan).replace(/\B(?=(\d{3})+(?!\d))/g, " ") 
    });
    setShowSotuvModal(true);
  };

  const handleAmountChange = (val) => {
    const rawValue = val.replace(/\s/g, "");
    if (!isNaN(rawValue)) {
      setSotuvData({ ...sotuvData, tulanganSumma: rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ") });
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    mijozYangilash(formData);
    toast.success("Ma'lumotlar yangilandi!");
    setShowEditModal(false);
  };

  const handleDelete = () => {
    if (mijoz) {
      mijozOchirish(mijoz.id);
      toast.success("Mijoz o'chirildi!");
      setShowDeleteModal(false);
      navigate('/mijozlar');
    }
  };

  const handleDeleteSotuv = () => {
    const sQarz = Number(selectedSotuv.summa || 0) - Number(selectedSotuv.tulangan || 0);
    mijozYangilash({ ...mijoz, qarzdorlik: Number(mijoz.qarzdorlik) - sQarz });
    sotuvOchirish(selectedSotuv.id);
    toast.success("Sotuv o'chirildi!");
    setShowSotuvDeleteModal(false);
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
            <div className="old-debt-box">
              <small>Oydan qolgan qarz</small>
              <p>{Number(oydanQolganQarzVal).toLocaleString()} UZS</p>
            </div>
            <div className={`balance-status-box ${mijoz.qarzdorlik > 0 ? 'is-debt' : 'is-ok'}`}>
              <small>Umumiy qarz(bugungi xarid)</small>
              <p>{Number(mijoz.qarzdorlik).toLocaleString()} UZS</p>
            </div>
            <div className="contact-list">
              <div className="contact-row"><MdPhone className="row-icon" /> <span>{mijoz.telefon}</span></div>
              <div className="contact-row"><MdLocationOn className="row-icon" /> <span>{mijoz.manzil || 'Noma\'lum'}</span></div>
            </div>
          </div>
        </aside>

        <main className="profil-main-content">
          <div className="content-tabs no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="tab-left"><button className="active"><MdHistory /> Sotuvlar (Joriy oy)</button></div>
            <div className="tab-right-actions">
              <button className="btn-add-sotuv" onClick={() => { setIsEditMode(false); setSotuvData({ mahsulot: '', miqdor: '', narx: '', tolovTuri: 'naqd', tulanganSumma: '' }); setShowSotuvModal(true); }}>
                <MdAddShoppingCart /> Yangi sotuv
              </button>
            </div>
          </div>

          <div className="history-table-container joriy-oy-print">
            <table className="mijoz-table">
              <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 5 }}>
                <tr><th>Sana</th><th>Mahsulot</th><th>Summa (To'lov)</th><th>Tur</th><th>Xodim</th><th className="no-print">Amallar</th></tr>
              </thead>
              <tbody>
                {joriySahifaSotuvlari.length > 0 ? joriySahifaSotuvlari.map((s, i) => {
                  const qolganQarz = Number(s.summa) - Number(s.tulangan);
                  return (
                    <tr key={i}>
                      <td>{s.sana}</td>
                      <td className="bold-text">{s.mahsulot} ({s.miqdor} kg)</td>
                      <td>
                        <span className="text-green" style={{ fontWeight: '600' }}>
                          {Number(s.tulangan).toLocaleString()}
                        </span>
                        {qolganQarz > 0 && (
                          <span style={{ color: '#e53e3e', fontSize: '12px', marginLeft: '8px', fontWeight: 'bold' }}>
                            -{Number(qolganQarz).toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td><span className="type-tag">{s.tolovTuri}</span></td>
                      <td><div className="admin-tag"><MdCheckCircle /> Admin</div></td>
                      <td className="no-print">
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleEditSotuv(s)} style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><MdEdit size={18} /></button>
                          <button onClick={() => { setSelectedSotuv(s); setShowSotuvDeleteModal(true); }} style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><MdDelete size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                }) : (<tr><td colSpan="6" className="empty-row">Ushbu oyda hali sotuvlar yo'q</td></tr>)}
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

          {/* 1. TASDIQLASH TUGMASI ENDI TEPADA (Jadvaldan keyin) */}
          <div className="bottom-action-bar no-print" style={{ display: 'flex', gap: '15px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button className="btn-confirm-all" style={{ background: 'var(--primary-color)', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }} onClick={handleConfirmMonth}>
              <MdDoneAll size={20} /> Oyni tasdiqlash
            </button>
          </div>

          {/* 2. RO'YXATLAR (TARIX) ENDI ENG PASTDA */}
          {oydanQolganQarzVal > 0 && (
            <div className="history-link-box no-print" 
                onClick={() => setShowHistoryModal(true)}
                style={{ marginTop: '20px', padding: '15px', background: '#fff5f5', borderRadius: '10px', border: '1px dashed #feb2b2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MdHistory size={24} color="#e53e3e" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#c53030' }}>Ro'yxatlar (Tarix)</div>
                  <div style={{ fontSize: '12px', color: '#9b2c2c' }}>Barcha eski oylardagi xaridlar ro'yxati</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#c53030' }}>+{Number(oydanQolganQarzVal).toLocaleString()} UZS</div>
                <div style={{ fontSize: '12px', color: '#c53030', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  Ko'rish <MdVisibility />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODALLAR QISMI O'ZGARISHSIZ QOLDI */}
      {showHistoryModal && (
        <div className="logout-modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="edit-modal-content" style={{ maxWidth: '850px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header no-print">
              <h3>Xaridlar tarixi (Eski oylar)</h3>
              <button className="close-btn" onClick={() => setShowHistoryModal(false)}><MdClose size={24}/></button>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, padding: '10px' }}>
                <div ref={pdfExportRef} style={{ padding: '20px', background: '#fff' }}>
                    <div style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ margin: 0, color: '#333' }}>{mijoz.ism}</h2>
                            <p style={{ margin: '5px 0', color: '#666' }}>Telefon: {mijoz.telefon}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h4 style={{ margin: 0 }}>Xaridlar Hisoboti</h4>
                            <p style={{ margin: '5px 0', color: '#666' }}>Sana: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <table className="mijoz-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={{ border: '1px solid #dee2e6', padding: '12px' }}>SANA</th>
                                <th style={{ border: '1px solid #dee2e6', padding: '12px' }}>MAHSULOT</th>
                                <th style={{ border: '1px solid #dee2e6', padding: '12px' }}>SUMMA</th>
                                <th style={{ border: '1px solid #dee2e6', padding: '12px' }}>TO'LANGAN</th>
                                <th style={{ border: '1px solid #dee2e6', padding: '12px' }}>QOLGAN</th>
                            </tr>
                        </thead>
                        <tbody>
                          {eskiSotuvlarList.map((s, i) => (
                            <tr key={i}>
                              <td style={{ border: '1px solid #dee2e6', padding: '12px' }}>{s.sana}</td>
                              <td style={{ border: '1px solid #dee2e6', padding: '12px' }} className="bold-text">{s.mahsulot} ({s.miqdor} kg)</td>
                              <td style={{ border: '1px solid #dee2e6', padding: '12px' }}>{Number(s.summa).toLocaleString()}</td>
                              <td style={{ border: '1px solid #dee2e6', padding: '12px' }}>{Number(s.tulangan || 0).toLocaleString()}</td>
                              <td style={{ border: '1px solid #dee2e6', padding: '12px', color: '#e53e3e', fontWeight: 'bold' }}>-{Number(s.summa - (s.tulangan || 0)).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: '#fff' }}>
                                <td colSpan="4" style={{ border: '1px solid #dee2e6', padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Jami qarz:</td>
                                <td style={{ border: '1px solid #dee2e6', padding: '12px', color: '#e53e3e', fontWeight: 'bold', fontSize: '16px' }}>{Number(oydanQolganQarzVal).toLocaleString()} UZS</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="edit-modal-footer no-print" style={{ justifyContent: 'flex-end', padding: '15px', borderTop: '1px solid #eee' }}>
               <button onClick={handleDownloadPDF} style={{ background: 'var(--primary-color)', color: '#fff', padding: '10px 25px', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600' }}>
                <MdDownload size={20} /> PDF Yuklab olish
               </button>
            </div>
          </div>
        </div>
      )}

      {showSotuvModal && (
        <div className="logout-modal-overlay" onClick={() => setShowSotuvModal(false)}>
          <div className="edit-modal-content" style={{ maxHeight: '95vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>{isEditMode ? "Sotuvni tahrirlash" : "Yangi Sotuv"}</h3>
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
                <div className="form-group" style={{flex:1}}><label>Miqdor(kg)</label><input type="number" step="0.01" value={sotuvData.miqdor} onChange={(e) => setSotuvData({...sotuvData, miqdor: e.target.value})} required /></div>
                <div className="form-group" style={{flex:1}}><label>Narx</label><input type="number" value={sotuvData.narx} onChange={(e) => setSotuvData({...sotuvData, narx: e.target.value})} required /></div>
              </div>
              <div className="total-display-box">Jami xarid: {(Number(sotuvData.miqdor) * Number(sotuvData.narx)).toLocaleString()} UZS</div>
              <div className="form-group"><label>To'lov turi</label>
                <div className="payment-type-grid">
                  {['naqd', 'karta', 'perevod'].map(t => (
                    <button key={t} type="button" className={`pay-type-btn ${sotuvData.tolovTuri === t ? 'active' : ''}`} onClick={() => setSotuvData({...sotuvData, tolovTuri: t})}>
                      {t === 'naqd' ? <MdPayments /> : t === 'karta' ? <MdCreditCard /> : <MdAccountBalanceWallet />} {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group"><label>To'langan summa</label><input type="text" value={sotuvData.tulanganSumma} onChange={(e) => handleAmountChange(e.target.value)} placeholder="Summani kiriting" /></div>
              <div className="edit-modal-footer"><button type="submit" className="btn-save">{isEditMode ? "Saqlash" : "Tasdiqlash"}</button></div>
            </form>
          </div>
        </div>
      )}

      {showSotuvDeleteModal && (
        <div className="logout-modal-overlay" onClick={() => setShowSotuvDeleteModal(false)}>
          <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon"><MdHelpOutline size={48} color="var(--primary-color)" /></div>
            <h3 className="logout-modal-title">Sotuv o'chirilsinmi?</h3>
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
              <div className="edit-modal-footer"><button type="submit" className="btn-save"><MdSave /> Saqlash</button></div>
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