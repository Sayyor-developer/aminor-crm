import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Edit, Trash2,
  ChevronLeft, ChevronRight, X, AlertTriangle, Package
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import './masalliqlar.css';

const Masalliqlar = ({ open }) => {
  // Masalliqlar ro'yxati (15 tadan ko'p element pagination chiqishi uchun)
  const [masalliqlar, setMasalliqlar] = useState([
    { id: 1, nomi: 'Bug\'doy uni', miqdori: 500, birligi: 'kg', narxi: 5000, zavod: 'Toshkent Un Zavodi', status: true },
    { id: 2, nomi: 'Shakar (Oq)', miqdori: 300, birligi: 'kg', narxi: 8500, zavod: 'Xorazm Shakar', status: true },
    { id: 3, nomi: 'Paxta yog\'i', miqdori: 150, birligi: 'litr', narxi: 16000, zavod: 'Farg\'ona Yog\'', status: false },
    { id: 4, nomi: 'Tuxum (S1)', miqdori: 2000, birligi: 'dona', narxi: 1200, zavod: 'Parranda Sanoat', status: true },
    { id: 5, nomi: 'Sut 3.2%', miqdori: 200, birligi: 'litr', narxi: 7000, zavod: 'Namangan Sut', status: true },
    { id: 6, nomi: 'Margarin', miqdori: 100, birligi: 'kg', narxi: 14000, zavod: 'Buxoro Yog\' Kombinati', status: false },
    { id: 7, nomi: 'Bug\'doy uni (2-nav)', miqdori: 500, birligi: 'kg', narxi: 5000, zavod: 'Toshkent Un Zavodi', status: true },
    { id: 8, nomi: 'Shakar (Jigarrang)', miqdori: 300, birligi: 'kg', narxi: 8500, zavod: 'Xorazm Shakar', status: true },
    { id: 9, nomi: 'Kungaboqar yog\'i', miqdori: 150, birligi: 'litr', narxi: 16000, zavod: 'Farg\'ona Yog\'', status: false },
    { id: 10, nomi: 'Tuxum (S2)', miqdori: 2000, birligi: 'dona', narxi: 1200, zavod: 'Parranda Sanoat', status: true },
    { id: 11, nomi: 'Qaymoq', miqdori: 200, birligi: 'litr', narxi: 7000, zavod: 'Namangan Sut', status: true },
    { id: 12, nomi: 'Sariyog\'', miqdori: 100, birligi: 'kg', narxi: 14000, zavod: 'Buxoro Yog\' Kombinati', status: false },
    { id: 13, nomi: 'Asal', miqdori: 2000, birligi: 'dona', narxi: 1200, zavod: 'Parranda Sanoat', status: true },
    { id: 14, nomi: 'Tuz', miqdori: 200, birligi: 'litr', narxi: 7000, zavod: 'Namangan Sut', status: true },
    { id: 15, nomi: 'Zira', miqdori: 100, birligi: 'kg', narxi: 14000, zavod: 'Buxoro Yog\' Kombinati', status: false },
    { id: 16, nomi: 'Vanilin', miqdori: 10, birligi: 'kg', narxi: 100000, zavod: 'Pishiriq Zavod', status: true },
  ]);

  const [qidiruvMatni, setQidiruvMatni] = useState('');
  const [joriyBet, setJoriyBet] = useState(1);
  const [tahrirlashModalOchiq, setTahrirlashModalOchiq] = useState(false);
  const [ochirishModalOchiq, setOchirishModalOchiq] = useState(false);
  const [tanlangan, setTanlangan] = useState(null);
  const [yangiMasalliq, setYangiMasalliq] = useState({ nomi: '', miqdori: '', birligi: 'kg', narxi: '', zavod: '', status: true });

  const betdagiSoni = 15;

  // QIDIRUV VA FILTR
  const filtrlangan = useMemo(() => {
    return masalliqlar.filter(m =>
      m.nomi.toLowerCase().includes(qidiruvMatni.toLowerCase()) ||
      m.zavod.toLowerCase().includes(qidiruvMatni.toLowerCase())
    );
  }, [masalliqlar, qidiruvMatni]);

  // PAGINATION MANTIQI
  const jamiBetlar = Math.ceil(filtrlangan.length / betdagiSoni);
  const joriyMasalliqlar = filtrlangan.slice((joriyBet - 1) * betdagiSoni, joriyBet * betdagiSoni);

  const statusniOzgartirish = (id) => {
    setMasalliqlar(masalliqlar.map(m => m.id === id ? { ...m, status: !m.status } : m));
    toast.success("Masalliq holati o'zgardi");
  };

  const tasdiqlanganOchirish = () => {
    setMasalliqlar(masalliqlar.filter(m => m.id !== tanlangan.id));
    setOchirishModalOchiq(false);
    setTanlangan(null);
    toast.error("Masalliq o'chirildi");
  };

  const masalliqniYangilash = () => {
    if (!tanlangan.nomi || !tanlangan.miqdori || !tanlangan.narxi) {
      toast.error("Ma'lumotlar chala!");
      return;
    }
    setMasalliqlar(masalliqlar.map(m => m.id === tanlangan.id ? tanlangan : m));
    setTahrirlashModalOchiq(false);
    toast.success("O'zgarishlar saqlandi");
  };

  const masalliqQoshish = () => {
    if (!yangiMasalliq.nomi.trim()) { toast.error("Nomini kiriting!"); return; }
    const id = Math.max(...masalliqlar.map(m => m.id), 0) + 1;
    setMasalliqlar([{ ...yangiMasalliq, id, miqdori: Number(yangiMasalliq.miqdori), narxi: Number(yangiMasalliq.narxi) }, ...masalliqlar]);
    setYangiMasalliq({ nomi: '', miqdori: '', birligi: 'kg', narxi: '', zavod: '', status: true });
    setJoriyBet(1);
    toast.success("Qo'shildi!");
  };

  return (
    <div className={`m-page ${open ? 'm-sidebar-open' : 'm-sidebar-closed'}`}>
      <Toaster position="top-right" />

      <div className="m-container">
        <div className="m-title-area">
          <div className="m-main-icon"><Package size={22} /></div>
          <h1>Xom-ashyo Ombori</h1>
        </div>

        <div className="m-data-card">
          <div className="m-card-subtitle">Yangi masalliq qabul qilish</div>
          <div className="m-input-row">
            <input className="m-custom-input" placeholder="Masalliq nomi" value={yangiMasalliq.nomi} onChange={e => setYangiMasalliq({ ...yangiMasalliq, nomi: e.target.value })} />
            <div className="m-split-input">
              <input className="m-custom-input" type="number" placeholder="Miqdori" value={yangiMasalliq.miqdori} onChange={e => setYangiMasalliq({ ...yangiMasalliq, miqdori: e.target.value })} />
              <select className="m-custom-select" value={yangiMasalliq.birligi} onChange={e => setYangiMasalliq({ ...yangiMasalliq, birligi: e.target.value })}>
                <option value="kg">kg</option>
                <option value="litr">litr</option>
                <option value="dona">dona</option>
              </select>
            </div>
            <input className="m-custom-input" type="number" placeholder="Narxi" value={yangiMasalliq.narxi} onChange={e => setYangiMasalliq({ ...yangiMasalliq, narxi: e.target.value })} />
            <input className="m-custom-input" placeholder="Zavod/Ta'minotchi" value={yangiMasalliq.zavod} onChange={e => setYangiMasalliq({ ...yangiMasalliq, zavod: e.target.value })} />
          </div>
          <button className="m-add-btn" onClick={masalliqQoshish}>
            <Plus size={18} /> Ro'yxatga qo'shish
          </button>
        </div>

        <div className="m-data-card">
          <div className="m-search-box">
            <Search className="m-search-icon" size={20} />
            <input className="m-custom-input m-pl-40" placeholder="Qidirish..." onChange={e => { setQidiruvMatni(e.target.value); setJoriyBet(1); }} />
          </div>

          <div className="m-table-wrapper">
            <table className="m-data-table">
              <thead>
                <tr>
                  <th>Masalliq</th>
                  <th>Miqdor / Birlik</th>
                  <th>Narxi (so'm)</th>
                  <th>Ta'minotchi</th>
                  <th className="text-center">Holat</th>
                  <th className="text-center">Boshqaruv</th>
                </tr>
              </thead>
              <tbody>
                {joriyMasalliqlar.length > 0 ? joriyMasalliqlar.map(m => (
                  <tr key={m.id} className={m.status ? 'm-row-active' : 'm-row-disabled'}>
                    <td className="m-font-bold">{m.nomi}</td>
                    <td>{m.miqdori} <span className="m-tag">{m.birligi}</span></td>
                    <td className="m-price-col">{m.narxi.toLocaleString()}</td>
                    <td>{m.zavod}</td>
                    <td className="text-center">
                      <div className={`m-toggle ${m.status ? 'm-toggle-on' : 'm-toggle-off'}`} onClick={() => statusniOzgartirish(m.id)}>
                        <div className="m-toggle-circle" />
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="m-action-flex">
                        <button className="m-icon-btn m-edit" onClick={() => { setTanlangan(m); setTahrirlashModalOchiq(true); }}><Edit size={16} /></button>
                        <button className="m-icon-btn m-delete" onClick={() => { setTanlangan(m); setOchirishModalOchiq(true); }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="m-empty-msg">Topilmadi.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {jamiBetlar > 1 && (
            <div className="m-pagination-row">
              <span className="m-total-count">Jami: {filtrlangan.length} xil</span>
              <div className="m-page-btns">
                <button className="m-nav-btn" disabled={joriyBet === 1} onClick={() => setJoriyBet(v => v - 1)}>
                  <ChevronLeft size={16} /> Oldingi
                </button>
                <div className="m-num-group">
                  {Array.from({ length: jamiBetlar }, (_, i) => (
                    <button key={i} className={`m-num-btn ${joriyBet === i + 1 ? 'm-num-active' : ''}`} onClick={() => setJoriyBet(i + 1)}>{i + 1}</button>
                  ))}
                </div>
                <button className="m-nav-btn" disabled={joriyBet === jamiBetlar} onClick={() => setJoriyBet(v => v + 1)}>
                  Keyingi <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TAHRIRLASH MODALI */}
      {tahrirlashModalOchiq && tanlangan && (
        <div className="m-overlay">
          <div className="m-modal">
            <div className="m-modal-head">
              <span>Tahrirlash</span>
              <X className="m-close" size={20} onClick={() => setTahrirlashModalOchiq(false)} />
            </div>
            <div className="m-modal-body">
              <div className="m-modal-field">
                <label>Nomi</label>
                <input className="m-custom-input" value={tanlangan.nomi} onChange={e => setTanlangan({ ...tanlangan, nomi: e.target.value })} />
              </div>
              <div className="m-modal-grid">
                <div><label>Miqdor</label><input className="m-custom-input" type="number" value={tanlangan.miqdori} onChange={e => setTanlangan({ ...tanlangan, miqdori: e.target.value })} /></div>
                <div><label>Birlik</label><select className="m-custom-select" value={tanlangan.birligi} onChange={e => setTanlangan({ ...tanlangan, birligi: e.target.value })}><option value="kg">kg</option><option value="litr">litr</option><option value="dona">dona</option></select></div>
              </div>
              <div className="m-modal-field"><label>Narxi</label><input className="m-custom-input" type="number" value={tanlangan.narxi} onChange={e => setTanlangan({ ...tanlangan, narxi: e.target.value })} /></div>
              <div className="m-modal-field"><label>Zavod</label><input className="m-custom-input" value={tanlangan.zavod} onChange={e => setTanlangan({ ...tanlangan, zavod: e.target.value })} /></div>
              <button className="m-save-btn" onClick={masalliqniYangilash}>Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* O'CHIRISH MODALI */}
      {ochirishModalOchiq && (
        <div className="m-overlay">
          <div className="m-modal m-modal-sm">
            <div className="m-modal-body m-text-center">
              <div className="m-warn-circle"><AlertTriangle size={36} /></div>
              <h3 className="m-modal-title">O'chirilsinmi?</h3>
              <p className="m-modal-text"><b>{tanlangan?.nomi}</b> o'chirib tashlanadi.</p>
              <div className="m-modal-btns">
                <button className="m-btn-gray" onClick={() => setOchirishModalOchiq(false)}>Yo'q</button>
                <button className="m-btn-danger" onClick={tasdiqlanganOchirish}>Ha</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Masalliqlar;