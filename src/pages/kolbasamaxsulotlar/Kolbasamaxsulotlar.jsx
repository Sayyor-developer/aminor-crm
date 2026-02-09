import React, { useState, useMemo, useCallback } from 'react';
import { Search, Edit, Trash2, Plus, ChevronRight, ChevronLeft, X, AlertTriangle, FileText, PackageOpen } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useData } from '../../DataContext'; 
import './kolbasamaxsulotlar.css';

// PDF kutubxonalarini to'g'ri tartibda import qilamiz
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Kolbasamaxsulotlar({ open }) {
  const { sotuvQoshish, sotuvOchirish, products = [], setProducts } = useData(); // products default [] qilindi

  const [searchQuery, setSearchQuery] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', unit: 'kg', price: '', stock: '' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- 100% XAVFSIZ FILTRLASH ---
  const filteredItems = useMemo(() => {
    return (products || []).filter(p => {
      // Agar p.name mavjud bo'lmasa, uni bo'sh string deb hisoblaymiz
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

  // --- 100% ISHLOVCHI PDF EKSPORT FUNKSIYASI ---
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
        const productData = [
          p.name || "Nomsiz",
          p.unit || "kg",
          Number(p.stock || 0).toLocaleString(),
          Number(p.price || 0).toLocaleString(),
          p.active ? "Faol" : "Nofaol"
        ];
        tableRows.push(productData);
      });

      doc.setFontSize(18);
      doc.text("Kolbasa Ombori Hisoboti", 14, 20);
      doc.setFontSize(11);
      doc.text(`Sana: ${new Date().toLocaleDateString()} | Jami mahsulot: ${filteredItems.length} ta`, 14, 30);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241], halign: 'center' },
        styles: { fontSize: 10 },
        columnStyles: {
          2: { halign: 'center' }, 
          3: { halign: 'right' },  
          4: { halign: 'center' }  
        }
      });

      doc.save(`Kolbasa_Ombori_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF muvaffaqiyatli yuklandi");
    } catch (error) {
      console.error("PDF Export error:", error);
      toast.error("PDF yaratishda xatolik yuz berdi");
    }
  };

  const toggleStatus = useCallback((id) => {
    setProducts(prev => (prev || []).map(p => {
      if (p.id === id) {
        const yangiHolat = !p.active;
        setTimeout(() => {
          toast.dismiss(); 
          yangiHolat ? toast.success(`${p.name} faollashtirildi`) : toast.warn(`${p.name} nofaol qilindi`);
        }, 0);
        return { ...p, active: yangiHolat };
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
    const productPrice = Number(newProduct.price);
    const productStock = Number(newProduct.stock);

    const item = { 
      id: commonId, 
      name: newProduct.name.trim(),
      unit: newProduct.unit,
      active: true, 
      price: productPrice, 
      stock: productStock 
    };
    
    setProducts(prev => [item, ...(prev || [])]);

    sotuvQoshish({
      id: commonId,
      summa: productPrice * productStock,
      miqdor: productStock,
      sana: new Date().toISOString()
    });

    setNewProduct({ name: '', unit: 'kg', price: '', stock: '' });
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
            <button className="btn-export pdf" onClick={exportToPDF}>
              <FileText size={16} /> PDF Export
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Yangi mahsulot kirimi</h3>
          <div className="input-guruhi">
            <input className="input-style" placeholder="Nomi" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
            <select className="input-style" value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}>
              <option value="kg">kg</option>
              <option value="dona">dona</option>
            </select>
            <input className="input-style" type="number" placeholder="Miqdori" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
            <input className="input-style" type="number" placeholder="Narxi" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
            <button className="btn-blue btn-full" onClick={handleAddProduct}><Plus size={18} /> Qo'shish</button>
          </div>
        </div>

        <div className="card">
          <div className="flex-center" style={{marginBottom: '15px'}}>
            <Search size={18} color="#64748b" />
            <input className="input-style w-full" placeholder="Qidirish..." onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
          </div>

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
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-table">
                      <PackageOpen size={40} />
                      <p>Mahsulotlar topilmadi</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <span className="total-count">Jami: {filteredItems.length} ta</span>
              <div className="pagination-controls">
                <button className="pagi-arrow" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16}/></button>
                <span className="pagi-num active">{currentPage}</span>
                <button className="pagi-arrow" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16}/></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALLAR */}
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
              <input className="input-style w-full mb-3" type="number" value={selectedProduct.price} onChange={e => setSelectedProduct({ ...selectedProduct, price: e.target.value })} />
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>Bekor qilish</button>
                <button className="btn-blue" style={{width: 'auto'}} onClick={() => { 
                  setProducts(products.map(p => p.id === selectedProduct.id ? selectedProduct : p)); 
                  setIsEditModalOpen(false); 
                  toast.info("Ma'lumot yangilandi"); 
                }}>Saqlash</button>
              </div>
            </div>
          </div>
        </div>
      )}

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