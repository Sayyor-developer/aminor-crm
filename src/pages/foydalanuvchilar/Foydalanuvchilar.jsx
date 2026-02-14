import React, { useState, useMemo } from 'react';
import { 
  Search, UserPlus, Pencil, Trash2, ShieldCheck, 
  User, Phone, Send, MapPin, X, Check, AlertTriangle,
  ChevronLeft, ChevronRight, UserCircle 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; 
import './foydalanuvchilar.css';

const SECTIONS = [
  'Dashboard', 'Kolbasa va Maxsulotlar', 'Mijozlar Bazasi', 
  'Masalliqlar', 'Tannarx hisoblash', 'Moliya', 
  'Tovuq Chiqimlari', 'Foydalanuvchilar'
];

const Foydalanuvchilar = ({ open }) => {
  // Sahifa boshida bo'sh turishi uchun
  const [users, setUsers] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [modal, setModal] = useState({ type: null, user: null });
  const [addFormData, setAddFormData] = useState({ name: '', phone: '+998', telegram: '', address: '', role: 'Xodim' });
  const [editFormData, setEditFormData] = useState({ name: '', phone: '', telegram: '', address: '', role: '' });
  const [tempPerms, setTempPerms] = useState([]);

  const handlePhoneInput = (val, isEdit = false) => {
    const numbers = val.replace(/[^\d+]/g, '');
    if (numbers.startsWith('+998') || numbers === '+99' || numbers === '+') {
       if (isEdit) setEditFormData({ ...editFormData, phone: numbers.substring(0, 13) });
       else setAddFormData({ ...addFormData, phone: numbers.substring(0, 13) });
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.phone.includes(searchTerm)
    );
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openModal = (type, user = null) => {
    setModal({ type, user });
    if (type === 'edit') setEditFormData({ ...user });
    if (type === 'add') setAddFormData({ name: '', phone: '+998', telegram: '', address: '', role: 'Xodim' });
    if (type === 'dostup') setTempPerms([...user.permissions]);
  };

  const closeModal = () => { setModal({ type: null, user: null }); setTempPerms([]); };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addFormData.name.trim() || addFormData.phone.length < 13) {
      toast.error("Ma'lumotlarni to'ldiring"); return;
    }
    const newUser = { id: Date.now(), ...addFormData, status: true, permissions: addFormData.role === 'Admin' ? SECTIONS : ['Dashboard'] };
    setUsers([...users, newUser]);
    closeModal();
    toast.success("Foydalanuvchi qo'shildi!");
  };

  const handleEditSave = () => {
    setUsers(users.map(u => u.id === modal.user.id ? { ...u, ...editFormData } : u));
    closeModal(); toast.success("O'zgarishlar saqlandi!");
  };

  const handleDostupSave = () => {
    setUsers(users.map(u => u.id === modal.user.id ? { ...u, permissions: tempPerms } : u));
    closeModal(); toast.success("Ruxsatlar yangilandi!");
  };

  const handleDeleteConfirm = () => {
    setUsers(users.filter(u => u.id !== modal.user.id));
    closeModal(); toast.error("O'chirildi!");
  };

  return (
    <div className={`foydalanuvchilar-page ${open ? 'content-shifted' : 'content-collapsed'}`}>
      <Toaster position="top-right" />
      <div className="max-w-7xl">
        <header className="page-header" style={{ justifyContent: 'space-between' }}>
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
              <input type="text" placeholder="Qidirish..." className="modern-search-input" value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
              {searchTerm && <X className="clear-search" size={18} onClick={() => setSearchTerm('')} />}
            </div>
          </div>

          <div className="table-wrapper">
            <table className="user-table">
              <thead>
                <tr>
                  <th>F.I.O</th>
                  <th>Rol</th>
                  <th>Telefon</th>
                  <th>Telegram</th>
                  <th>Manzil</th>
                  <th>Holat</th>
                  <th className="text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map(user => (
                    <tr key={user.id}>
                      <td className="user-name-cell">{user.name}</td>
                      <td><span className={`role-badge ${user.role === 'Admin' ? 'role-admin' : 'role-user'}`}>{user.role}</span></td>
                      <td>{user.phone}</td>
                      <td>{user.telegram}</td>
                      <td>{user.address}</td>
                      <td>
                        <button className={`status-toggle ${user.status ? 'bg-active' : 'bg-inactive'}`} onClick={() => setUsers(users.map(u => u.id === user.id ? {...u, status: !u.status} : u))}>
                          <div className={`toggle-circle ${user.status ? 'move-right' : 'move-left'}`} />
                        </button>
                      </td>
                      <td className="action-btns">
                        <button className="btn-icon bg-blue-light" onClick={() => openModal('dostup', user)}><ShieldCheck size={18}/></button>
                        <button className="btn-icon bg-orange-light" onClick={() => openModal('edit', user)}><Pencil size={18}/></button>
                        <button className="btn-icon bg-red-light" onClick={() => openModal('delete', user)}><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>Ma'lumot yo'q. Yangi foydalanuvchi qo'shing.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-footer">
              <div className="pagination-right">
                <button className="pagi-ctrl" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><ChevronLeft size={18}/></button>
                <div className="pagi-pages">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i+1} className={`pagi-item ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                  ))}
                </div>
                <button className="pagi-ctrl" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}><ChevronRight size={18}/></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL TIZIMI - SIZNING CSS STILINGIZDA */}
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
                <div className="edit-form-stack">
                  <div className="f-input-group">
                    <User className="f-input-icon" size={18} />
                    <input 
                      className="f-form-input custom-p" 
                      placeholder="F.I.O" 
                      value={modal.type === 'add' ? addFormData.name : editFormData.name} 
                      onChange={e => modal.type === 'add' ? setAddFormData({...addFormData, name: e.target.value}) : setEditFormData({...editFormData, name: e.target.value})} 
                    />
                  </div>

                  <div className="f-input-group">
                    <Phone className="f-input-icon" size={18} />
                    <input 
                      className="f-form-input custom-p" 
                      placeholder="+998" 
                      value={modal.type === 'add' ? addFormData.phone : editFormData.phone} 
                      onChange={e => handlePhoneInput(e.target.value, modal.type === 'edit')} 
                    />
                  </div>

                  <div className="f-input-group">
                    <UserCircle className="f-input-icon" size={18} />
                    <select 
                      className="f-form-input custom-p"
                      value={modal.type === 'add' ? addFormData.role : editFormData.role}
                      onChange={e => modal.type === 'add' ? setAddFormData({...addFormData, role: e.target.value}) : setEditFormData({...editFormData, role: e.target.value})}
                    >
                      <option value="Xodim">Xodim (Foydalanuvchi)</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div className="f-input-group">
                    <Send className="f-input-icon" size={18} />
                    <input 
                      className="f-form-input custom-p" 
                      placeholder="Telegram" 
                      value={modal.type === 'add' ? addFormData.telegram : editFormData.telegram} 
                      onChange={e => modal.type === 'add' ? setAddFormData({...addFormData, telegram: e.target.value}) : setEditFormData({...editFormData, telegram: e.target.value})} 
                    />
                  </div>

                  <div className="f-input-group">
                    <MapPin className="f-input-icon" size={18} />
                    <input 
                      className="f-form-input custom-p" 
                      placeholder="Manzil" 
                      value={modal.type === 'add' ? addFormData.address : editFormData.address} 
                      onChange={e => modal.type === 'add' ? setAddFormData({...addFormData, address: e.target.value}) : setEditFormData({...editFormData, address: e.target.value})} 
                    />
                  </div>
                </div>
              )}

              {modal.type === 'dostup' && (
                <div className="perm-list">
                  {SECTIONS.map(sec => (
                    <div key={sec} className={`perm-item ${tempPerms.includes(sec) ? 'active' : ''}`} onClick={() => setTempPerms(prev => prev.includes(sec) ? prev.filter(p => p !== sec) : [...prev, sec])}>
                      <span>{sec}</span>
                      <div className={`check-box ${tempPerms.includes(sec) ? 'checked' : ''}`}>{tempPerms.includes(sec) && <Check size={12}/>}</div>
                    </div>
                  ))}
                </div>
              )}

              {modal.type === 'delete' && (
                <div className="delete-box">
                  <AlertTriangle size={48} color="#A12323" style={{ marginBottom: '10px' }} />
                  <p>Foydalanuvchini o'chirishni tasdiqlaysizmi?</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel-modal" onClick={closeModal}>Bekor qilish</button>
              <button 
                className="btn-save-modal" 
                onClick={modal.type === 'delete' ? handleDeleteConfirm : (modal.type === 'dostup' ? handleDostupSave : (modal.type === 'add' ? handleAddSubmit : handleEditSave))}
              >
                {modal.type === 'delete' ? "O'chirish" : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Foydalanuvchilar;