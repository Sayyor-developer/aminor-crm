import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MdPhone, MdEdit, MdDelete, MdLocationOn, 
  MdPerson, MdHistory, MdCheckCircle, MdDateRange,
  MdArrowBack, MdClose, MdSave, MdHelpOutline
} from 'react-icons/md'; 
import { useData } from '../../DataContext';
import toast, { Toaster } from 'react-hot-toast'; 
import './mijozlar.css';

const MijozProfil = ({ open }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mijozlar, sotuvlar, mijozOchirish, mijozYangilash } = useData();
  
  const [activeTab, setActiveTab] = useState('history');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Tanlangan mijozni xatosiz topish
  const mijoz = useMemo(() => {
    return mijozlar?.find(m => String(m.id) === String(id));
  }, [mijozlar, id]);

  const [formData, setFormData] = useState({ ism: '', telefon: '', manzil: '', qarzdorlik: 0 });

  // Warninglarsiz formani to'ldirish
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

  // --- SAQLASH FUNKSIYASI (Sana avtomatik) ---
  const handleSave = (e) => {
    e.preventDefault();
    if (typeof mijozYangilash === 'function') {
      // Bugungi sanani olish
      const bugun = new Date().toISOString().split('T')[0];

      const yangilanganMalumot = {
        ...formData,
        sana: mijoz.sana && mijoz.sana !== '---' ? mijoz.sana : bugun
      };

      mijozYangilash(yangilanganMalumot);
      toast.success("Ma'lumotlar yangilandi!", { position: "top-right" });
      setShowEditModal(false);
    }
  };

  const handleDelete = useCallback(() => {
    if (typeof mijozOchirish === 'function' && mijoz) {
      mijozOchirish(mijoz.id);
      toast.success("Mijoz o'chirildi", { position: "top-right", icon: '🗑️' });
      setShowDeleteModal(false);
      setTimeout(() => navigate('/mijozlar'), 1000);
    }
  }, [mijozOchirish, mijoz, navigate]);

  const mijozSotuvlari = useMemo(() => {
    return (sotuvlar || [])
      .filter(s => String(s.mijozId) === String(id))
      .sort((a, b) => new Date(b.sana).getTime() - new Date(a.sana).getTime());
  }, [sotuvlar, id]);

  if (!mijoz) return <div className="loading-state">Mijoz yuklanmoqda...</div>;

  return (
    <div className={`mijoz-profil-page ${open ? 'open' : 'closed'}`}>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="mp-top-navigation">
        <button className="back-btn-circle" onClick={() => navigate('/mijozlar')}>
          <MdArrowBack size={22} />
        </button>
        <div className="mp-breadcrumb-simple">Mijozlar / <strong>{mijoz.ism}</strong></div>
      </div>

      <div className="profil-grid-wrapper">
        <aside className="profil-aside-card">
          <div className="inner-card">
            <div className="top-btns">
              <button className="edit-icon-btn" onClick={() => setShowEditModal(true)}><MdEdit /></button>
              <button className="delete-icon-btn" onClick={() => setShowDeleteModal(true)}><MdDelete /></button>
            </div>
            <div className="user-main-info">
              <div className="user-avatar"><MdPerson size={40} /></div>
              <h2>{mijoz.ism}</h2>
              <span className="id-badge">ID: #{mijoz.id}</span>
            </div>
            <div className={`balance-status-box ${mijoz.qarzdorlik > 0 ? 'is-debt' : 'is-ok'}`}>
              <small>Hisob holati</small>
              <p>{mijoz.qarzdorlik > 0 ? `-${Number(mijoz.qarzdorlik).toLocaleString()}` : '0'} UZS</p>
            </div>
            <div className="contact-list">
              <div className="contact-row"><MdPhone className="row-icon" /> <span>{mijoz.telefon}</span></div>
              <div className="contact-row"><MdLocationOn className="row-icon" /> <span>{mijoz.manzil || 'Samarqand'}</span></div>
              
              {/* SANA AVTOMATIK: Rasmda so'ralgan joy */}
              <div className="contact-row">
                <MdDateRange className="row-icon" /> 
                <span>{mijoz.sana && mijoz.sana !== '---' ? mijoz.sana : new Date().toISOString().split('T')[0]}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="profil-main-content">
          <div className="content-tabs">
            <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
               <MdHistory /> Amallar tarixi
            </button>
          </div>
          <div className="history-table-container">
            <table className="mijoz-table">
              <thead>
                <tr>
                  <th>Sana</th>
                  <th>Mahsulot</th>
                  <th>Summa</th>
                  <th>Tur</th>
                  <th>Xodim</th>
                </tr>
              </thead>
              <tbody>
                {mijozSotuvlari.length > 0 ? mijozSotuvlari.map((s, i) => (
                  <tr key={i}>
                    <td>{s.sana}</td>
                    <td className="bold-text">{s.mahsulot || 'To\'lov'}</td>
                    <td className={Number(s.summa) > 0 ? 'text-green' : 'text-red'}>
                      {Number(s.summa).toLocaleString()} UZS
                    </td>
                    <td><span className="type-tag">{s.tolovTuri || 'naqd'}</span></td>
                    <td><div className="admin-tag"><MdCheckCircle /> Admin</div></td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="empty-row">Ma'lumot mavjud emas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="logout-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon"><MdHelpOutline size={48} color="#ef4444" /></div>
            <h3 className="logout-modal-title">O'chirilsinmi?</h3>
            <p className="logout-modal-text">Bu amalni qaytarib bo'lmaydi!</p>
            <div className="logout-modal-actions">
              <button className="logout-btn-cancel" onClick={() => setShowDeleteModal(false)}>Yo'q</button>
              <button className="logout-btn-confirm" style={{backgroundColor: '#ef4444'}} onClick={handleDelete}>O'chirish</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="logout-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>Tahrirlash</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}><MdClose size={24}/></button>
            </div>
            <form onSubmit={handleSave} className="edit-form">
              <div className="form-group">
                <label>F.I.SH</label>
                <input type="text" value={formData.ism} onChange={(e) => setFormData({...formData, ism: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Telefon</label>
                <input type="text" value={formData.telefon} onChange={(e) => setFormData({...formData, telefon: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Manzil</label>
                <input type="text" value={formData.manzil} onChange={(e) => setFormData({...formData, manzil: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Qarz (UZS)</label>
                <input type="number" value={formData.qarzdorlik} onChange={(e) => setFormData({...formData, qarzdorlik: Number(e.target.value)})} />
              </div>
              <div className="edit-modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>Bekor</button>
                <button type="submit" className="btn-save"><MdSave /> Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MijozProfil;