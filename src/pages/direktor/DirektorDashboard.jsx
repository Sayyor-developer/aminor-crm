import React, { useState } from 'react';
import { supabase } from '../api/supabaseClient';
import Header from '../Header';

const DirektorDashboard = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Ruxsatlar holati (Checkboxlar uchun)
  const [permissions, setPermissions] = useState({
    sklad: false,
    moliya: false,
    ishlab_chiqarish: false,
  });

  // Checkbox o'zgarganda ishlaydi
  const handlePermissionChange = (key) => {
    setPermissions({ ...permissions, [key]: !permissions[key] });
  };

  // YANGI ADMIN QO'SHISH FUNKSIYASI
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Supabase Auth orqali yangi adminni ro'yxatdan o'tkazish
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName } // Trigger profiles'ga ismni yozishi uchun
        }
      });

      if (authError) throw authError;

      // 2. Profiles jadvalidagi ruxsatlarni (permissions) yangilash
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin', 
          permissions: permissions 
        })
        .eq('id', authData.user.id);

      if (updateError) throw updateError;

      alert("Yangi admin muvaffaqiyatli qo'shildi!");
      
      // Formani tozalash
      setFullName('');
      setEmail('');
      setPassword('');
      setPermissions({ sklad: false, moliya: false, ishlab_chiqarish: false });

    } catch (error) {
      alert("Xatolik: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px' }}>
      <h1>Direktor Paneli</h1>
      <Header title="Direktor Paneli" />
      <div style={styles.card}>
        <h3>Yangi Admin Qo'shish</h3>
        <form onSubmit={handleAddAdmin} style={styles.form}>
          <input type="text" placeholder="Admin F.I.SH" value={fullName} onChange={(e) => setFullName(e.target.value)} style={styles.input} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
          <input type="password" placeholder="Parol" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
          
          <div style={styles.checkboxGroup}>
            <p>Ruxsat berish:</p>
            <label><input type="checkbox" checked={permissions.sklad} onChange={() => handlePermissionChange('sklad')} /> Sklad</label>
            <label><input type="checkbox" checked={permissions.moliya} onChange={() => handlePermissionChange('moliya')} /> Moliya</label>
            <label><input type="checkbox" checked={permissions.ishlab_chiqarish} onChange={() => handlePermissionChange('ishlab_chiqarish')} /> Ishlab chiqarish</label>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Saqlanmoqda...' : 'Adminni Qo\'shish'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', maxWidth: '500px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
  checkboxGroup: { display: 'flex', flexDirection: 'column', gap: '5px', margin: '10px 0' },
  button: { padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default DirektorDashboard;