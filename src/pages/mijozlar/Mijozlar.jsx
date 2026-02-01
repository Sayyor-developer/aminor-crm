import React, { useState, useMemo } from 'react';
import { 
  Search, UserPlus, Edit, Trash2, 
  ChevronLeft, ChevronRight, X, AlertTriangle 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; 
import './mijozlar.css';

const Mijozlar = ({ open }) => {
  // Barcha boshlang'ich ma'lumotlar (Pagination ko'rinishi uchun 6 ta element)
  const [mijozlar, setMijozlar] = useState([
    { id: 1, ism: 'Alisher Valiyev', telefon: '+998901234567', telegram: '@alisher_v', manzil: 'Toshkent, Yunusobod', status: true },
    { id: 2, ism: 'Dilnoza Karimova', telefon: '+998912345678', telegram: '@dilnoza_k', manzil: 'Samarqand, Registon', status: true },
    { id: 3, ism: 'Jamshid Tursunov', telefon: '+998933456789', telegram: '@jamshid_t', manzil: 'Buxoro, Markaziy', status: false },
    { id: 4, ism: 'Sevara Rahimova', telefon: '+998944567890', telegram: '@sevara_r', manzil: 'Andijon, Asaka', status: true },
    { id: 5, ism: 'Bekzod Azimov', telefon: '+998955678901', telegram: '@bekzod_a', manzil: 'Namangan, Chorsu', status: true },
    { id: 6, ism: 'Nodira Sharipova', telefon: '+998976789012', telegram: '@nodira_sh', manzil: 'Fargona, Qoqon', status: false },
  ]);

  const [qidiruvMatni, setQidiruvMatni] = useState('');
  const [joriyBet, setJoriyBet] = useState(1);
  const [tahrirlashModalOchiq, setTahrirlashModalOchiq] = useState(false);
  const [ochirishModalOchiq, setOchirishModalOchiq] = useState(false);
  const [tanlangan, setTanlangan] = useState(null);
  const [yangiMijoz, setYangiMijoz] = useState({ ism: '', telefon: '+998', telegram: '', manzil: '', status: true });

  const betdagiSoni = 5;

  // TELEFON VALIDATSIYASI
  const telefonValidatsiya = (tel) => {
    if (!tel.startsWith('+998')) return "Telefon raqami +998 bilan boshlanishi shart!";
    if (tel.length !== 13) return "Telefon raqami 13 ta belgidan iborat bo'lishi kerak!";
    return null;
  };

  // QIDIRUV VA FILTR
  const filtrlangan = useMemo(() => {
    return mijozlar.filter(m => 
      m.ism.toLowerCase().includes(qidiruvMatni.toLowerCase()) || 
      m.telefon.includes(qidiruvMatni)
    );
  }, [mijozlar, qidiruvMatni]);

  // PAGINATION MANTIQI
  const jamiBetlar = Math.ceil(filtrlangan.length / betdagiSoni);
  const joriyMijozlar = filtrlangan.slice((joriyBet - 1) * betdagiSoni, joriyBet * betdagiSoni);

  const statusniOzgartirish = (id) => {
    setMijozlar(mijozlar.map(m => m.id === id ? { ...m, status: !m.status } : m));
    toast.success("Status yangilandi");
  };

  const tasdiqlanganOchirish = () => {
    setMijozlar(mijozlar.filter(m => m.id !== tanlangan.id));
    setOchirishModalOchiq(false);
    setTanlangan(null);
    toast.error("Mijoz o'chirildi");
  };

  const mijozniYangilash = () => {
    const telXato = telefonValidatsiya(tanlangan.telefon);
    if (telXato) { toast.error(telXato); return; }
    
    setMijozlar(mijozlar.map(m => m.id === tanlangan.id ? tanlangan : m));
    setTahrirlashModalOchiq(false);
    toast.success("Muvaffaqiyatli saqlandi!");
  };

  const mijozQoshish = () => {
    if (!yangiMijoz.ism.trim()) { toast.error("Avval ismni kiriting!"); return; }
    const telXato = telefonValidatsiya(yangiMijoz.telefon);
    if (telXato) { toast.error(telXato); return; }

    const id = Math.max(...mijozlar.map(m => m.id), 0) + 1;
    setMijozlar([...mijozlar, { ...yangiMijoz, id }]);
    setYangiMijoz({ ism: '', telefon: '+998', telegram: '', manzil: '', status: true });
    toast.success("Muvaffaqiyatli qo'shildi!");
  };

  return (
    <div className={`mijozlar-sahifa ${open ? 'sidebar-ochiq' : 'sidebar-yopiq'}`}>
      <Toaster position="top-right" />
      
      <div className="konteyner">
        <div className="header">
          <div className="header-icon"><UserPlus size={20} /></div>
          <h1>Mijozlar Bazasi</h1>
        </div>

        {/* QO'SHISH FORMASI */}
        <div className="card">
          <div className="card-title">Mijoz Qo'shish</div>
          <div className="input-guruhi">
            <input className="input-style" placeholder="Ism" value={yangiMijoz.ism} onChange={e => setYangiMijoz({...yangiMijoz, ism: e.target.value})} />
            <input className="input-style" placeholder="Telefon (+998XXXXXXXXX)" value={yangiMijoz.telefon} onChange={e => setYangiMijoz({...yangiMijoz, telefon: e.target.value})} />
            <input className="input-style" placeholder="Telegram @username" value={yangiMijoz.telegram} onChange={e => setYangiMijoz({...yangiMijoz, telegram: e.target.value})} />
            <input className="input-style" placeholder="Manzil" value={yangiMijoz.manzil} onChange={e => setYangiMijoz({...yangiMijoz, manzil: e.target.value})} />
          </div>
          <button className="btn-blue" onClick={mijozQoshish}>
            <UserPlus size={16} /> Qo'shish
          </button>
        </div>

        {/* JADVAL VA QIDIRUV */}
        <div className="card">
          <div className="qidiruv-blok">
            <Search className="qidiruv-icon" size={18} />
            <input className="input-style pl-icon" placeholder="Ism yoki telefon orqali qidirish..." onChange={e => {setQidiruvMatni(e.target.value); setJoriyBet(1);}} />
          </div>

          <div className="jadval-qobiq">
            <table className="mijoz-table">
              <thead>
                <tr>
                  <th>Mijoz Ismi</th>
                  <th>Telefon</th>
                  <th>Telegram</th>
                  <th>Manzil</th>
                  <th className="text-center">Holat</th>
                  <th className="text-center">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {joriyMijozlar.length > 0 ? joriyMijozlar.map(m => (
                  <tr key={m.id} className={m.status ? '' : 'inactive-row'}>
                    <td className={`font-medium ${m.status ? 'ism-active' : ''}`}>{m.ism}</td>
                    <td>{m.telefon}</td>
                    <td>{m.telegram}</td>
                    <td>{m.manzil}</td>
                    <td className="text-center switch-td">
                      <button className={`switch ${m.status ? 'switch-on' : 'switch-off'}`} onClick={() => statusniOzgartirish(m.id)}>
                        <span className={`knopka ${m.status ? 'knopka-on' : 'knopka-off'}`} />
                      </button>
                    </td>
                    <td className="text-center actions-td">
                      <div className="flex-center">
                        <button className="btn-blue btn-icon" onClick={() => {setTanlangan(m); setTahrirlashModalOchiq(true);}}>
                          <Edit size={14} />
                        </button>
                        <button className="btn-blue btn-red btn-icon" onClick={() => {setTanlangan(m); setOchirishModalOchiq(true);}}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Mijozlar topilmadi.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {jamiBetlar > 1 && (
            <div className="pagination">
              <span className="jami-text">Jami: {filtrlangan.length} ta mijoz</span>
              <div className="bet-btn-guruhi">
                <button className="bet-btn nav-btn" disabled={joriyBet === 1} onClick={() => setJoriyBet(v => v - 1)}>
                  <ChevronLeft size={16} /> Oldingi
                </button>
                {Array.from({length: jamiBetlar}, (_, i) => (
                  <button key={i} className={`bet-btn ${joriyBet === i+1 ? 'bet-btn-active' : ''}`} onClick={() => setJoriyBet(i+1)}>{i+1}</button>
                ))}
                <button className="bet-btn nav-btn" disabled={joriyBet === jamiBetlar} onClick={() => setJoriyBet(v => v + 1)}>
                  Keyingi <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TAHRIRLASH MODALI */}
      {tahrirlashModalOchiq && tanlangan && (
        <div className="modal-parda">
          <div className="modal-oyna">
            <div className="modal-header">
              <span>Mijozni Tahrirlash</span>
              <X className="cursor-pointer" size={18} onClick={() => setTahrirlashModalOchiq(false)} />
            </div>
            <div className="modal-body">
              <input className="input-style" value={tanlangan.ism} onChange={e => setTanlangan({...tanlangan, ism: e.target.value})} />
              <input className="input-style" value={tanlangan.telefon} onChange={e => setTanlangan({...tanlangan, telefon: e.target.value})} />
              <input className="input-style" value={tanlangan.telegram} onChange={e => setTanlangan({...tanlangan, telegram: e.target.value})} />
              <input className="input-style" value={tanlangan.manzil} onChange={e => setTanlangan({...tanlangan, manzil: e.target.value})} />
              <button className="btn-blue btn-full" onClick={mijozniYangilash}>Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* O'CHIRISH MODALI */}
      {ochirishModalOchiq && (
        <div className="modal-parda">
          <div className="modal-oyna modal-delete">
            <div className="modal-body text-center">
              <div className="delete-icon-box"><AlertTriangle size={40} color="#ef4444" /></div>
              <h3 className="delete-title">Mijozni o'chirasizmi?</h3>
              <p className="delete-text"><b>{tanlangan?.ism}</b> bazadan butunlay o'chib ketadi. Buni ortga qaytarib bo'lmaydi.</p>
              <div className="flex-center delete-btns">
                <button className="btn-cancel" onClick={() => setOchirishModalOchiq(false)}>Bekor qilish</button>
                <button className="btn-red-confirm" onClick={tasdiqlanganOchirish}>Ha, o'chirilsin</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mijozlar;