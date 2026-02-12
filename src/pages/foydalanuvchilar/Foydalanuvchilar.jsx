import React, { useState, useMemo, /* useEffect */ } from 'react';
import { 
  Search, UserPlus, Pencil, Trash2, ShieldCheck, 
  User, Phone, Send, MapPin, X, Check, AlertTriangle,
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; 
import './foydalanuvchilar.css';

const SECTIONS = [
  'Dashboard', 'Kolbasa va Maxsulotlar', 'Mijozlar Bazasi', 
  'Masalliqlar', 'Tannarx hisoblash', 'Moliya', 
  'Tovuq Chiqimlari', 'Foydalanuvchilar'
];

const Foydalanuvchilar = ({ open }) => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Alisher Valiyev', phone: '+998901234567', telegram: '@alisher_v', address: 'Toshkent', status: true, permissions: ['Dashboard'] },
    { id: 2, name: 'Dilnoza Karimova', phone: '+998912345678', telegram: '@dilnoza_k', address: 'Samarqand', status: true, permissions: SECTIONS },
     { id: 3, name: 'Alisher Valiyev', phone: '+998901234567', telegram: '@alisher_v', address: 'Toshkent', status: true, permissions: ['Dashboard'] },
    { id: 4, name: 'Dilnoza Karimova', phone: '+998912345678', telegram: '@dilnoza_k', address: 'Samarqand', status: true, permissions: SECTIONS }, { id: 5, name: 'Alisher Valiyev', phone: '+998901234567', telegram: '@alisher_v', address: 'Toshkent', status: true, permissions: ['Dashboard'] },
    { id: 6, name: 'Dilnoza Karimova', phone: '+998912345678', telegram: '@dilnoza_k', address: 'Samarqand', status: true, permissions: SECTIONS }, { id: 7, name: 'Alisher Valiyev', phone: '+998901234567', telegram: '@alisher_v', address: 'Toshkent', status: true, permissions: ['Dashboard'] },
    { id: 8, name: 'Dilnoza Karimova', phone: '+998912345678', telegram: '@dilnoza_k', address: 'Samarqand', status: true, permissions: SECTIONS }, { id: 9, name: 'Alisher Valiyev', phone: '+998901234567', telegram: '@alisher_v', address: 'Toshkent', status: true, permissions: ['Dashboard'] },
    { id: 10, name: 'Dilnoza Karimova', phone: '+998912345678', telegram: '@dilnoza_k', address: 'Samarqand', status: true, permissions: SECTIONS },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [modal, setModal] = useState({ type: null, user: null });
  const [addFormData, setAddFormData] = useState({ name: '', phone: '+998', telegram: '', address: '' });
  const [editFormData, setEditFormData] = useState({ name: '', phone: '', telegram: '', address: '' });
  const [tempPerms, setTempPerms] = useState([]);

  // Telefon raqam uchun faqat raqamlarni qabul qiluvchi funksiya
  const handlePhoneInput = (val, isEdit = false) => {
    const numbers = val.replace(/[^\d+]/g, ''); // Faqat raqam va +
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
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addFormData.name.trim() || addFormData.phone.length < 13) {
      toast.error("Ma'lumotlarni to'liq to'ldiring (Tel: +998XXXXXXXXX)"); return;
    }
    
    const newUser = { id: Date.now(), ...addFormData, status: true, permissions: ['Dashboard'] };
    const updatedUsers = [...users, newUser]; // Yangi foydalanuvchi oxiriga qo'shiladi
    setUsers(updatedUsers);
    
    // Oxirgi sahifaga o'tish mantiqi
    const nextTotalPages = Math.ceil(updatedUsers.length / itemsPerPage);
    setCurrentPage(nextTotalPages);
    
    setAddFormData({ name: '', phone: '+998', telegram: '', address: '' });
    toast.success("Yangi foydalanuvchi ro'yxat oxiriga qo'shildi!");
  };

  const openModal = (type, user) => {
    setModal({ type, user });
    if (type === 'edit') setEditFormData({ ...user });
    if (type === 'dostup') setTempPerms([...user.permissions]);
  };

  const closeModal = () => { setModal({ type: null, user: null }); setTempPerms([]); };

  const handleEditSave = () => {
    if (editFormData.phone.length < 13) { toast.error("Tel raqam xato!"); return; }
    setUsers(users.map(u => u.id === modal.user.id ? { ...u, ...editFormData } : u));
    closeModal(); toast.success("O'zgarishlar saqlandi!");
  };

  // ... (boshqa handle funksiyalar o'sha-o'sha)
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
        <header className="page-header">
          <div className="icon-box"><User /></div>
          <h1 className="page-title">Foydalanuvchilar Paneli</h1>
        </header>

        <div className="user-card card-padding mb-6">
          <form onSubmit={handleAddSubmit} className="f-form-grid">
            <div className="f-input-group"><User className="f-input-icon" size={16}/><input type="text" placeholder="F.I.O" className="f-form-input" value={addFormData.name} onChange={e => setAddFormData({...addFormData, name: e.target.value})} /></div>
            <div className="f-input-group">
                <Phone className="f-input-icon" size={16}/>
                <input 
                    type="text" 
                    placeholder="Telefon (+998)" 
                    className="f-form-input" 
                    value={addFormData.phone} 
                    onChange={e => handlePhoneInput(e.target.value)} 
                />
            </div>
            <div className="f-input-group qq"><Send className="f-input-icon" size={16}/><input type="text" placeholder="Telegram" className="f-form-input" value={addFormData.telegram} onChange={e => setAddFormData({...addFormData, telegram: e.target.value})} /></div>
            <div className="f-input-group"><MapPin className="f-input-icon" size={16}/><input type="text" placeholder="Manzil" className="f-form-input" value={addFormData.address} onChange={e => setAddFormData({...addFormData, address: e.target.value})} /></div>
            <button type="submit" className="f-submit-btn"><UserPlus size={18}/> Qo'shish</button>
          </form>
        </div>

        <div className="user-card table-section-card">
          <div className="search-section">
            <div className="search-input-box">
              <Search className="search-inner-icon" size={20} />
              <input type="text" placeholder="Ism yoki telefon orqali qidirish..." className="modern-search-input" value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
              {searchTerm && <X className="clear-search" size={18} onClick={() => setSearchTerm('')} />}
            </div>
          </div>

          <div className="table-wrapper">
            <table className="user-table">
              <thead>
                <tr>
                  <th>F.I.O</th>
                  <th>Telefon</th>
                  <th>Telegram</th>
                  <th>Manzil</th>
                  <th>Holat</th>
                  <th className="text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map(user => (
                  <tr key={user.id}>
                    <td className="user-name-cell">{user.name}</td>
                    <td>{user.phone}</td>
                    <td>{user.telegram}</td>
                    <td>{user.address}</td>
                    <td>
                        <button className={`status-toggle ${user.status ? 'bg-active' : 'bg-inactive'}`} onClick={() => {
                            setUsers(users.map(u => u.id === user.id ? {...u, status: !u.status} : u));
                            toast.success("Holat o'zgardi");
                        }}>
                        <div className={`toggle-circle ${user.status ? 'move-right' : 'move-left'}`} />
                      </button>
                    </td>
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

      {modal.type && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-header-title">{modal.type === 'edit' ? "Tahrirlash" : modal.type === 'delete' ? "O'chirish" : "Ruxsatlar"}</h3>
              <X onClick={closeModal} className="close-icon" />
            </div>
            <div className="modal-body">
              {modal.type === 'edit' && (
                <div className="edit-form-stack">
                   <div className="input-group"><User className="input-icon" size={16}/><input className="form-input custom-p" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} /></div>
                   <div className="input-group">
                        <Phone className="input-icon" size={16}/>
                        <input 
                            className="form-input custom-p" 
                            value={editFormData.phone} 
                            onChange={e => handlePhoneInput(e.target.value, true)} 
                        />
                   </div>
                   <div className="input-group"><Send className="input-icon" size={16}/><input className="form-input custom-p" value={editFormData.telegram} onChange={e => setEditFormData({...editFormData, telegram: e.target.value})} /></div>
                   <div className="input-group"><MapPin className="input-icon" size={16}/><input className="form-input custom-p" value={editFormData.address} onChange={e => setEditFormData({...editFormData, address: e.target.value})} /></div>
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
              {modal.type === 'delete' && <div className="delete-box"><AlertTriangle size={48} color="#A12323"/><p>Foydalanuvchini o'chirishni tasdiqlaysizmi?</p></div>}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel-modal" onClick={closeModal}>Bekor qilish</button>
              <button className="btn-save-modal" onClick={modal.type === 'delete' ? handleDeleteConfirm : (modal.type === 'dostup' ? handleDostupSave : handleEditSave)}>
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