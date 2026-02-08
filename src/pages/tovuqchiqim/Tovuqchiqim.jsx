import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, Trash2, Edit, ChevronLeft, ChevronRight, X, Calculator, AlertTriangle, Download 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; 
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useData } from '../../DataContext'; 
import './tovuqchiqim.css';

const Tovuqchiqim = ({ open }) => {
  // DataContext'dan kerakli funksiyalarni olamiz
  const { chiqimQoshish, chiqimOchirish } = useData();

  // Lokal bazani ham LocalStorage orqali boshqaramiz
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('tovuq_bazasi');
    return saved ? JSON.parse(saved) : [
      { id: 1, tovuqSoni: 500, mahsulotSoni: 425, sana: '2024-02-01', taminotchi: 'Toshkent Parranda', holat: true },
    ];
  });

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

  // Ma'lumot o'zgarganda LocalStorage'ga saqlash
  useEffect(() => {
    localStorage.setItem('tovuq_bazasi', JSON.stringify(data));
  }, [data]);

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("Tovuq Chiqimlari Hisoboti", 14, 15);
      const tableColumn = ["Tovuq soni", "Tayyor mahsulot", "Sana", "Ta'minotchi"];
      const tableRows = data.map(item => [item.tovuqSoni, item.mahsulotSoni, item.sana, item.taminotchi]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: 'grid',
        headStyles: { fillColor: [155, 28, 28] },
        styles: { fontSize: 10 }
      });

      doc.save(`hisobot_${new Date().getTime()}.pdf`);
      toast.success("PDF saqlandi!");
    } catch (error) {
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
    return data.filter(item => item.taminotchi.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSubmit = (e) => {
    e.preventDefault();
    const xarajatSummasi = Number(formData.tovuqSoni) * 25000; // 1 ta tovuq narxi taxminan

    if (editingItem) {
      // Tahrirlashda: avval eskisini DataContext (Home) dan o'chiramiz, keyin yangisini qo'shamiz
      chiqimOchirish(editingItem.id);
      
      const updatedItem = { ...editingItem, ...formData };
      setData(data.map(item => item.id === editingItem.id ? updatedItem : item));

      chiqimQoshish({
        id: editingItem.id,
        turi: "Tovuq xaridi (Tahrirlangan)",
        manbaa: formData.taminotchi,
        summa: xarajatSummasi,
        sana: formData.sana
      });

      toast.success("O'zgarish saqlandi");
    } else {
      const commonId = Date.now();
      const newData = { id: commonId, ...formData, holat: true };
      setData([...data, newData]); 

      // --- HOME UCHUN CHIQIMNI QAYD ETISH ---
      chiqimQoshish({
        id: commonId,
        turi: "Tovuq xaridi",
        manbaa: formData.taminotchi,
        summa: xarajatSummasi,
        sana: formData.sana
      });

      toast.success("Muvaffaqiyatli qo'shildi va xarajat qayd etildi");
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      // 1. Lokal bazadan o'chirish
      setData(data.filter(i => i.id !== itemToDelete.id));
      // 2. DataContext (Home) dan o'chirish
      chiqimOchirish(itemToDelete.id);
      
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      toast.error("Ma'lumot o'chirildi");
    }
  };

  return (
    <div className={`tovuqchiqim-page ${open ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Toaster position="top-right" />
      <div className="tovuqchiqim-content">
        
        <div className="tovuqchiqim-header">
          <div className="tovuqchiqim-title-box">
            <h1>Tovuq Chiqimlari</h1>
            <p>Xomashyo nazorati va mahsulot unumdorligi</p>
          </div>
          
          <div className="tovuqchiqim-header-btns">
            <button className="tovuqchiqim-print-btn" onClick={downloadPDF}>
              <Download size={18} /> Chop etish
            </button>
            <button className="tovuqchiqim-add-btn" onClick={() => {setEditingItem(null); setFormData({tovuqSoni:'', mahsulotSoni:'', taminotchi:'', sana: new Date().toISOString().split('T')[0]}); setIsModalOpen(true)}}>
              <Plus size={18} /> Yangi qo'shish
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="tovuqchiqim-stats-container">
          <div className="tovuqchiqim-stat-card">
            <div className="tovuqchiqim-info"><span>JAMI TOVUQLAR</span><h3>{data.reduce((a, b) => a + Number(b.tovuqSoni), 0).toLocaleString()}</h3></div>
          </div>
          <div className="tovuqchiqim-stat-card">
            <div className="tovuqchiqim-info"><span>TAYYOR MAHSULOT</span><h3>{data.reduce((a, b) => a + Number(b.mahsulotSoni), 0).toLocaleString()}</h3></div>
          </div>
          <div className="tovuqchiqim-stat-card">
            <div className="tovuqchiqim-info"><span>O'RTACHA UNUMDORLIK</span><h3>{((data.reduce((a, b) => a + Number(b.mahsulotSoni), 0) / data.reduce((a, b) => a + Number(b.tovuqSoni), 1)) * 100).toFixed(1)}%</h3></div>
          </div>
        </div>

        {/* CALCULATOR */}
        <div className="tovuqchiqim-calc-banner">
          <div className="tovuqchiqim-calc-info">
            <Calculator size={24} />
            <div>
              <h4>Tezkor Kalkulyator</h4>
              <p>Prognoz chiqim miqdori (Standart: 85%)</p>
            </div>
          </div>
          <input type="number" placeholder="Tovuq sonini kiriting..." value={calcInput} onChange={(e) => setCalcInput(e.target.value)} />
          <div className="tovuqchiqim-calc-res">
            Tayyor: <span>{Math.round(Number(calcInput) * yieldFactor) || 0}</span> DONA
          </div>
        </div>

        {/* TABLE */}
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
                      <div className="action-btns">
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

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-parda" onClick={() => setIsModalOpen(false)}>
          <div className="modal-oyna" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? 'Tahrirlash' : 'Yangi qo\'shish'}</h3>
              <X className="cursor-pointer" onClick={() => setIsModalOpen(false)} />
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                <input className="input-style" type="number" placeholder="Tovuq soni" value={formData.tovuqSoni} onChange={e => setFormData({...formData, tovuqSoni: e.target.value})} required />
                <input className="input-style" type="number" placeholder="Mahsulot soni" value={formData.mahsulotSoni} onChange={e => setFormData({...formData, mahsulotSoni: e.target.value})} required />
              </div>
              <input className="input-style w-full mb-3" type="text" placeholder="Ta'minotchi nomi" value={formData.taminotchi} onChange={e => setFormData({...formData, taminotchi: e.target.value})} required />
              <input className="input-style w-full mb-3" type="date" value={formData.sana} onChange={e => setFormData({...formData, sana: e.target.value})} required />
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Bekor qilish</button>
                <button type="submit" className="btn-blue">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {isDeleteModalOpen && (
        <div className="modal-parda" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-oyna modal-delete" onClick={e => e.stopPropagation()}>
            <div className="delete-icon-center">
              <AlertTriangle size={48} color="#ef4444" />
            </div>
            <h3 className="delete-title">O'chirilsinmi?</h3>
            <p className="delete-text">Bu xarajat Home sahifasidan ham o'chib ketadi.</p>
            <div className="modal-footer-btns">
              <button className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Yo'q</button>
              <button className="btn-red-confirm" onClick={handleConfirmDelete}>O'chirish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tovuqchiqim;