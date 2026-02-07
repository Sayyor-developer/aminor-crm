import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, ChevronRight, ChevronLeft, X, AlertTriangle, FileText, PackageOpen } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useData } from '../../DataContext'; 
import './kolbasamaxsulotlar.css';

export default function Kolbasamaxsulotlar({ open }) {
  // DataContext'dan sotuvQoshish va sotuvOchirish funksiyalarini chaqiramiz
  const { sotuvQoshish, sotuvOchirish } = useData();

  // --- LOCALSTORAGE'DAN MAHSULOTLARNI YUKLASH ---
  const [products, setProducts] = useState(() => {
    const saqlangan = localStorage.getItem('kolbasa_bazasi');
    return saqlangan ? JSON.parse(saqlangan) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', unit: 'kg', price: '', stock: '' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ma'lumotlar o'zgarganda LocalStorage'ga yozish
  useEffect(() => {
    localStorage.setItem('kolbasa_bazasi', JSON.stringify(products));
  }, [products]);

  // Qidiruv filtri
  const filteredItems = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, searchQuery]);

  // Pagination hisob-kitobi
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage]);

  // Holatni (active/inactive) o'zgartirish
  const toggleStatus = useCallback((id) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, active: !p.active } : p)));
  }, []);

  // --- MAHSULOT QO'SHISH (HOMEGA FAQAT SHU YERDAN MA'LUMOT BORADI) ---
  const handleAddProduct = () => {
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.stock) {
      toast.error("Ma'lumotlarni to'liq kiriting!");
      return;
    }
    
    const commonId = Date.now(); // Ikkala joy (Ombor va Home) uchun bitta umumiy ID
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
    
    // Ombordagi ro'yxatga qo'shish
    setProducts(prev => [...prev, item]);

    // Home (Bosh sahifa) statistikasiga yuborish
    // Shunda kirganda 0 bo'ladi, qo'shsangiz ko'payadi
    sotuvQoshish({
      id: commonId,
      summa: productPrice * productStock,
      miqdor: productStock,
      sana: new Date().toISOString()
    });

    setNewProduct({ name: '', unit: 'kg', price: '', stock: '' });
    toast.success("Muvaffaqiyatli qo'shildi!");
  };

  // --- MAHSULOTNI O'CHIRISH (HOMEDAN HAM O'CHIRADI) ---
  const handleConfirmDelete = () => {
    if (selectedProduct) {
      // Ombordan o'chirish
      setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
      
      // Home sahifasidan ham o'chirib tashlash (Zanjirvariy o'chirish)
      sotuvOchirish(selectedProduct.id); 

      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      toast.error("O'chirildi");
    }
  };

  return (
    <div className={`mijozlar-sahifa ${open ? 'sidebar-ochiq' : 'sidebar-yopiq'}`}>
      <ToastContainer position="top-right" autoClose={1500} />

      <div className="konteyner">
        <div className="header-main">
          <div className="header-left">
            <div className="header-icon"><Plus size={24} /></div>
            <h1>Kolbasa Ombori</h1>
          </div>
          <div className="header-actions">
            <button className="btn-export pdf" style={{width: 'auto', background: 'var(--primary-color)'}}>
              <FileText size={16} /> PDF Export
            </button>
          </div>
        </div>

        {/* INPUT QISMI */}
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

        {/* JADVAL QISMI */}
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
                {currentItems.length > 0 ? currentItems.map(p => (
                  <tr key={p.id} className={p.active ? 'row-active' : 'row-inactive'}>
                    <td className={p.active ? 'name-active' : 'name-inactive'}>{p.name}</td>
                    <td>{p.unit}</td>
                    <td>{Number(p.stock).toLocaleString()}</td>
                    <td>{Number(p.price).toLocaleString()} so'm</td>
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
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center" style={{padding: '50px 0', opacity: 0.5}}>
                      <PackageOpen size={40} style={{margin: '0 auto 10px'}} />
                      <p>Mahsulotlar mavjud emas</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
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
              <input className="input-style w-full mb-3" type="number" value={selectedProduct.price} onChange={e => setSelectedProduct({ ...selectedProduct, price: e.target.value })} />
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>Bekor qilish</button>
                <button className="btn-blue" style={{width: 'auto'}} onClick={() => { 
                  setProducts(products.map(p => p.id === selectedProduct.id ? selectedProduct : p)); 
                  setIsEditModalOpen(false); 
                  toast.info("Yangilandi"); 
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
            <p className="delete-text"><b>{selectedProduct.name}</b> o'chirilsinmi? Bu statistikaga ham ta'sir qiladi.</p>
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