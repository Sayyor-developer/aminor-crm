import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, Search, Plus, ChevronLeft, ChevronRight, AlertTriangle, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import './tannarxhisoblash.css';

const Tannarxhisoblash = ({ open }) => {
  const [tannarxlar, setTannarxlar] = useState(
    Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      materialTuri: ['Plastik', 'Metall', 'Qog\'oz', 'Shisha'][i % 4],
      miqdor: 100 + i,
      birlik: 'kg',
      narx: 50000 + i * 500,
      sana: '2025-01-28',
      isActive: true,
    }))
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    materialTuri: '', miqdor: '', birlik: 'kg', narx: '', isActive: true
  });

  // --- NARXNI FORMATLASH FUNKSIYALARI ---
  const formatNumber = (val) => {
    if (!val) return '';
    return val.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const parseNumber = (val) => {
    return val.toString().replace(/\s/g, '');
  };

  const filteredData = tannarxlar.filter(item =>
    item.materialTuri.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const lastIdx = currentPage * itemsPerPage;
    const firstIdx = lastIdx - itemsPerPage;
    return filteredData.slice(firstIdx, lastIdx);
  }, [filteredData, currentPage]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({ materialTuri: '', miqdor: '', birlik: 'kg', narx: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = { 
      ...formData, 
      narx: Number(parseNumber(formData.narx)) 
    };

    if (editingItem) {
      setTannarxlar(tannarxlar.map(t => t.id === editingItem.id ? { ...finalData, id: t.id } : t));
      toast.success('Muvaffaqiyatli tahrirlandi!');
    } else {
      const newItem = { ...finalData, id: Date.now(), sana: new Date().toISOString().split('T')[0] };
      const newTannarxlar = [...tannarxlar, newItem];
      setTannarxlar(newTannarxlar);
      toast.success('Qo’shildi!');
      setCurrentPage(Math.ceil(newTannarxlar.length / itemsPerPage));
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (id) => {
    setTannarxlar(tannarxlar.map(t => {
      if (t.id === id) {
        const newStatus = !t.isActive;
        toast.success(newStatus ? 'Faol' : 'Noactive');
        return { ...t, isActive: newStatus };
      }
      return t;
    }));
  };

  return (
    <div className={`tannarx-wrapper ${open ? 'sidebar-tannarxhisoblash-open' : 'sidebar-tannarxhisoblash-closed'}`}>
      <Toaster position="top-right" />
      
      <div className="tannarx-content">
        <div className="page-header-box">
          <div className="title-section">
            <div className="t-circle-icon">T</div>
            <h2 className="main-page-title">Tannarx hisoblash</h2>
          </div>
          <button className="add-main-btn" onClick={() => handleOpenModal()}>
            <Plus size={20} /> Tannarx Qo'shish
          </button>
        </div>

        <div className="filter-section">
          <div className="search-input-box">
            <Search className="s-icon" size={18} />
            <input 
              type="text" 
              placeholder="Qidirish..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        <div className="table-card-container">
          <div className="scroll-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Material Turi</th>
                  <th>Miqdor</th>
                  <th>Narx (so'm)</th>
                  <th>Sana</th>
                  <th className="center-text">Holat</th>
                  <th className="right-text">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.id}>
                    <td className="bold-td">{item.materialTuri}</td>
                    <td>{item.miqdor} <span className="birlik-tag" style={{fontSize: '12px', color: '#64748b'}}>{item.birlik}</span></td>
                    <td style={{fontWeight: '600'}}>{formatNumber(item.narx)}</td>
                    <td className="gray-td">{item.sana}</td>
                    <td>
                      <div className="toggle-center">
                        <label className="ios-toggle">
                          <input type="checkbox" checked={item.isActive} onChange={() => toggleStatus(item.id)} />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </td>
                    <td>
                      <div className="action-btns-flex">
                        <button className="edit-action-btn" onClick={() => handleOpenModal(item)}><Pencil size={16} /></button>
                        <button className="delete-action-btn" onClick={() => { setDeletingId(item.id); setIsDeleteModalOpen(true); }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-box">
            <span className="total-label">Jami: {filteredData.length} ta</span>
            <div className="nav-controls">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={20} /></button>
              <span className="page-count">{currentPage} / {totalPages || 1}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={20} /></button>
            </div>
          </div>
          
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay-bg">
          <div className="modal-content-card">
            <div className="modal-header-top">
              <h3>{editingItem ? 'Tahrirlash' : 'Yangi Qo\'shish'}</h3>
              <X className="modal-x-close" onClick={() => setIsModalOpen(false)} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-form-fields">
                <div className="field-group full-width">
                  <label>Mahsulot Turi</label>
                  <select value={formData.materialTuri} onChange={(e) => setFormData({...formData, materialTuri: e.target.value})} required>
                    <option value="">Tanlang</option>
                    <option value="Plastik">Plastik</option>
                    <option value="Metall">Metall</option>
                    <option value="Qog'oz">Qog'oz</option>
                    <option value="Shisha">Shisha</option>
                    <option value="Yog'och">Yog'och</option>
                  </select>
                </div>
                <div className="field-group">
                  <label>Miqdor</label>
                  <input type="number" step="0.01" value={formData.miqdor} onChange={(e) => setFormData({...formData, miqdor: e.target.value})} required />
                </div>
                <div className="field-group">
                  <label>Birlik</label>
                  <select value={formData.birlik} onChange={(e) => setFormData({...formData, birlik: e.target.value})} required>
                    <option value="kg">kg</option>
                    <option value="dona">dona</option>
                  </select>
                </div>
                <div className="field-group full-width">
                  <label>Narx (so'm)</label>
                  <input 
                    type="text" 
                    value={formatNumber(formData.narx)} 
                    onChange={(e) => setFormData({...formData, narx: e.target.value})} 
                    placeholder="0"
                    required 
                  />
                </div>
              </div>
              <div className="modal-footer-btns">
                <button type="button" className="cancel-action-btn" onClick={() => setIsModalOpen(false)}>Bekor qilish</button>
                <button type="submit" className="save-action-btn">{editingItem ? 'Saqlash' : 'Qo\'shish'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay-bg">
          <div className="modal-content-card delete-mode">
            <AlertTriangle size={50} className="warn-svg" />
            <h3>O'chirib tashlaysizmi?</h3>
            <div className="modal-footer-btns center-btns">
              <button className="cancel-action-btn" onClick={() => setIsDeleteModalOpen(false)}>Yo'q</button>
              <button className="confirm-del-btn" onClick={() => {
                setTannarxlar(tannarxlar.filter(i => i.id !== deletingId));
                toast.error('O\'chirildi!');
                setIsDeleteModalOpen(false);
              }}>Ha, o'chirilsin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tannarxhisoblash;