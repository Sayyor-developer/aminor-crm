import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Search, UserPlus, Pencil, Trash2, ShieldCheck, 
  User, Phone, Mail, Lock, X, AlertTriangle, ChevronLeft, ChevronRight 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; 
import { supabase } from '../../api/supabaseClient'; 
import './foydalanuvchilar.css';

const SECTIONS = [
  'Dashboard', 'Kolbasa va Maxsulotlar', 'Mijozlar Bazasi', 
  'Masalliqlar', 'Tannarx hisoblash', 'Moliya', 
  'Tovuq Chiqimlari', 'Foydalanuvchilar'
];

const Foydalanuvchilar = ({ open }) => {
  const [users, setUsers] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 8;

  const [modal, setModal] = useState({ type: null, user: null });

  const [addFormData, setAddFormData] = useState({ 
    name: '', phone: '+998', email: '', password: '', address: '', role: 'admin' 
  });

  const [editFormData, setEditFormData] = useState({ 
    name: '', phone: '', email: '', address: '', role: 'admin' 
  });

  const [tempPerms, setTempPerms] = useState([]);

  // 1. MA'LUMOTLARNI YUKLASH
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, email, address, role, permissions, created_at');
      
      if (error) throw error;
      setUsers(data.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)));
    } catch (err) {
      console.error("Xatolik:", err.message);
      toast.error("Ma'lumot yuklanmadi");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // TELEFON FORMATLASH
  const handlePhoneInput = (val, isEdit = false) => {
    const numbers = val.replace(/[^\d+]/g, '').substring(0, 13);
    if (isEdit) setEditFormData(p => ({ ...p, phone: numbers }));
    else setAddFormData(p => ({ ...p, phone: numbers }));
  };

  // QIDIRUV
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (u.phone || '').includes(searchTerm)
    );
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // MODAL OCHISH
  const openModal = (type, user = null) => {
    setModal({ type, user });
    if (type === 'edit') setEditFormData({ 
        name: user.full_name, phone: user.phone, email: user.email, 
        address: user.address, role: user.role 
    });
    if (type === 'add') setAddFormData({ name: '', phone: '+998', email: '', password: '', address: '', role: 'admin' });
    if (type === 'dostup') setTempPerms(Array.isArray(user.permissions) ? [...user.permissions] : []);
  };

  const closeModal = () => { setModal({ type: null, user: null }); setLoading(false); };

  // 2. YANGI FOYDALANUVCHI QO'SHISH (DUPLICATE HATOSIGA QARSHI)
  const handleAddSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!addFormData.email || !addFormData.password) return toast.error("Email va parol majburiy!");

    setLoading(true);
    try {
        // Auth-dan o'tkazamiz
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: addFormData.email,
            password: addFormData.password,
        });

        if (authError) throw authError;

        if (authData?.user) {
            // INSERT o'rniga UPSERT ishlatamiz (Duplicate key oldini oladi)
            const { error: profError } = await supabase.from('profiles').upsert([
                {
                    id: authData.user.id,
                    full_name: addFormData.name,
                    phone: addFormData.phone,
                    email: addFormData.email,
                    address: addFormData.address,
                    role: 'admin',
                    permissions: SECTIONS 
                }
            ], { onConflict: 'id' });

            if (profError) throw profError;
            
            toast.success("Muvaffaqiyatli qo'shildi!");
            await fetchUsers();
            closeModal();
        }
    } catch (err) {
        toast.error(err.message);
    } finally { setLoading(false); }
  };

  // 3. TAHRIRLASHNI SAQLASH
  const handleEditSave = async () => {
    setLoading(true);
    try {
        const { error } = await supabase.from('profiles').update({
            full_name: editFormData.name,
            phone: editFormData.phone,
            address: editFormData.address
        }).eq('id', modal.user.id);

        if (error) throw error;
        toast.success("Saqlandi!");
        await fetchUsers();
        closeModal();
    } catch (err) { toast.error(err.message); } 
    finally { setLoading(false); }
  };

  // 4. O'CHIRISH
  const handleDeleteUser = async () => {
      setLoading(true);
      try {
          const { error } = await supabase.from('profiles').delete().eq('id', modal.user.id);
          if (error) throw error;
          toast.success("O'chirildi");
          await fetchUsers();
          closeModal();
      } catch (err) { toast.error(err.message); } 
      finally { setLoading(false); }
  };

  // 5. RUXSATLARNI SAQLASH
  const handleDostupSave = async () => {
    setLoading(true);
    try {
        const { error } = await supabase.from('profiles').update({ permissions: tempPerms }).eq('id', modal.user.id);
        if (error) throw error;
        toast.success("Ruxsatlar yangilandi!");
        await fetchUsers();
        closeModal();
    } catch (err) { toast.error(err.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className={`foydalanuvchilar-page ${open ? 'content-shifted' : 'content-collapsed'}`}>
      <Toaster position="top-right" />
      <div className="max-w-7xl">
        <header className="page-header" style={{ justifyContent: 'space-between', display: 'flex', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="icon-box"><User /></div>
            <h1 className="page-title">Foydalanuvchilar</h1>
          </div>
          <button className="f-submit-btn" onClick={() => openModal('add')}>
            <UserPlus size={18}/> Yangi qo'shish
          </button>
        </header>

        <div className="user-card table-section-card">
          <div className="search-section">
            <div className="search-input-box">
              <Search className="search-inner-icon" size={20} />
              <input 
                type="text" placeholder="Qidirish..." className="modern-search-input" 
                value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
              />
            </div>
          </div>

          <div className="table-wrapper">
            <table className="user-table">
              <thead>
                <tr>
                  <th>F.I.O</th><th>Rol</th><th>Telefon</th><th>Email/Login</th><th>Manzil</th><th className="text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {loading && users.length === 0 ? (
                    <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Yuklanmoqda...</td></tr>
                ) : currentUsers.map(user => (
                  <tr key={user.id}>
                    <td className="user-name-cell">{user.full_name || '—'}</td>
                    <td><span className="role-badge role-admin">{user.role || 'admin'}</span></td>
                    <td>{user.phone || '—'}</td>
                    <td>{user.email || '—'}</td>
                    <td>{user.address || '—'}</td>
                    <td className="action-btns">
                      <button className="btn-icon bg-blue-light" onClick={() => openModal('dostup', user)}><ShieldCheck size={18}/></button>
                      <button className="btn-icon bg-orange-light" onClick={() => openModal('edit', user)}><Pencil size={18}/></button>
                      <button className="btn-icon bg-red-light" onClick={() => openModal('delete', user)}><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-footer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', padding: '20px' }}>
            <button className="pagi-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft size={20} /></button>
            <span style={{ fontWeight: '500' }}>Sahifa {currentPage} / {totalPages}</span>
            <button className="pagi-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      {modal.type && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ backgroundColor: '#A12323', color: 'white' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                {modal.type === 'add' ? "Yangi foydalanuvchi" : modal.type === 'edit' ? "Tahrirlash" : modal.type === 'delete' ? "O'chirish" : "Ruxsatlar"}
              </h3>
              <X onClick={closeModal} style={{ cursor: 'pointer' }} size={20} />
            </div>

            <div className="modal-body">
              {(modal.type === 'add' || modal.type === 'edit') && (
                <form id="userForm" className="edit-form-stack" onSubmit={modal.type === 'add' ? handleAddSubmit : (e) => e.preventDefault()}>
                   <div className="f-input-group"><User className="f-input-icon" size={18} /><input className="f-form-input custom-p" placeholder="F.I.O" value={modal.type === 'add' ? addFormData.name : editFormData.name} onChange={e => modal.type === 'add' ? setAddFormData({...addFormData, name: e.target.value}) : setEditFormData({...editFormData, name: e.target.value})} required /></div>
                   <div className="f-input-group"><Phone className="f-input-icon" size={18} /><input className="f-form-input custom-p" placeholder="+998" value={modal.type === 'add' ? addFormData.phone : editFormData.phone} onChange={e => handlePhoneInput(e.target.value, modal.type === 'edit')} required /></div>
                   <div className="f-input-group"><Mail className="f-input-icon" size={18} /><input type="email" className="f-form-input custom-p" placeholder="Email" value={modal.type === 'add' ? addFormData.email : editFormData.email} onChange={e => modal.type === 'add' ? setAddFormData({...addFormData, email: e.target.value}) : setEditFormData({...editFormData, email: e.target.value})} disabled={modal.type === 'edit'} required /></div>
                   {modal.type === 'add' && <div className="f-input-group"><Lock className="f-input-icon" size={18} /><input type="password" placeholder="Parol" className="f-form-input custom-p" value={addFormData.password} onChange={e => setAddFormData({...addFormData, password: e.target.value})} required /></div>}
                </form>
              )}

              {modal.type === 'delete' && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <AlertTriangle size={48} color="#A12323" />
                  <p>Haqiqatan ham <b>{modal.user?.full_name}</b>ni o'chirmoqchimisiz?</p>
                </div>
              )}

              {modal.type === 'dostup' && (
                <div className="permissions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '10px' }}>
                  {SECTIONS.map(sec => (
                    <label key={sec} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={tempPerms.includes(sec)} 
                        onChange={e => {
                          if (e.target.checked) setTempPerms([...tempPerms, sec]);
                          else setTempPerms(tempPerms.filter(p => p !== sec));
                        }}
                      />
                      {sec}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel-modal" onClick={closeModal}>Bekor qilish</button>
              <button 
                className="btn-save-modal" 
                disabled={loading}
                onClick={() => {
                  if (modal.type === 'add') handleAddSubmit();
                  else if (modal.type === 'edit') handleEditSave();
                  else if (modal.type === 'dostup') handleDostupSave();
                  else if (modal.type === 'delete') handleDeleteUser();
                }}
              >
                {loading ? "Bajarilmoqda..." : "Tasdiqlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Foydalanuvchilar;