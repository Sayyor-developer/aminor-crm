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
  const { supabase, chiqimQoshish } = useData();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [calcInput, setCalcInput] = useState('');
  
  const itemsPerPage = 7; 
  const yieldFactor = 0.85;
  const TOVUQ_NARXI = 25000; // 1 dona tovuq narxi

  const [formData, setFormData] = useState({
    tovuqSoni: '', mahsulotSoni: '', taminotchi: '', sana: new Date().toISOString().split('T')[0]
  });

  // --- DATA FETCHING ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: bData, error } = await supabase
        .from('tovuq_chiqim')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      setData(bData || []);
    } catch (err) {
      toast.error("Ma'lumotni yuklashda xato!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Tovuq Chiqimlari Hisoboti", 14, 15);
    autoTable(doc, {
      head: [["Tovuq soni", "Tayyor mahsulot", "Sana", "Ta'minotchi"]],
      body: data.map(item => [item.tovuqSoni, item.mahsulotSoni, item.sana, item.taminotchi]),
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [155, 28, 28] }
    });
    doc.save(`tovuq_hisobot_${new Date().getTime()}.pdf`);
    toast.success("PDF saqlandi!");
  };

  const toggleStatus = async (item) => {
    const { error } = await supabase
      .from('tovuq_chiqim')
      .update({ holat: !item.holat })
      .eq('id', item.id);
    
    if (!error) {
      setData(data.map(i => i.id === item.id ? { ...i, holat: !item.holat } : i));
      toast.success("Holat yangilandi");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const xarajatSummasi = Number(formData.tovuqSoni) * TOVUQ_NARXI;

    try {
      if (editingItem) {
        // TAHRIRLASH
        const { error } = await supabase
          .from('tovuq_chiqim')
          .update(formData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success("O'zgarish saqlandi");
      } else {
        // YANGI QO'SHISH
        const { data: newRow, error } = await supabase
          .from('tovuq_chiqim')
          .insert([formData])
          .select();
        
        if (error) throw error;

        // Moliya bo'limiga chiqim sifatida yozish
        await chiqimQoshish({
          turi: "Tovuq xaridi",
          manbaa: formData.taminotchi,
          summa: xarajatSummasi,
          sana: formData.sana
        });

        toast.success("Muvaffaqiyatli qo'shildi va xarajat qayd etildi");
      }
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      const { error } = await supabase.from('tovuq_chiqim').delete().eq('id', itemToDelete.id);
      if (!error) {
        setData(data.filter(i => i.id !== itemToDelete.id));
        toast.error("Ma'lumot o'chirildi");
      }
      setIsDeleteModalOpen(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => item.taminotchi?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data, searchTerm]);

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className={`tovuqchiqim-page ${open ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Toaster position="top-right" />
      <div className="tovuqchiqim-content">
        
        <div className="tovuqchiqim-header">
          <div className="tovuqchiqim-title-box">
            <h1>Tovuq Chiqimlari</h1>
            <p>Xomashyo nazorati va mahsulot unumdorligi (Supabase)</p>
          </div>
          <div className="tovuqchiqim-header-btns">
            <button className="tovuqchiqim-print-btn" onClick={downloadPDF}><Download size={18} /> Chop etish</button>
            <button className="tovuqchiqim-add-btn" onClick={() => {setEditingItem(null); setFormData({tovuqSoni:'', mahsulotSoni:'', taminotchi:'', sana: new Date().toISOString().split('T')[0]}); setIsModalOpen(true)}}><Plus size={18} /> Yangi qo'shish</button>
          </div>
        </div>

        <div className="tovuqchiqim-stats-container">
          <div className="tovuqchiqim-stat-card">
            <div className="tovuqchiqim-info"><span>JAMI TOVUQLAR</span><h3>{data.reduce((a, b) => a + Number(b.tovuqSoni || 0), 0).toLocaleString()}</h3></div>
          </div>
          <div className="tovuqchiqim-stat-card">
            <div className="tovuqchiqim-info"><span>TAYYOR MAHSULOT</span><h3>{data.reduce((a, b) => a + Number(b.mahsulotSoni || 0), 0).toLocaleString()}</h3></div>
          </div>
          <div className="tovuqchiqim-stat-card">
            <div className="tovuqchiqim-info"><span>UNUMDORLIK</span><h3>{((data.reduce((a, b) => a + Number(b.mahsulotSoni || 0), 0) / data.reduce((a, b) => a + Number(b.tovuqSoni || 0), 1)) * 100).toFixed(1)}%</h3></div>
          </div>
        </div>

        <div className="tovuqchiqim-calc-banner">
          <div className="tovuqchiqim-calc-info"><Calculator size={24} /><div><h4>Tezkor Kalkulyator</h4><p>Prognoz (85%)</p></div></div>
          <input type="number" placeholder="Soni..." value={calcInput} onChange={(e) => setCalcInput(e.target.value)} />
          <div className="tovuqchiqim-calc-res">Tayyor: <span>{Math.round(Number(calcInput) * yieldFactor) || 0}</span> dona</div>
        </div>

        <div className="tovuqchiqim-main-card">
          <div className="tovuqchiqim-search"><Search size={18} /><input type="text" placeholder="Ta'minotchi bo'yicha..." onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1)}} /></div>
          <div className="tovuqchiqim-table-responsive">
            <table className="tovuqchiqim-table">
              <thead>
                <tr>
                  <th>Tovuq soni</th><th>Tayyor mahsulot</th><th>Sana</th><th>Ta'minotchi</th><th>Holat</th><th className="tovuqchiqim-text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="6" style={{textAlign:'center'}}>Yuklanmoqda...</td></tr> : 
                 paginatedData.map((item) => (
                  <tr key={item.id} className={item.holat ? "row-active" : "row-disabled"}>
                    <td className="tovuqchiqim-bold">{item.tovuqSoni}</td>
                    <td><span className="tovuqchiqim-prod-val">{item.mahsulotSoni}</span></td>
                    <td>{item.sana}</td>
                    <td><span className="tovuqchiqim-vendor">{item.taminotchi}</span></td>
                    <td>
                      <div className={`tovuqchiqim-toggle ${item.holat ? 'active' : ''}`} onClick={() => toggleStatus(item)}>
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
            <p>{currentPage} / {totalPages || 1}</p>
            <div className="pag-btns">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}><ChevronLeft size={18}/></button>
              <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => prev + 1)}><ChevronRight size={18}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL (Add/Edit) */}
      {isModalOpen && (
        <div className="modal-parda" onClick={() => setIsModalOpen(false)}>
          <div className="modal-oyna" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{editingItem ? 'Tahrirlash' : 'Yangi qo\'shish'}</h3><X className="cursor-pointer" onClick={() => setIsModalOpen(false)} /></div>
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

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="modal-parda" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-oyna modal-delete" onClick={e => e.stopPropagation()}>
            <div className="delete-icon-center"><AlertTriangle size={48} color="#ef4444" /></div>
            <h3 className="delete-title">O'chirilsinmi?</h3>
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