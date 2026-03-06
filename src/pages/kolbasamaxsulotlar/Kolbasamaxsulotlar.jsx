import React, { useState, useMemo } from 'react';
import { Search, Edit, Trash2, Plus, ChevronRight, ChevronLeft, X, AlertTriangle, FileText, PackageOpen, Database } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useData } from '../../DataContext';
import './kolbasamaxsulotlar.css';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Kolbasamaxsulotlar({ open }) {
  // Supabase funksiyalarini Context-dan olamiz
  const {
    products = [],
    productQoshish,      // Yangi qo'shilgan funksiya
    setProducts,
    supabase             // Supabase client to'g'ridan-to'g'ri kerak bo'lishi mumkin
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', unit: 'kg', price: '', stock: '' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- FORMATLASH FUNKSIYALARI ---
  const formatNumber = (num) => {
    if (!num) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const cleanNumber = (str) => {
    if (typeof str !== 'string') str = String(str);
    return str.replace(/\s/g, "");
  };

  const jamiQoldiq = useMemo(() => {
    return (products || []).reduce((sum, item) => sum + Number(item.stock || 0), 0);
  }, [products]);

  const filteredItems = useMemo(() => {
    return (products || []).filter(p => {
      const productName = p && p.name ? String(p.name).toLowerCase() : "";
      const search = searchQuery ? searchQuery.toLowerCase() : "";
      return productName.includes(search);
    });
  }, [products, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage]);

  const exportToPDF = () => {
    try {
      if (filteredItems.length === 0) {
        toast.error("Eksport qilish uchun mahsulot yo'q!");
        return;
      }
      const doc = new jsPDF();
      const tableColumn = ["Nomi", "Birlik", "Qoldiq", "Narxi (so'm)", "Umumiy Qiymati"];
      const tableRows = [];

      filteredItems.forEach(p => {
        tableRows.push([
          p.name || "Nomsiz",
          p.unit || "kg",
          Number(p.stock || 0).toLocaleString(),
          Number(p.price || 0).toLocaleString(),
          (Number(p.stock || 0) * Number(p.price || 0)).toLocaleString()
        ]);
      });

      doc.setFontSize(18);
      doc.text("Kolbasa Ombori Hisoboti", 14, 20);
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241], halign: 'center' },
        styles: { fontSize: 10 }
      });
      doc.save(`Ombor_Hisoboti_${new Date().toLocaleDateString()}.pdf`);
      toast.success("PDF muvaffaqiyatli yuklandi");
    } catch (error) {
      toast.error("PDF yaratishda xatolik yuz berdi");
    }
  };

  // --- SUPABASE: HOLATNI O'ZGARTIRISH ---
  const toggleStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase.from('products').update({ active: !currentStatus }).eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !currentStatus } : p));
      toast.info("Holat yangilandi");
    } catch (err) {
      toast.error("Xatolik: " + err.message);
    }
  };

  // --- SUPABASE: YANGI MAHSULOT QO'SHISH ---
  const handleAddProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.stock) {
      toast.error("Ma'lumotlarni to'liq kiriting!");
      return;
    }

    try {
      const item = {
        name: newProduct.name.trim(),
        unit: newProduct.unit,
        active: true,
        price: Number(cleanNumber(newProduct.price)),
        stock: Number(newProduct.stock)
      };

      // DataContext dagi funksiyani chaqiramiz
      await productQoshish(item);

      setNewProduct({ name: '', unit: 'kg', price: '', stock: '' });
      setIsAddModalOpen(false);
      toast.success("Mahsulot omborga qo'shildi!");
    } catch (err) {
      // RLS xatolarini aniqroq ko'rsatish
      if (err.message.includes('row-level security')) {
        toast.error("Baza ruxsat bermadi (RLS Policy xatosi)!");
      } else {
        toast.error("Xatolik: " + err.message);
      }
    }
  };

  // --- SUPABASE: TAHRIRLASHNI SAQLASH ---
  const handleUpdateProduct = async () => {
    if (!selectedProduct.name.trim() || !selectedProduct.price || !selectedProduct.stock) {
      toast.error("Ma'lumotlarni to'ldiring!");
      return;
    }

    try {
      const updatedData = {
        name: selectedProduct.name.trim(),
        price: Number(cleanNumber(String(selectedProduct.price))),
        stock: Number(selectedProduct.stock),
        unit: selectedProduct.unit
      };

      const { error } = await supabase.from('products').update(updatedData).eq('id', selectedProduct.id);
      if (error) throw error;

      setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, ...updatedData } : p));
      setIsEditModalOpen(false);
      toast.info("Ma'lumot yangilandi");
    } catch (err) {
      toast.error("Xatolik: " + err.message);
    }
  };

  // --- SUPABASE: O'CHIRISH ---
  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', selectedProduct.id);
      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      toast.error("Mahsulot o'chirildi");
    } catch (err) {
      toast.error("Xatolik: " + err.message);
    }
  };

  return (
    <div className={`mijozlar-sahifa ${open ? 'sidebar-ochiq' : 'sidebar-yopiq'}`}>
      <ToastContainer position="top-right" autoClose={1500} containerStyle={{ zIndex: 99999 }} />

      <div className="konteyner">
        <div className="header-main">
          <div className="header-left">
            <div className="header-icon"><PackageOpen size={24} /></div>
            <h1>Kolbasa Ombori (Qoldiqlar)</h1>
          </div>
          <div className="header-actions">
            <button className="btn-export kolbasa-qoshish-modal-style" onClick={() => setIsAddModalOpen(true)}>
              {/* size={16} edi, 20 qildik. Agar yana ham katta kerak bo'lsa 22 yoki 24 qilib ko'r */}
              <Plus size={24} strokeWidth={5.5} /> Yangi mahsulot
            </button>
            <button className="btn-export pdf" onClick={exportToPDF}>
              <FileText size={16} /> PDF Export
            </button>
          </div>
        </div>

        <div className="kolbasa-card">
          <div className="search-stat-grid">
            <div className="flex-center" style={{ flex: 1, marginBottom: 0 }}>
              <Search size={18} color="#64748b" />
              <input
                className="input-style w-full"
                placeholder="Mahsulot nomi bo'yicha qidirish..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <div className="jami-qoldiq-box">
              <Database size={20} />
              <span>Jami qoldiq: <b>{jamiQoldiq.toLocaleString()}</b> {newProduct.unit}</span>
            </div>
          </div>

          <div className="jadval-qobiq">
            <table className="mijoz-table">
              <thead>
                <tr>
                  <th>Mahsulot Nomi</th>
                  <th>Birlik</th>
                  <th>Ombordagi Qoldiq</th>
                  <th>Narxi (1 birlik)</th>
                  <th className="text-center">Holat</th>
                  <th className="text-right">Amal</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? currentItems.map(p => (
                  <tr key={p.id} className={p.active ? 'row-active' : 'row-inactive'}>
                    <td className={p.active ? 'name-active' : 'name-inactive'}>{p.name}</td>
                    <td>{p.unit}</td>
                    <td style={{ fontWeight: 'bold' }}>{Number(p.stock || 0).toLocaleString()}</td>
                    <td>{Number(p.price || 0).toLocaleString()} so'm</td>
                    <td className="text-center">
                      <button
                        className={`switch ${p.active ? 'switch-on' : 'switch-off'}`}
                        onClick={() => toggleStatus(p.id, p.active)}
                      >
                        <div className={`knopka ${p.active ? 'knopka-on' : 'knopka-off'}`}></div>
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="action-btns">
                        <Edit className="icon-blue" size={16} onClick={() => { setSelectedProduct(p); setIsEditModalOpen(true); }} />
                        <Trash2 className="icon-red" size={16} onClick={() => { setSelectedProduct(p); setIsDeleteModalOpen(true); }} />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center" style={{ padding: '20px', color: '#94a3b8' }}>Mahsulot topilmadi</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <span className="total-count">Jami: {filteredItems.length} ta mahsulot</span>
              <div className="pagination-controls">
                <button className="pagi-arrow" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16} /></button>
                <span className="pagi-num active">{currentPage}</span>
                <button className="pagi-arrow" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALLAR --- */}

      {/* MODAL: QO'SHISH */}
      {isAddModalOpen && (
        <div className="modal-parda" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-oyna" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span>Yangi mahsulot qo'shish</span>
              <X className="cursor-pointer" onClick={() => setIsAddModalOpen(false)} />
            </div>
            <div className="modal-body">
              <label className="input-label">Mahsulot nomi</label>
              <input className="input-style w-full mb-3" placeholder="Nomi" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-10)' }} className="mb-3">
                <div>
                  <label className="input-label">Birlik</label>
                  <select className="input-style w-full" value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}>
                    <option value="kg">kg</option>
                    <option value="dona">dona</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Miqdori(kg)</label>
                  <input className="input-style w-full" type="number" placeholder="0" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
                </div>
              </div>

              <label className="input-label">Sotuv narxi (1 {newProduct.unit} uchun)</label>
              <input
                className="input-style w-full mb-4"
                type="text"
                placeholder="0"
                value={formatNumber(newProduct.price)}
                onChange={e => setNewProduct({ ...newProduct, price: cleanNumber(e.target.value) })}
              />

              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setIsAddModalOpen(false)}>Bekor qilish</button>
                <button className="btn-blue" onClick={handleAddProduct}>Omborga qo'shish</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAHRIRLASH */}
      {isEditModalOpen && selectedProduct && (
        <div className="modal-parda" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-oyna" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span>Mahsulotni tahrirlash</span>
              <X className="cursor-pointer" onClick={() => setIsEditModalOpen(false)} />
            </div>
            <div className="modal-body">
              <label className="input-label">Nomi</label>
              <input className="input-style w-full mb-3" value={selectedProduct.name} onChange={e => setSelectedProduct({ ...selectedProduct, name: e.target.value })} />

              <label className="input-label">Qoldiq miqdori</label>
              <input className="input-style w-full mb-3" type="number" value={selectedProduct.stock} onChange={e => setSelectedProduct({ ...selectedProduct, stock: e.target.value })} />

              <label className="input-label">Narxi</label>
              <input
                className="input-style w-full mb-3"
                type="text"
                value={formatNumber(selectedProduct.price)}
                onChange={e => setSelectedProduct({ ...selectedProduct, price: cleanNumber(e.target.value) })}
              />
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>Bekor qilish</button>
                <button className="btn-blue" onClick={handleUpdateProduct}>Saqlash</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: O'CHIRISH */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="modal-parda" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-oyna modal-delete" onClick={e => e.stopPropagation()}>
            <div className="delete-icon-center"><AlertTriangle size={48} color="#ef4444" /></div>
            <h3 className="delete-title">Mahsulotni o'chirish</h3>
            <p className="delete-text"><b>{selectedProduct.name}</b> ombordan butunlay o'chirilsinmi?</p>
            <div className="modal-footer-btns">
              <button className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Yo'q</button>
              <button className="btn-red-confirm" onClick={handleConfirmDelete}>Ha, o'chirilsin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}