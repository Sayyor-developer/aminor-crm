import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Pencil, Trash2, Search, Plus, ChevronLeft, ChevronRight, AlertTriangle, X, PlusCircle, MinusCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useData } from '../../DataContext'; 
import './tannarxhisoblash.css';

const Tannarxhisoblash = ({ open }) => {
  const { supabase, products } = useData(); 
  const [tannarxlar, setTannarxlar] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Masalliqlar ro'yxati (Default bo'sh qiymatlar bilan)
  const [masalliqlarList, setMasalliqlarList] = useState([{ nomi: '', miqdori: '', narxi: '' }]);

  const [formData, setFormData] = useState({
    materialTuri: '', miqdor: '', birlik: 'kg', narx: '0'
  });

  // --- SUPABASE DAN YUKLASH ---
  const fetchTannarxlar = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tannarxlar')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setTannarxlar(data || []);
    } catch (err) {
      console.error("Yuklashda xato:", err.message);
      toast.error("Ma'lumotlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchTannarxlar();
  }, [fetchTannarxlar]);

  // --- FORMATLASH ---
  const formatNumber = (val) => {
    if (!val || val === '0') return ''; // 0 bo'lsa bo'sh qaytaradi (input uchun)
    return val.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const parseNumber = (val) => {
    return val ? val.toString().replace(/\s/g, '') : '0';
  };

  // --- MASALLIQLARNI BOSHQARISH ---
  const addRow = () => setMasalliqlarList([...masalliqlarList, { nomi: '', miqdori: '', narxi: '' }]);
  
  const removeRow = (index) => {
    const newList = masalliqlarList.filter((_, i) => i !== index);
    setMasalliqlarList(newList);
    calculateTotal(newList);
  };

  const handleRowChange = (index, field, value) => {
    const newList = [...masalliqlarList];
    newList[index][field] = value;
    setMasalliqlarList(newList);
    calculateTotal(newList);
  };

  const calculateTotal = (list) => {
    const total = list.reduce((sum, item) => {
      const m = parseFloat(item.miqdori || 0);
      const n = parseFloat(parseNumber(item.narxi || 0));
      return sum + (m * n);
    }, 0);
    setFormData(prev => ({ ...prev, narx: total.toString() }));
  };

  // --- FILTER & PAGINATION ---
  const filteredData = useMemo(() => {
    return (tannarxlar || []).filter(item =>
      (item.materialTuri || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tannarxlar, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const currentItems = useMemo(() => {
    const lastIdx = currentPage * itemsPerPage;
    const firstIdx = lastIdx - itemsPerPage;
    return filteredData.slice(firstIdx, lastIdx);
  }, [filteredData, currentPage]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        materialTuri: item.materialTuri, 
        miqdor: item.miqdor, 
        birlik: item.birlik, 
        narx: item.narx.toString() 
      });
      setMasalliqlarList(item.masalliqlar || [{ nomi: '', miqdori: '', narxi: '' }]);
    } else {
      setEditingItem(null);
      setFormData({ materialTuri: '', miqdor: '', birlik: 'kg', narx: '0' });
      setMasalliqlarList([{ nomi: '', miqdori: '', narxi: '' }]);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saqlanmoqda...");
    
    const finalData = { 
      materialTuri: formData.materialTuri,
      miqdor: parseFloat(formData.miqdor),
      birlik: formData.birlik,
      narx: parseInt(parseNumber(formData.narx)),
      masalliqlar: masalliqlarList, 
      sana: editingItem ? editingItem.sana : new Date().toISOString().split('T')[0]
    };

    try {
      if (editingItem) {
        const { error } = await supabase.from('tannarxlar').update(finalData).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('tannarxlar').insert([finalData]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchTannarxlar(); 
      toast.success('Muvaffaqiyatli saqlandi!', { id: loadingToast });
    } catch (err) {
      toast.error("Xatolik: " + err.message, { id: loadingToast });
    }
  };

  const confirmDelete = async () => {
    const loadingToast = toast.loading("O'chirilmoqda...");
    try {
      const { error } = await supabase.from('tannarxlar').delete().eq('id', deletingId);
      if (error) throw error;
      toast.success("O'chirildi!", { id: loadingToast });
      setIsDeleteModalOpen(false);
      fetchTannarxlar();
    } catch (err) {
      toast.error("O'chirishda xato!", { id: loadingToast });
    }
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
              placeholder="Tayyor mahsulot nomi bo'yicha qidirish..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        <div className="table-card-container">
          <div className="scroll-wrapper">  
            {loading ? (
              <div className="loading-state" style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>Ma'lumotlar yuklanmoqda...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Tayyor Mahsulot</th>
                    <th>Ishlab Chiqarish</th>
                    <th>Masalliqlar tarkibi</th>
                    <th>Jami Tannarx</th>
                    <th>Sana</th>
                    <th className="right-text">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr key={item.id}>
                      <td className="bold-td">{item.materialTuri}</td>
                      <td>{item.miqdor} <span className="birlik-tag">{item.birlik}</span></td>
                      {/* ASOSIY O'ZGARISH: MASALLIQLARNI RO'YXAT QILIB CHIQARISH */}
                      <td style={{ fontSize: 'var(--font-size-12)', color: '#475569', maxWidth: '250px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {item.masalliqlar && item.masalliqlar.map((m, idx) => (
                            <span key={idx} style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                              {m.nomi} ({m.miqdori})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{fontWeight: '600'}}>{item.narx?.toLocaleString()} so'm</td>
                      <td className="gray-td">{item.sana}</td>
                      <td>
                        <div className="action-btns-flex">
                          <button className="edit-action-btn" onClick={() => handleOpenModal(item)} title="Tahrirlash"><Pencil size={16} /></button>
                          <button className="delete-action-btn" onClick={() => { setDeletingId(item.id); setIsDeleteModalOpen(true); }} title="O'chirish"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="pagination-box">
            <span className="total-label">{filteredData.length} ta</span>
            <div className="nav-controls">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={20} /></button>
              <span className="page-count">{currentPage} / {totalPages || 1}</span>
              <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay-bg">
          <div className="modal-content-card" style={{ maxWidth: '750px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header-top">
              <h3>{editingItem ? 'Tannarxni tahrirlash' : 'Yangi tannarx hisoblash'}</h3>
              <X className="modal-x-close" onClick={() => setIsModalOpen(false)} />
            </div>
            
            <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
              <div className="modal-form-fields">
                <div className="field-group full-width">
                  <label>Tayyor Mahsulot (Ombordan tanlang)</label>
                  <select 
                    value={formData.materialTuri} 
                    onChange={(e) => setFormData({...formData, materialTuri: e.target.value})} 
                    required
                  >
                    <option value="">-- Mahsulotni tanlang --</option>
                    {products && products.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* --- MASALLIQLAR BO'LIMI (SCROLL BILAN) --- */}
                <div className="field-group full-width masalliqlar-wrapper" style={{ marginTop: '10px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ fontWeight: 'var(--font-weight-700)', color: '#1e293b' }}>Sarf-xarajatlar</label>
                    <button type="button" onClick={addRow} className="add-row-btn" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: 'var(--font-size-12)', background: 'var(--primary-color)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                      <PlusCircle size={16} /> Qator qo'shish
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 'var(--gap-10)', marginBottom: '5px', padding: '0 5px' }}>
                    <span style={{ flex: 2, fontSize: 'var(--font-size-12)', fontWeight: 'var(--font-weight-700)', color: '#64748b' }}>MASALLIQ NOMI</span>
                    <span style={{ flex: 1, fontSize: 'var(--font-size-12)', fontWeight: 'var(--font-weight-700)', color: '#64748b' }}>MIQDORI</span>
                    <span style={{ flex: 1.5, fontSize: 'var(--font-size-12)', fontWeight: 'var(--font-weight-700)', color: '#64748b' }}>NARXI (DONA/KG)</span>
                    <span style={{ width: '22px' }}></span>
                  </div>

                  {/* SCROLL QISMI SHU YERDA */}
                  <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
                    {masalliqlarList.map((m, index) => (
                      <div key={index} className="masalliq-row" style={{ display: 'flex', gap: 'var(--gap-10)', marginBottom: '10px', alignItems: 'center' }}>
                        <input 
                          style={{ flex: 2 }}
                          placeholder="Masalliq nomi..." 
                          value={m.nomi} 
                          onChange={(e) => handleRowChange(index, 'nomi', e.target.value)} 
                          required 
                        />
                        <input 
                          style={{ flex: 1 }}
                          type="number" 
                          step="any"
                          placeholder="0.00" 
                          value={m.miqdori} 
                          onChange={(e) => handleRowChange(index, 'miqdori', e.target.value)} 
                          required 
                        />
                        <input 
                          style={{ flex: 1.5 }}
                          placeholder="Narxi..." 
                          value={formatNumber(m.narxi)} 
                          onChange={(e) => handleRowChange(index, 'narxi', e.target.value)} 
                          required 
                        />
                        {masalliqlarList.length > 1 && (
                          <MinusCircle 
                            size={22} 
                            color="#ef4444" 
                            style={{ cursor: 'pointer', flexShrink: 0 }} 
                            onClick={() => removeRow(index)} 
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="field-group">
                  <label>Ishlab chiqarilgan jami miqdor</label>
                  <input 
                    type="number" 
                    step="any" 
                    placeholder="Jami miqdor..."
                    value={formData.miqdor} 
                    onChange={(e) => setFormData({...formData, miqdor: e.target.value})} 
                    required 
                  />
                </div>
                <div className="field-group">
                  <label>O'lchov birligi</label>
                  <select value={formData.birlik} onChange={(e) => setFormData({...formData, birlik: e.target.value})} required>
                    <option value="kg">Kilogramm </option>
                    <option value="dona">Dona </option>
                    <option value="litr">Litr</option>
                  </select>
                </div>
                <div className="field-group full-width">
                  <label>Jami hisoblangan tannarx (Avtomatik)</label>
                  <input 
                    type="text" 
                    placeholder="Hisoblanmoqda..."
                    value={(parseInt(parseNumber(formData.narx)) || 0).toLocaleString() + " so'm"} 
                    readOnly 
                    style={{ backgroundColor: '#f1f5f9', fontWeight: 'var(--font-weight-800)', color: '#0f172a', fontSize: 'var(--font-size-16)' }}
                  />
                </div>
              </div>
              
              <div className="modal-footer-btns" style={{ marginTop: '20px', position: 'sticky', bottom: 0, background: 'white', padding: '10px 0' }}>
                <button type="button" className="cancel-action-btn" onClick={() => setIsModalOpen(false)}>Bekor qilish</button>
                <button type="submit" className="save-action-btn">
                  {editingItem ? 'O\'zgarishlarni saqlash' : 'Tannarxni qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay-bg">
          <div className="modal-content-card delete-mode">
            <AlertTriangle size={50} className="warn-svg" />
            <h3>Ma'lumotni o'chirasizmi?</h3>
            <p style={{ color: '#64748b', marginTop: '5px' }}>Bu amalni ortga qaytarib bo'lmaydi.</p>
            <div className="modal-footer-btns center-btns">
              <button className="cancel-action-btn" onClick={() => setIsDeleteModalOpen(false)}>Yo'q, qolsin</button>
              <button className="confirm-del-btn" onClick={confirmDelete}>Ha, o'chirilsin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tannarxhisoblash;