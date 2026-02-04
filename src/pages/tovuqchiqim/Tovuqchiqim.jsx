import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Trash2, Edit, ChevronLeft, ChevronRight, X, Calculator, AlertTriangle, Download 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; 
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importni shu ko'rinishda o'zgartirdik
import './tovuqchiqim.css';

const Tovuqchiqim = ({ open }) => {
  const [data, setData] = useState([
    { id: 1, tovuqSoni: 500, mahsulotSoni: 425, sana: '2024-02-01', taminotchi: 'Toshkent Parranda', holat: true },
    { id: 2, tovuqSoni: 320, mahsulotSoni: 272, sana: '2024-02-02', taminotchi: 'Xorazm Tovuq', holat: true },
    { id: 3, tovuqSoni: 150, mahsulotSoni: 120, sana: '2024-02-03', taminotchi: 'Farg\'ona Parranda', holat: false },
    { id: 4, tovuqSoni: 500, mahsulotSoni: 425, sana: '2024-02-01', taminotchi: 'Toshkent Parranda', holat: true },
    { id: 5, tovuqSoni: 320, mahsulotSoni: 272, sana: '2024-02-02', taminotchi: 'Xorazm Tovuq', holat: true },
    { id: 6, tovuqSoni: 150, mahsulotSoni: 120, sana: '2024-02-03', taminotchi: 'Farg\'ona Parranda', holat: false }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [calcInput, setCalcInput] = useState('');
  
  const itemsPerPage = 7; 
  const yieldFactor = 0.85;

  const [formData, setFormData] = useState({
    tovuqSoni: '', mahsulotSoni: '', taminotchi: '', sana: new Date().toISOString().split('T')[0]
  });

  // PDF YUKLAB OLISH FUNKSIYASI (XATOSIZ VERSIA)
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("Tovuq Chiqimlari Hisoboti", 14, 15);
      
      const tableColumn = ["Tovuq soni", "Tayyor mahsulot", "Sana", "Ta'minotchi"];
      const tableRows = data.map(item => [
        item.tovuqSoni,
        item.mahsulotSoni,
        item.sana,
        item.taminotchi
      ]);

      // doc.autoTable o'rniga to'g'ridan-to'g'ri autoTable ishlatamiz
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: 'grid',
        headStyles: { fillColor: [155, 28, 28] }, // Brend rangi #9b1c1c
        styles: { fontSize: 10 }
      });

      doc.save(`hisobot_${new Date().getTime()}.pdf`);
      toast.success("PDF saqlandi!");
    } catch (error) {
      console.error("PDF yaratishda xato:", error);
      toast.error("PDF yaratishda xatolik yuz berdi");
    }
  };

  const toggleStatus = (id) => {
    setData(data.map(item => {
      if (item.id === id) {
        toast.success(!item.holat ? "Aktivlashtirildi" : "Nofaol qilindi");
        return { ...item, holat: !item.holat };
      }
      return item;
    }));
  };

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.taminotchi.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setData(data.map(item => item.id === editingItem.id ? { ...item, ...formData } : item));
      toast.success("O'zgarish saqlandi");
    } else {
      const newData = { id: Date.now(), ...formData, holat: true };
      setData([...data, newData]); 
      toast.success("Muvaffaqiyatli qo'shildi");
    }
    setIsModalOpen(false);
  };

  return (
    <div className={`tovuqchiqim-page ${open ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="tovuqchiqim-content">
        
        <div className="tovuqchiqim-header">
          <div className="tovuqchiqim-title-box">
            <h1>Tovuq Chiqimlari</h1>
            <p>Barcha mahsulotlar nazorati va hisoboti</p>
          </div>
          
          <div className="tovuqchiqim-header-btns" style={{ display: 'flex', gap: '8px' }}>
            <button className="tovuqchiqim-print-btn" onClick={downloadPDF}>
              <Download size={18} /> Chop etish
            </button>
            <button className="tovuqchiqim-add-btn" onClick={() => {setEditingItem(null); setFormData({tovuqSoni:'', mahsulotSoni:'', taminotchi:'', sana: new Date().toISOString().split('T')[0]}); setIsModalOpen(true)}}>
              <Plus size={18} /> Yangi qo'shish
            </button>
          </div>
        </div>

        {/* ... (Statistika va Kalkulyator qismi o'zgarishsiz qoladi) */}
        <div className="tovuqchiqim-stats-container">
          <div className="tovuqchiqim-stat-card">
            <div className="tovuqchiqim-info"><span>JAMI TOVUQLAR</span><h3>{data.reduce((a, b) => a + Number(b.tovuqSoni), 0).toLocaleString()}</h3></div>
          </div>
          <div className="tovuqchiqim-stat-card">
            <div className="tovuqchiqim-info"><span>TAYYOR MAHSULOT</span><h3>{data.reduce((a, b) => a + Number(b.mahsulotSoni), 0).toLocaleString()}</h3></div>
          </div>
          <div className="tovuqchiqim-stat-card">
            <div className="tovuqchiqim-info"><span>O'RTACHA CHIQIM</span><h3>85%</h3></div>
          </div>
        </div>

        <div className="tovuqchiqim-calc-banner">
          <div className="tovuqchiqim-calc-info">
            <Calculator size={24} />
            <div>
              <h4>Tezkor Kalkulyator</h4>
              <p>Prognoz chiqim miqdori</p>
            </div>
          </div>
          <input type="number" placeholder="Tovuq sonini kiriting..." value={calcInput} onChange={(e) => setCalcInput(e.target.value)} />
          <div className="tovuqchiqim-calc-res">
            Tayyor: <span>{Math.round(Number(calcInput) * yieldFactor) || 0}</span> DONA
          </div>
        </div>

        <div className="tovuqchiqim-main-card">
          <div className="tovuqchiqim-table-tools">
            <div className="tovuqchiqim-search">
              <Search size={18} />
              <input type="text" placeholder="Ta'minotchi bo'yicha qidirish..." onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1)}} />
            </div>
          </div>

          <div className="tovuqchiqim-table-responsive">
            <table className="tovuqchiqim-table">
              <thead>
                <tr>
                  <th>Tovuq soni</th>
                  <th>Tayyor mahsulot</th>
                  <th>Sana</th>
                  <th>Ta'minotchi</th>
                  <th>Holat</th>
                  <th className="tovuqchiqim-text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => (
                  <tr key={item.id} className={item.holat ? "row-active" : "row-disabled"}>
                    <td className="tovuqchiqim-bold">{item.tovuqSoni}</td>
                    <td><span className="tovuqchiqim-prod-val">{item.mahsulotSoni}</span> <small>dona</small></td>
                    <td>{item.sana}</td>
                    <td><span className="tovuqchiqim-vendor">{item.taminotchi}</span></td>
                    <td>
                      <div className={`tovuqchiqim-toggle ${item.holat ? 'active' : ''}`} onClick={() => toggleStatus(item.id)}>
                        <div className="tovuqchiqim-dot" />
                      </div>
                    </td>
                    <td className="tovuqchiqim-text-right">
                      <div className="tovuqchiqim-actions">
                        <button className="tovuqchiqim-edit" onClick={() => {setEditingItem(item); setFormData(item); setIsModalOpen(true)}}><Edit size={16}/></button>
                        <button className="tovuqchiqim-del" onClick={() => {setItemToDelete(item); setIsDeleteModalOpen(true)}}><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="tovuqchiqim-pagination">
            <p>Sahifa {currentPage} / {totalPages || 1}</p>
            <div className="pag-btns">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}><ChevronLeft size={18}/></button>
              <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)}><ChevronRight size={18}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* Modallar o'zgarishsiz qoladi */}
      {isModalOpen && (
        <div className="tovuqchiqim-modal">
          <div className="tovuqchiqim-modal-content">
            <div className="tovuqchiqim-modal-head">
              <h3>{editingItem ? 'Ma\'lumotni tahrirlash' : 'Yangi ma\'lumot qo\'shish'}</h3>
              <button className="close-x" onClick={() => setIsModalOpen(false)}><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="tovuqchiqim-form">
              <div className="form-grid">
                <input type="number" placeholder="Tovuq soni" value={formData.tovuqSoni} onChange={e => setFormData({...formData, tovuqSoni: e.target.value})} required />
                <input type="number" placeholder="Mahsulot soni" value={formData.mahsulotSoni} onChange={e => setFormData({...formData, mahsulotSoni: e.target.value})} required />
              </div>
              <input type="text" placeholder="Ta'minotchi nomi" value={formData.taminotchi} onChange={e => setFormData({...formData, taminotchi: e.target.value})} required />
              <input type="date" value={formData.sana} onChange={e => setFormData({...formData, sana: e.target.value})} required />
              <div className="tovuqchiqim-form-btns">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Bekor qilish</button>
                <button type="submit" className="tovuqchiqim-save">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="tovuqchiqim-modal">
          <div className="tovuqchiqim-confirm-box">
            <AlertTriangle size={48} color="#9b1c1c" />
            <h3>O'chirishni tasdiqlaysizmi?</h3>
            <p>Ushbu amalni ortga qaytarib bo'lmaydi.</p>
            <div className="tovuqchiqim-form-btns">
              <button className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Yo'q, qolsin</button>
              <button className="tovuqchiqim-save" onClick={() => {setData(data.filter(i => i.id !== itemToDelete.id)); setIsDeleteModalOpen(false); toast.error("Ma'lumot o'chirildi")}}>Ha, o'chirilsin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tovuqchiqim;