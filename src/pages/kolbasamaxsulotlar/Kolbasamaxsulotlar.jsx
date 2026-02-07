import React, { useState, useMemo, useCallback } from 'react';
import { Search, Edit, Trash2, Plus, ChevronRight, ChevronLeft, X, AlertTriangle, FileText } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'react-toastify/dist/ReactToastify.css';
import { useData } from '../../DataContext'; // Markaziy bazani ulaymiz
import './kolbasamaxsulotlar.css';

export default function Kolbasamaxsulotlar({ open }) {
  // DataContext'dan sotuvQoshish funksiyasini olamiz
  const { sotuvQoshish } = useData();

  const [products, setProducts] = useState([
    { id: 1, name: 'Doktor Kolbasa (Oliy)', unit: 'kg', stock: 120, price: 45000, active: true },
    { id: 2, name: 'Sosiska Sutli', unit: 'kg', stock: 85, price: 32000, active: true },
    { id: 3, name: 'Mol go\'shtli Dudlangan', unit: 'kg', stock: 140, price: 58000, active: true },
    { id: 4, name: 'Sardelka Maxsus', unit: 'kg', stock: 50, price: 38000, active: false },
    { id: 5, name: 'Qazi (Ot go\'shti)', unit: 'kg', stock: 30, price: 120000, active: true },
    { id: 6, name: 'Servelat Classic', unit: 'kg', stock: 90, price: 65000, active: true },
    { id: 7, name: 'Tovuqli Sosiska', unit: 'kg', stock: 200, price: 28000, active: true },
    { id: 8, name: 'Pishloqli Sardelka', unit: 'kg', stock: 45, price: 42000, active: true },
    { id: 9, name: 'Zaytunli Kolbasa', unit: 'kg', stock: 25, price: 70000, active: false },
    { id: 10, name: 'Halol Go\'shtli', unit: 'kg', stock: 300, price: 55000, active: true },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', unit: 'kg', price: '', stock: '' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredItems = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage]);

  const toggleStatus = useCallback((id) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const nextActive = !p.active;
        toast[nextActive ? 'success' : 'warn'](nextActive ? "Faollashtirildi" : "Nofaol qilindi", { toastId: `st-${id}` });
        return { ...p, active: nextActive };
      }
      return p;
    }));
  }, []);

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      toast.error("Ma'lumotlar to'liq emas!");
      return;
    }
    
    const productPrice = Number(newProduct.price);
    const productStock = Number(newProduct.stock);
    const jamiSumma = productPrice * productStock;

    const item = { 
      ...newProduct, 
      id: Date.now(), 
      active: true, 
      price: productPrice, 
      stock: productStock 
    };
    
    const updatedProducts = [...products, item];
    setProducts(updatedProducts);

    // --- HOME KARDLARINI YANGILASH UCHUN ---
    sotuvQoshish({
      id: Date.now(),
      summa: jamiSumma,
      miqdor: productStock,
      sana: new Date().toISOString()
    });

    setNewProduct({ name: '', unit: 'kg', price: '', stock: '' });
    const nextTotalPages = Math.ceil(updatedProducts.length / itemsPerPage);
    setCurrentPage(nextTotalPages);
    
    toast.success("Mahsulot qo'shildi va statistikaga kiritildi");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Mahsulotlar ro'yxati", 14, 15);
    autoTable(doc, {
      head: [["Nomi", "Birlik", "Qoldiq", "Narxi"]],
      body: products.map(p => [p.name, p.unit, p.stock, p.price]),
      startY: 20,
    });
    doc.save("Hisobot.pdf");
  };

  return (
    <div className={`mijozlar-sahifa ${open ? 'sidebar-ochiq' : 'sidebar-yopiq'}`}>
      <ToastContainer position="top-right" autoClose={1500} limit={1} theme="colored" />

      <div className="konteyner">
        <div className="header-main">
          <div className="header-left">
            <div className="header-icon"><Plus size={24} /></div>
            <h1>Kolbasa Mahsulotlari</h1>
          </div>
          <div className="header-actions">
            <button className="btn-export pdf" onClick={handleExportPDF}>
              <FileText size={16} /> PDF Export
            </button>
          </div>
        </div>

        <div className="card">
          <div className="input-guruhi">
            <input className="input-style" placeholder="Nomi" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
            <select className="input-style" value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}>
              <option value="kg">kg</option>
              <option value="dona">dona</option>
            </select>
            <input className="input-style" type="number" placeholder="Qoldiq" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
            <input className="input-style" type="number" placeholder="Narxi" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
            <button className="btn-blue" onClick={handleAddProduct}><Plus size={20} />Qo'shish</button>
          </div>
        </div>

        <div className="card">
          <div className="qidiruv-blok">
            <Search className="qidiruv-icon" size={18} />
            <input className="input-style pl-icon" placeholder="Qidiruv..." onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
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
                    <td>{Number(p.stock).toLocaleString()}</td>
                    <td>{Number(p.price).toLocaleString()} so'm</td>
                    <td className="text-center">
                      <button className={`switch ${p.active ? 'switch-on' : 'switch-off'}`} onClick={() => toggleStatus(p.id)}>
                        <div className={`knopka ${p.active ? 'knopka-on' : 'knopka-off'}`}></div>
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="action-btns">
                        <Edit className="icon-blue cursor-pointer" onClick={() => { setSelectedProduct(p); setIsEditModalOpen(true); }} />
                        <Trash2 className="icon-red cursor-pointer" onClick={() => { setSelectedProduct(p); setIsDeleteModalOpen(true); }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-container" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <div className="pagination-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                  className="pagi-arrow" 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer', border: '1px solid #ddd', background: '#fff', padding: '5px' }}
              >
                  <ChevronLeft size={18} />
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                  <button 
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      style={{
                          padding: '5px 12px',
                          borderRadius: '4px',
                          border: '1px solid var(--light-gray)',
                          backgroundColor: currentPage === index + 1 ? 'var(--primary-color)' : 'var(--white)',
                          color: currentPage === index + 1 ? 'var(--white)' : '#000',
                          cursor: 'pointer',
                          fontWeight: 'var(--font-weight-600)'
                      }}
                  >
                      {index + 1}
                  </button>
              ))}

              <button 
                  className="pagi-arrow" 
                  disabled={currentPage === totalPages || totalPages === 0} 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  style={{ cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', border: '1px solid #ddd', background: '#fff', padding: '5px' }}
              >
                  <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

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
                <button className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>Bekor</button>
                <button className="btn-blue" onClick={() => { 
                  setProducts(products.map(p => p.id === selectedProduct.id ? selectedProduct : p)); 
                  setIsEditModalOpen(false); 
                  toast.info("Saqlandi"); 
                }}>Saqlash</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedProduct && (
        <div className="modal-parda" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-oyna modal-delete" onClick={e => e.stopPropagation()}>
            <AlertTriangle size={48} color="var(--primary-color)" />
            <h3 style={{margin: '15px 0'}}>O'chirilsinmi?</h3>
            <p style={{marginBottom: '20px'}}>{selectedProduct.name}</p>
            <div className="modal-footer" style={{display: 'flex', gap: '10px', width: '100%'}}>
              <button className="btn-cancel" style={{flex: 1}} onClick={() => setIsDeleteModalOpen(false)}>Yo'q</button>
              <button className="btn-red" style={{flex: 1}} onClick={() => { 
                setProducts(products.filter(p => p.id !== selectedProduct.id)); 
                setIsDeleteModalOpen(false); 
                toast.error("O'chirildi"); 
              }}>Ha</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}