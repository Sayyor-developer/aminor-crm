import React, { useState, useMemo, useCallback } from 'react';
import { Search, Edit, Trash2, Plus, ChevronRight, ChevronLeft, X, AlertTriangle, FileText, PackageOpen, Database } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useData } from '../../DataContext';
import './kolbasamaxsulotlar.css';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Kolbasamaxsulotlar({ open }) {
  const { sotuvQoshish, sotuvOchirish, products = [], setProducts } = useData();

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
    return str.replace(/\s/g, "");
  };

  // --- JAMI QOLDIQNI HISOBLASH (QO'SHILDI) ---
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
      const tableColumn = ["Nomi", "Birlik", "Qoldiq", "Narxi (so'm)", "Holat"];
      const tableRows = [];
      filteredItems.forEach(p => {
        tableRows.push([
          p.name || "Nomsiz",
          p.unit || "kg",
          Number(p.stock || 0).toLocaleString(),
          Number(p.price || 0).toLocaleString(),
          p.active ? "Faol" : "Nofaol"
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
      doc.save(`Kolbasa_Ombori_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF muvaffaqiyatli yuklandi");
    } catch (error) {
      toast.error("PDF yaratishda xatolik yuz berdi");
    }
  };

  const toggleStatus = useCallback((id) => {
    setProducts(prev => (prev || []).map(p => {
      if (p.id === id) {
        return { ...p, active: !p.active };
      }
      return p;
    }));
  }, [setProducts]);

  const handleAddProduct = () => {
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.stock) {
      toast.error("Ma'lumotlarni to'liq kiriting!");
      return;
    }

    const commonId = Date.now();
    const productPrice = Number(cleanNumber(newProduct.price));
    const productStock = Number(newProduct.stock);

    const item = {
      id: commonId,
      name: newProduct.name.trim(),
      unit: newProduct.unit,
      active: true,
      price: productPrice,
      stock: productStock,
      date: new Date().toISOString() 
    };

    setProducts(prev => [item, ...(prev || [])]);
    sotuvQoshish({ id: commonId, summa: productPrice * productStock, miqdor: productStock, sana: new Date().toISOString() });
    setNewProduct({ name: '', unit: 'kg', price: '', stock: '' });
    setIsAddModalOpen(false); 
    toast.success("Muvaffaqiyatli qo'shildi!");
  };

  const handleConfirmDelete = () => {
    if (selectedProduct) {
      setProducts(prev => (prev || []).filter(p => p.id !== selectedProduct.id));
      sotuvOchirish(selectedProduct.id);
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      toast.error("Mahsulot o'chirildi");
    }
  };

  return (
    <div className={`mijozlar-sahifa ${open ? 'sidebar-ochiq' : 'sidebar-yopiq'}`}>
      <ToastContainer position="top-right" autoClose={1500} hideProgressBar={false} />

      <div className="konteyner">
        <div className="header-main">
          <div className="header-left">
            <div className="header-icon"><PackageOpen size={24} /></div>
            <h1>Kolbasa Ombori</h1>
          </div>
          <div className="header-actions">
            <button className="btn-export kolbasa-qoshish-modal-style" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={16} /> Yangi mahsulot
            </button>

            <button className="btn-export pdf" onClick={exportToPDF}>
              <FileText size={16} /> PDF Export
            </button>
          </div>
        </div>

        <div className="kolbasa-card">
          {/* --- SEARCH VA JAMI QOLDIQ QISMI (MANA SHU YERDA QOSHILDI) --- */}
          <div className="search-stat-grid">
            <div className="flex-center" style={{ flex: 1, marginBottom: 0 }}>
              <Search size={18} color="#64748b" />
              <input 
                className="input-style w-full" 
                placeholder="Qidirish..." 
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
              />
            </div>

            <div className="jami-qoldiq-box">
              <Database size={20} />
              <span>Jami qoldiq: {jamiQoldiq.toLocaleString()} kg/dona</span>
            </div>
          </div>
          {/* -------------------------------------------------------- */}

          <div className="jadval-qobiq">
            <table className="mijoz-table">
              <thead>
                <tr>
                  <th>Nomi</th>
                  <th>Birlik</th>
                  <th>Qoldiq</th>
                  <th>Narxi</th>
                  <th className="text-center">Holat</th>
                  <th className="text-right">Amal</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(p => (
                  <tr key={p.id} className={p.active ? 'row-active' : 'row-inactive'}>
                    <td className={p.active ? 'name-active' : 'name-inactive'}>{p.name}</td>
                    <td>{p.unit}</td>
                    <td>{Number(p.stock || 0).toLocaleString()}</td>
                    <td>{Number(p.price || 0).toLocaleString()} so'm</td>
                    <td className="text-center">
                      <button className={`switch ${p.active ? 'switch-on' : 'switch-off'}`} onClick={() => toggleStatus(p.id)}>
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
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <span className="total-count">Jami: {filteredItems.length} ta</span>
              <div className="pagination-controls">
                <button className="pagi-arrow" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16} /></button>
                <span className="pagi-num active">{currentPage}</span>
                <button className="pagi-arrow" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* YANGI MAHSULOT QO'SHISH MODALI */}
      {isAddModalOpen && (
        <div className="modal-parda" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-oyna" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span>Yangi mahsulot kirimi</span>
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
                  <label className="input-label">Miqdori</label>
                  <input className="input-style w-full" type="number" placeholder="0" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
                </div>
              </div>

              <label className="input-label">Narxi (1 birlik uchun)</label>
              <input
                className="input-style w-full mb-4"
                type="text"
                placeholder="Narxi"
                value={formatNumber(newProduct.price)}
                onChange={e => setNewProduct({ ...newProduct, price: cleanNumber(e.target.value) })}
              />

              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setIsAddModalOpen(false)}>Bekor qilish</button>
                <button className="btn-blue" style={{ width: 'auto' }} onClick={handleAddProduct}>Qo'shish</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAHRIRLASH MODALI */}
      {isEditModalOpen && selectedProduct && (
        <div className="modal-parda" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-oyna" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span>Tahrirlash</span>
              <X className="cursor-pointer" onClick={() => setIsEditModalOpen(false)} />
            </div>
            <div className="modal-body">
              <input className="input-style w-full mb-3" value={selectedProduct.name} onChange={e => setSelectedProduct({ ...selectedProduct, name: e.target.value })} />
              <input className="input-style w-full mb-3" type="number" value={selectedProduct.stock} onChange={e => setSelectedProduct({ ...selectedProduct, stock: e.target.value })} />
              <input
                className="input-style w-full mb-3"
                type="text"
                value={formatNumber(selectedProduct.price)}
                onChange={e => setSelectedProduct({ ...selectedProduct, price: cleanNumber(e.target.value) })}
              />
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>Bekor qilish</button>
                <button className="btn-blue" style={{ width: 'auto' }} onClick={() => {
                  setProducts(products.map(p => p.id === selectedProduct.id ? { ...selectedProduct, price: Number(cleanNumber(String(selectedProduct.price))) } : p));
                  setIsEditModalOpen(false);
                  toast.info("Ma'lumot yangilandi");
                }}>Saqlash</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* O'CHIRISH MODALI */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="modal-parda" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-oyna modal-delete" onClick={e => e.stopPropagation()}>
            <div className="delete-icon-center"><AlertTriangle size={48} color="#ef4444" /></div>
            <h3 className="delete-title">Diqqat!</h3>
            <p className="delete-text"><b>{selectedProduct.name}</b> o'chirilsinmi?</p>
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