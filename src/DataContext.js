import React, { createContext, useState, useContext, useEffect } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const getLocal = (key, initial) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  };

  // --- STATELAR ---
  const [mijozlar, setMijozlar] = useState(getLocal('mijozlar', []));
  
  // DIQQAT: Home 0 turishi uchun sotuvlarni LocalStorage'dan olmaymiz, 
  // shunchaki bo'sh massiv [] beramiz.
  const [sotuvlar, setSotuvlar] = useState([]); 
  
  const [chiqimlar, setChiqimlar] = useState(getLocal('chiqimlar', [])); 
  const [masalliqlar, setMasalliqlar] = useState(getLocal('masalliqlar', []));

  // Ma'lumotlarni saqlash (Sotuvlardan tashqari hamma narsani saqlaymiz)
  useEffect(() => {
    localStorage.setItem('mijozlar', JSON.stringify(mijozlar));
    localStorage.setItem('chiqimlar', JSON.stringify(chiqimlar));
    localStorage.setItem('masalliqlar', JSON.stringify(masalliqlar));
    // sotuvlar bu yerda saqlanmaydi, shuning uchun Refresh bo'lsa Home 0 bo'ladi
  }, [mijozlar, chiqimlar, masalliqlar]);

  // --- FUNKSIYALAR ---

  // Mijozlar mantiqi
  const mijozQoshish = (yangi) => setMijozlar(prev => [yangi, ...prev]);
  const mijozOchirish = (id) => setMijozlar(prev => prev.filter(m => m.id !== id));
  const mijozYangilash = (updated) => setMijozlar(prev => prev.map(m => m.id === updated.id ? updated : m));

  // Sotuv Qoshish (Home'dagi raqamni oshiradi)
  const sotuvQoshish = (yangiSotuv) => {
    setSotuvlar(prev => [yangiSotuv, ...prev]);
    if(yangiSotuv.mijozId) {
        setMijozlar(prev => prev.map(m => 
            m.id === yangiSotuv.mijozId ? { ...m, qarzdorlik: m.qarzdorlik + Number(yangiSotuv.summa) } : m
        ));
    }
  };

  // Sotuvni o'chirish (Zanjirvariy o'chirish)
  const sotuvOchirish = (sotuvId) => {
    const ochilayotganSotuv = sotuvlar.find(s => s.id === sotuvId);
    
    if (ochilayotganSotuv) {
      // Agar o'chirilayotgan sotuv biror mijozga tegishli bo'lsa, uning qarzini kamaytiramiz
      if (ochilayotganSotuv.mijozId) {
        setMijozlar(prev => prev.map(m => 
          m.id === ochilayotganSotuv.mijozId 
          ? { ...m, qarzdorlik: Math.max(0, m.qarzdorlik - ochilayotganSotuv.summa) } 
          : m
        ));
      }
      // Home (statistika) ro'yxatidan o'chirish
      setSotuvlar(prev => prev.filter(s => s.id !== sotuvId));
    }
  };

  // Chiqim
  const chiqimQoshish = (yangiChiqim) => setChiqimlar(prev => [yangiChiqim, ...prev]);
  const chiqimOchirish = (id) => setChiqimlar(prev => prev.filter(c => c.id !== id));

  // GLOBAL HISOB-KITOB
  const jamiKirim = sotuvlar.reduce((sum, s) => sum + Number(s.summa), 0);
  const jamiChiqim = chiqimlar.reduce((sum, c) => sum + Number(c.summa), 0);
  const jamiQarzlar = mijozlar.reduce((sum, m) => sum + Number(m.qarzdorlik), 0);
  const sofFoida = jamiKirim - jamiChiqim;

  return (
    <DataContext.Provider value={{ 
      mijozlar, mijozQoshish, mijozOchirish, mijozYangilash, 
      sotuvlar, sotuvQoshish, sotuvOchirish,
      chiqimlar, chiqimQoshish, chiqimOchirish,
      masalliqlar, setMasalliqlar,
      jamiKirim, jamiChiqim, jamiQarzlar, sofFoida
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);