import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Search, Plus, Trash2, Edit, ChevronLeft, ChevronRight, X,  AlertTriangle, Download 
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
  
  const itemsPerPage = 7; 
  const TOVUQ_NARXI = 25000; 

  const [formData, setFormData] = useState({
    tovuqSoni: '', 
    mahsulotSoni: '', 
    taminotchi: '', 
    sana: new Date().toISOString().split('T')[0]
  });

  // --- DATA FETCHING (useCallback bilan warningni yo'qotamiz) ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: bData, error } = await supabase
        .from('tovuq_chiqim')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      setData(bData || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Ma'lumotni yuklashda xato!");
    } finally {
      setLoading(false);
    }
  }, [supabase]); // Supabase o'zgarsagina funksiya qayta yaratiladi

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]); // Endi bu yerda sarg'ish warning chiqmaydi

  // --- PDF GENERATION ---
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Tovuq Chiqimlari Hisoboti", 14, 15);
    autoTable(doc, {
      head: [["Tovuq soni", "Tayyor mahsulot", "Sana", "Ta'minotchi"]],
      body: data.map(item => [item.tovuqsoni, item.mahsulotsoni, item.sana, item.taminotchi]),
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [155, 28, 28] }
    });
    doc.save(`tovuq_hisobot_${new Date().getTime()}.pdf`);
    toast.success("PDF saqlandi!");
  };

  // --- TOGGLE STATUS ---
  const toggleStatus = async (item) => {
    const { error } = await supabase
      .from('tovuq_chiqim')
      .update({ holat: !item.holat })
      .eq('id', item.id);
    
    if (!error) {
      setData(prevData => prevData.map(i => i.id === item.id ? { ...i, holat: !item.holat } : i));
      toast.success("Holat yangilandi");
    }
  };

  // --- HANDLE SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const baseData = {
      tovuqsoni: Number(formData.tovuqSoni),
      mahsulotsoni: Number(formData.mahsulotSoni),
      taminotchi: formData.taminotchi,
      sana: formData.sana
    };

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('tovuq_chiqim')
          .update(baseData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success("O'zgarish saqlandi");
      } else {
        const { error: insertError } = await supabase
          .from('tovuq_chiqim')
          .insert([{ ...baseData, holat: true }]);
        
        if (insertError) throw insertError;

        if (chiqimQoshish) {
          await chiqimQoshish({
            turi: "Tovuq xaridi",
            manbaa: formData.taminotchi,
            summa: Number(formData.tovuqSoni) * TOVUQ_NARXI,
            sana: formData.sana
          });
        }
        toast.success("Muvaffaqiyatli qo'shildi");
      }

      fetchData();
      setIsModalOpen(false);
      setFormData({tovuqSoni:'', mahsulotSoni:'', taminotchi:'', sana: new Date().toISOString().split('T')[0]});
      setEditingItem(null);
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err.message || "Xatolik yuz berdi");
    }
  };

  // --- DELETE ITEM ---
  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      const { error } = await supabase.from('tovuq_chiqim').delete().eq('id', itemToDelete.id);
      if (!error) {
        setData(prev => prev.filter(i => i.id !== itemToDelete.id));
        toast.success("Ma'lumot o'chirildi");
      } else {
        toast.error("O'chirishda xato bo'ldi");
      }
      setIsDeleteModalOpen(false);
    }
  };

  // --- PAGINATION & SEARCH ---
  const filteredData = useMemo(() => {
    return data.filter(item => item.taminotchi?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data, searchTerm]);

  const paginatedData = useMemo(() => {
    return filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className={`tovuqchiqim-page ${open ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Toaster position="top-right" />
      <div className="tovuqchiqim-content">
        
        <div className="tovuqchiqim-header">
          <div className="tovuqchiqim-title-box">
            <h1>Tovuq Chiqimlari</h1>
          </div>
          <div className="tovuqchiqim-header-btns">
            <button className="tovuqchiqim-print-btn" onClick={downloadPDF}><Download size={18} /> PDF</button>
            <button className="tovuqchiqim-add-btn" onClick={() => {
              setEditingItem(null); 
              setFormData({tovuqSoni:'', mahsulotSoni:'', taminotchi:'', sana: new Date().toISOString().split('T')[0]}); 
              setIsModalOpen(true);
            }}><Plus size={18} /> Yangi qo'shish</button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="tovuqchiqim-stats-container">
          <div className="tovuqchiqim-stat-card">
            <div className="tovuqchiqim-info">
                <span>JAMI TOVUQ</span>
                <h3>{data.reduce((a, b) => a + Number(b.tovuqsoni || 0), 0).toLocaleString()}</h3>
            </div>
          </div>
          <div className="tovuqchiqim-stat-card">
            <div className="tovuqchiqim-info">
                <span>MAHSULOT</span>
                <h3>{data.reduce((a, b) => a + Number(b.mahsulotsoni || 0), 0).toLocaleString()}</h3>
            </div>
          </div>
          <div className="tovuqchiqim-stat-card">
            <div className="tovuqchiqim-info">
              <span>UNUMDORLIK</span>
              <h3>
                {data.length > 0 
                  ? ((data.reduce((a, b) => a + Number(b.mahsulotsoni || 0), 0) / 
                      data.reduce((a, b) => a + Number(b.tovuqsoni || 1), 1)) * 100).toFixed(1) 
                  : 0}%
              </h3>
            </div>
          </div>
        </div>

        

        <div className="tovuqchiqim-main-card">
          <div className="tovuqchiqim-search">
            <Search size={18} />
            <input type="text" placeholder="Ta'minotchi bo'yicha qidirish..." onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1)}} />
          </div>
          
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
                    <td className="tovuqchiqim-bold">{item.tovuqsoni} ta</td>
                    <td><span className="tovuqchiqim-prod-val">{item.mahsulotsoni} ta</span></td>
                    <td>{item.sana}</td>
                    <td><span className="tovuqchiqim-vendor">{item.taminotchi}</span></td>
                    <td>
                      <div className={`tovuqchiqim-toggle ${item.holat ? 'active' : ''}`} onClick={() => toggleStatus(item)}>
                        <div className="tovuqchiqim-dot" />
                      </div>
                    </td>
                    <td className="tovuqchiqim-text-right">
                      <div className="action-btns">
                        <button className="tovuqchiqim-edit" onClick={() => {
                            setEditingItem(item); 
                            setFormData({
                                tovuqSoni: item.tovuqsoni,
                                mahsulotSoni: item.mahsulotsoni,
                                taminotchi: item.taminotchi,
                                sana: item.sana
                            }); 
                            setIsModalOpen(true)
                        }}><Edit size={16}/></button>
                        <button className="tovuqchiqim-del" onClick={() => {setItemToDelete(item); setIsDeleteModalOpen(true)}}><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
            <div className="modal-header">
                <h3>{editingItem ? 'Tahrirlash' : 'Yangi qo\'shish'}</h3>
                <X className="cursor-pointer" onClick={() => setIsModalOpen(false)} />
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                <div className="input-group">
                    <label>Tovuq soni</label>
                    <input className="input-style" type="number" value={formData.tovuqSoni} onChange={e => setFormData({...formData, tovuqSoni: e.target.value})} placeholder='Soni...' required />
                </div>
                <div className="input-group">
                    <label>Tayyor mahsulot</label>
                    <input className="input-style" type="number" value={formData.mahsulotSoni} onChange={e => setFormData({...formData, mahsulotSoni: e.target.value})} placeholder='Soni...' required />
                </div>
              </div>
              <div className="input-group mb-3">
                <label>Ta'minotchi nomi</label>
                <input className="input-style w-full" type="text" value={formData.taminotchi} onChange={e => setFormData({...formData, taminotchi: e.target.value})} placeholder='Nomi...' required />
              </div>
              <div className="input-group mb-3">
                <label>Sana</label>
                <input className="input-style w-full" type="date" value={formData.sana} onChange={e => setFormData({...formData, sana: e.target.value})} required />
              </div>
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
            <h3 className="delete-title">Ushbu ma'lumotni o'chirishga aminmisiz?</h3>
            <div className="modal-footer-btns">
              <button className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Bekor qilish</button>
              <button className="btn-red-confirm" onClick={handleConfirmDelete}>O'chirish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tovuqchiqim;