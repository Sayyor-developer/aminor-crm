import React, { createContext, useState, useContext, useEffect } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const getLocal = (key, initial) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  };

  // --- STATELAR (LocalStorage - Doimiy) ---
  const [mijozlar, setMijozlar] = useState(getLocal('mijozlar', []));
  const [masalliqlar, setMasalliqlar] = useState(getLocal('masalliqlar', []));

  // --- STATELAR (Session - Sahifa yangilanganda 0 bo'ladi) ---
  const [sotuvlar, setSotuvlar] = useState([]); 
  const [chiqimlar, setChiqimlar] = useState([]); 
  const [dinamika, setDinamika] = useState([]); 

  // Ma'lumotlarni doimiy xotirada saqlash
  useEffect(() => {
    localStorage.setItem('mijozlar', JSON.stringify(mijozlar));
    localStorage.setItem('masalliqlar', JSON.stringify(masalliqlar));
  }, [mijozlar, masalliqlar]);

  // --- MIJOZLAR FUNKSIYALARI ---
  const mijozQoshish = (yangi) => setMijozlar(prev => [yangi, ...prev]);
  const mijozOchirish = (id) => setMijozlar(prev => prev.filter(m => m.id !== id));
  const mijozYangilash = (updated) => setMijozlar(prev => prev.map(m => m.id === updated.id ? updated : m));

  // --- SOTUV VA KIRIM FUNKSIYALARI ---
  const sotuvQoshish = (yangiSotuv) => {
    setSotuvlar(prev => [yangiSotuv, ...prev]);
    // Agar qarzga sotilgan bo'lsa, mijozning qarziga avtomatik qo'shish
    if(yangiSotuv.mijozId) {
      setMijozlar(prev => prev.map(m => 
        m.id === yangiSotuv.mijozId ? { ...m, qarzdorlik: m.qarzdorlik + Number(yangiSotuv.summa) } : m
      ));
    }
  };

  const sotuvOchirish = (id) => {
    const ochilganSotuv = sotuvlar.find(s => s.id === id);
    if (ochilganSotuv && ochilganSotuv.mijozId) {
      setMijozlar(prev => prev.map(m => 
        m.id === ochilganSotuv.mijozId ? { ...m, qarzdorlik: Math.max(0, m.qarzdorlik - ochilganSotuv.summa) } : m
      ));
    }
    setSotuvlar(prev => prev.filter(s => s.id !== id));
  };

  // --- CHIQIM FUNKSIYALARI ---
  const chiqimQoshish = (yangiChiqim) => setChiqimlar(prev => [yangiChiqim, ...prev]);
  const chiqimOchirish = (id) => setChiqimlar(prev => prev.filter(c => c.id !== id));

  // --- ISHLAB CHIQARISH DINAMIKASI FUNKSIYALARI ---
  const dinamikaQoshish = (yangi) => setDinamika(prev => [yangi, ...prev]);
  const dinamikaOchirish = (id) => setDinamika(prev => prev.filter(d => d.id !== id));

  // --- GLOBAL STATISTIKA VA O'LCHOVLAR (DINAMIKA) ---
  
  // 1. Moliya o'lchovi
  const jamiKirim = sotuvlar.reduce((sum, s) => sum + Number(s.summa || 0), 0);
  const jamiChiqim = chiqimlar.reduce((sum, c) => sum + Number(c.summa || 0), 0);
  const jamiQarzlar = mijozlar.reduce((sum, m) => sum + Number(m.qarzdorlik || 0), 0);
  
  // 2. Ishlab chiqarish o'lchovi (Miqdoriy)
  const jamiXomashyo = dinamika.reduce((sum, d) => sum + Number(d.tovuq || 0), 0);
  const jamiTayyor = dinamika.reduce((sum, d) => sum + Number(d.tayyor || 0), 0);
  const jamiSotilganKg = sotuvlar.reduce((sum, s) => sum + Number(s.miqdor || 0), 0);

  // 3. Samaradorlik o'lchovi (%)
  const samaradorlikFoiz = jamiXomashyo > 0 ? ((jamiTayyor / jamiXomashyo) * 100).toFixed(1) : 0;

  // 4. Balans (Sof foyda kutilayotgan qarzlar bilan birga)
  const sofFoida = jamiKirim - jamiChiqim;
  const umumiyBalans = (jamiKirim + jamiQarzlar) - jamiChiqim;

  return (
    <DataContext.Provider value={{ 
      // Ma'lumotlar
      mijozlar, sotuvlar, chiqimlar, dinamika, masalliqlar,
      // Funksiyalar
      mijozQoshish, mijozOchirish, mijozYangilash,
      sotuvQoshish, sotuvOchirish,
      chiqimQoshish, chiqimOchirish,
      dinamikaQoshish, dinamikaOchirish,
      setMasalliqlar,
      // Dinamika o'lchovlari (Home uchun)
      jamiKirim, 
      jamiChiqim, 
      jamiQarzlar, 
      sofFoida, 
      umumiyBalans,
      jamiXomashyo, 
      jamiTayyor, 
      jamiSotilganKg,
      samaradorlikFoiz
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);