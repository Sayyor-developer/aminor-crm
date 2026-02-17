import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MdPhone, MdEdit, MdDelete, MdLocationOn, 
  MdPerson, MdHistory, MdCheckCircle,
  MdArrowBack, MdClose, MdSave, MdHelpOutline, MdAddShoppingCart,
  MdPayments, MdCreditCard, MdAccountBalanceWallet, MdPrint,
  MdChevronLeft, MdChevronRight
} from 'react-icons/md'; 
import { useData } from '../../DataContext';
import toast, { Toaster } from 'react-hot-toast'; 
import './mijozlar.css';

const MijozProfil = ({ open }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { 
    mijozlar = [], 
    sotuvlar = [], 
    mijozOchirish, 
    mijozYangilash, 
    sotuvQoshish, 
    products = [], 
    setProducts 
  } = useData();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSotuvModal, setShowSotuvModal] = useState(false);
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

  const oydanQolganQarzVal = useMemo(() => {
    if (!mijoz || !sotuvlar.length) return 0;
    const bugun = new Date();
    const joriyOy = bugun.getMonth();
    const joriyYil = bugun.getFullYear();

    return sotuvlar.filter(s => {
      const sSana = new Date(s.sana);
      return String(s.mijozId) === String(id) && 
             (sSana.getMonth() < joriyOy || sSana.getFullYear() < joriyYil);
    }).reduce((sum, s) => sum + (Number(s.summa || 0) - Number(s.tulangan || 0)), 0);
  }, [sotuvlar, id, mijoz]);

  const joriyOySotuvlari = useMemo(() => {
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

  const jamiSotuvlarTarixi = useMemo(() => {
    return sotuvlar.filter(s => String(s.mijozId) === String(id))
      .sort((a, b) => new Date(b.sana).getTime() - new Date(a.sana).getTime());
  }, [sotuvlar, id]);

  const handleSotuvBajarish = useCallback((e) => {
    e.preventDefault();
    const miqdor = parseFloat(sotuvData.miqdor);
    const narx = parseFloat(String(sotuvData.narx).replace(/\s/g, ""));
    const jami = miqdor * narx;
    
    // To'langan summani saqlashdan oldin probellarni olib tashlaymiz
    const rawTulangan = String(sotuvData.tulanganSumma).replace(/\s/g, "");

    let tolov = sotuvData.tolovTuri === 'naqd' 
      ? (rawTulangan === '' ? 0 : parseFloat(rawTulangan))
      : jami;

    const mahsulot = products.find(p => p.name === sotuvData.mahsulot);
    if (!mahsulot || parseFloat(mahsulot.stock) < miqdor) return toast.error("Omborda yetarli qoldiq yo'q!");

    const qarz = jami - tolov;
    const bugun = new Date().toLocaleDateString('uz-UZ');
    const isoSana = new Date().toISOString().split('T')[0];

    setProducts(products.map(p => p.id === mahsulot.id ? { ...p, stock: parseFloat(p.stock) - miqdor } : p));

    mijozYangilash({
      ...mijoz,
      qarzdorlik: parseFloat(mijoz.qarzdorlik || 0) + (qarz > 0 ? qarz : 0),
      oxirgiXarid: isoSana,
      tolovTarixi: [{
        sana: bugun, miqdor: `${tolov.toLocaleString()} so'm`,
        izoh: `${sotuvData.mahsulot} (${miqdor} kg). ${qarz > 0 ? 'Qarz: ' + qarz.toLocaleString() : 'To\'liq'}`
      }, ...(mijoz.tolovTarixi || [])]
    });

    sotuvQoshish({
      id: Date.now(), mijozId: mijoz.id, mijozIsmi: mijoz.ism, mahsulot: sotuvData.mahsulot,
      miqdor, summa: jami, tulangan: tolov, sana: isoSana, tolovTuri: sotuvData.tolovTuri
    });

    setShowSotuvModal(false);
    setSotuvData({ mahsulot: '', miqdor: '', narx: '', tolovTuri: 'naqd', tulanganSumma: '' });
    toast.success("Muvaffaqiyatli saqlandi!");
  }, [sotuvData, products, mijoz, mijozYangilash, sotuvQoshish, setProducts]);

  // Raqamlarni ajratib yozish uchun yordamchi funksiya
  const handleAmountChange = (val) => {
    const rawValue = val.replace(/\s/g, "");
    if (!isNaN(rawValue)) {
      setSotuvData({
        ...sotuvData,
        tulanganSumma: rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
      });
    }
  };

  const handleSaveEdit = useCallback((e) => {
    e.preventDefault();
    mijozYangilash(formData);
    toast.success("Ma'lumotlar yangilandi!");
    setShowEditModal(false);
  }, [formData, mijozYangilash]);

  const handleDelete = useCallback(() => {
    if (mijoz) {
      mijozOchirish(mijoz.id);
      toast.success("Mijoz o'chirildi!");
      setShowDeleteModal(false);
      navigate('/mijozlar');
    }
  }, [mijozOchirish, mijoz, navigate]);

  const currentJamiItems = useMemo(() => {
    const last = currentPage * itemsPerPage;
    return jamiSotuvlarTarixi.slice(last - itemsPerPage, last);
  }, [jamiSotuvlarTarixi, currentPage]);

  const totalPages = Math.ceil(jamiSotuvlarTarixi.length / itemsPerPage);

  if (!mijoz) return <div className="loading-state">Yuklanmoqda...</div>;

  return (
    <div className={`mijoz-profil-page ${open ? 'open' : 'closed'}`}>
      <Toaster position="top-right" reverseOrder={false} containerStyle={{ zIndex: 99999 }} />

      <div className="mp-top-navigation no-print">
        <button className="back-btn-circle" onClick={() => navigate('/mijozlar')}>
          <MdArrowBack size={22} />
        </button>
        <div className="mp-breadcrumb-simple">Mijozlar / <strong>{mijoz.ism}</strong></div>
      </div>

      <div className="profil-grid-wrapper">
        <aside className="profil-aside-card">
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
              <small>Umumiy qarz</small>
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
            <div className="tab-right-actions" style={{ display: 'flex', gap: 'var(--gap-10)' }}>
              <button className="btn-print" onClick={() => window.print()}><MdPrint /> PDF Chop etish</button>
              <button className="btn-add-sotuv" onClick={() => setShowSotuvModal(true)}><MdAddShoppingCart /> Yangi sotuv</button>
            </div>
          </div>

          <div className="history-table-container">
            <table className="mijoz-table">
              <thead><tr><th>Sana</th><th>Mahsulot</th><th>Summa</th><th>Tur</th><th>Xodim</th></tr></thead>
              <tbody>
                {joriyOySotuvlari.length > 0 ? joriyOySotuvlari.map((s, i) => (
                  <tr key={i}>
                    <td>{s.sana}</td><td className="bold-text">{s.mahsulot}</td>
                    <td className="text-red">+{Number(s.summa).toLocaleString()}</td>
                    <td><span className="type-tag">{s.tolovTuri}</span></td>
                    <td><div className="admin-tag"><MdCheckCircle /> Admin</div></td>
                  </tr>
                )) : (<tr><td colSpan="5" className="empty-row">Ushbu oyda hali sotuvlar yo'q</td></tr>)}
              </tbody>
            </table>
          </div>

          <div className="content-tabs no-print" style={{ marginTop: '40px' }}>
            <div className="tab-left"><button className="active"><MdHistory /> Jami sotuvlar (Tarix)</button></div>
          </div>

          <div className="history-table-container">
            <table className="mijoz-table">
              <thead><tr><th>Sana</th><th>Mahsulot</th><th>Summa</th><th>Tur</th><th>Xodim</th></tr></thead>
              <tbody>
                {currentJamiItems.length > 0 ? currentJamiItems.map((s, i) => (
                  <tr key={i}>
                    <td>{s.sana}</td><td className="bold-text">{s.mahsulot}</td>
                    <td className="text-red">+{Number(s.summa).toLocaleString()}</td>
                    <td><span className="type-tag">{s.tolovTuri}</span></td>
                    <td><div className="admin-tag"><MdCheckCircle /> Admin</div></td>
                  </tr>
                )) : (<tr><td colSpan="5" className="empty-row">Tarixiy ma'lumotlar mavjud emas</td></tr>)}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="pagination-wrapper no-print">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="pagi-btn"><MdChevronLeft /></button>
                <span className="pagi-info">{currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="pagi-btn"><MdChevronRight /></button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODALLAR */}
      {showSotuvModal && (
        <div className="logout-modal-overlay" onClick={() => setShowSotuvModal(false)}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>Yangi Sotuv</h3>
              <button className="close-btn" onClick={() => setShowSotuvModal(false)}><MdClose size={24}/></button>
            </div>
            <form onSubmit={handleSotuvBajarish} className="edit-form">
              <div className="form-group">
                <label>Mahsulot</label>
                <select className="input-style" value={sotuvData.mahsulot} onChange={(e) => {
                  const p = products.find(x => x.name === e.target.value);
                  setSotuvData({...sotuvData, mahsulot: e.target.value, narx: p ? p.price : ''});
                }} required>
                  <option value="">Tanlang...</option>
                  {products.map(p => <option key={p.id} value={p.name}>{p.name} ({p.stock} kg)</option>)}
                </select>
              </div>
              <div style={{display:'flex', gap:'var(--gap-10)'}}>
                <div className="form-group" style={{flex:1}}><label>Miqdor</label><input type="number" step="0.01" value={sotuvData.miqdor} onChange={(e) => setSotuvData({...sotuvData, miqdor: e.target.value})} required /></div>
                <div className="form-group" style={{flex:1}}><label>Narx</label><input type="number" value={sotuvData.narx} onChange={(e) => setSotuvData({...sotuvData, narx: e.target.value})} required /></div>
              </div>
              <div className="total-display-box">Jami: {(Number(sotuvData.miqdor) * Number(sotuvData.narx)).toLocaleString()}</div>
              <div className="form-group">
                <label>To'lov turi</label>
                <div className="payment-type-grid">
                  {['naqd', 'karta', 'perevod'].map(t => (
                    <button key={t} type="button" className={`pay-type-btn ${sotuvData.tolovTuri === t ? 'active' : ''}`} onClick={() => setSotuvData({...sotuvData, tolovTuri: t, tulanganSumma: ''})}>
                      {t === 'naqd' ? <MdPayments /> : t === 'karta' ? <MdCreditCard /> : <MdAccountBalanceWallet />} {t}
                    </button>
                  ))}
                </div>
              </div>
              {sotuvData.tolovTuri === 'naqd' && (
                <div className="form-group">
                  <label>To'langan summa</label>
                  <input 
                    type="text" 
                    value={sotuvData.tulanganSumma} 
                    onChange={(e) => handleAmountChange(e.target.value)} 
                    placeholder="Qoldiq qarzga yoziladi" 
                  />
                </div>
              )}
              <div className="edit-modal-footer"><button type="submit" className="btn-save">Tasdiqlash</button></div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="logout-modal-overlay" onClick={() => setShowEditModal(false)}>
           <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
             <div className="edit-modal-header"><h3>Tahrirlash</h3></div>
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
          <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon"><MdHelpOutline size={48} color="var(--primary-color)" /></div>
            <h3 className="logout-modal-title">O'chirilsinmi?</h3>
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