import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const getLocal = (key, initial) => {
    const saved = localStorage.getItem(key);
    try {
      return saved ? JSON.parse(saved) : initial;
    } catch (e) {
      return initial;
    }
  };

  // --- STATELAR (LocalStorage - Doimiy) ---
  const [mijozlar, setMijozlar] = useState(getLocal('mijozlar', []));
  const [products, setProducts] = useState(getLocal('products', []));
  const [sotuvlar, setSotuvlar] = useState(getLocal('sotuvlar', [])); 
  const [chiqimlar, setChiqimlar] = useState(getLocal('chiqimlar', [])); 
  const [dinamika, setDinamika] = useState(getLocal('dinamika', [])); 

  // Ma'lumotlarni doimiy xotirada saqlash
  useEffect(() => {
    localStorage.setItem('mijozlar', JSON.stringify(mijozlar));
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('sotuvlar', JSON.stringify(sotuvlar));
    localStorage.setItem('chiqimlar', JSON.stringify(chiqimlar));
    localStorage.setItem('dinamika', JSON.stringify(dinamika));
  }, [mijozlar, products, sotuvlar, chiqimlar, dinamika]);

  // --- MASALLIQ/MAHSULOT MIQDORINI YANGILASH ---
  const masalliqMiqdoriniYangilash = (id, miqdor) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, stock: Number(p.stock || 0) + Number(miqdor) } : p
    ));
  };

  // --- MIJOZLAR FUNKSIYALARI ---
  const mijozQoshish = (yangi) => setMijozlar(prev => [yangi, ...prev]);
  const mijozOchirish = (id) => setMijozlar(prev => prev.filter(m => m.id !== id));
  const mijozYangilash = (updated) => setMijozlar(prev => prev.map(m => m.id === updated.id ? updated : m));

  // --- SOTUV VA KIRIM FUNKSIYALARI ---
  const sotuvQoshish = (yangiSotuv) => {
    setSotuvlar(prev => [yangiSotuv, ...prev]);
    if(yangiSotuv.mijozId) {
      setMijozlar(prev => prev.map(m => 
        m.id === yangiSotuv.mijozId ? { ...m, qarzdorlik: Number(m.qarzdorlik || 0) + Number(yangiSotuv.summa) } : m
      ));
    }
  };

  const sotuvOchirish = (id) => {
    const ochilganSotuv = sotuvlar.find(s => s.id === id);
    if (ochilganSotuv && ochilganSotuv.mijozId) {
      setMijozlar(prev => prev.map(m => 
        m.id === ochilganSotuv.mijozId ? { ...m, qarzdorlik: Math.max(0, Number(m.qarzdorlik || 0) - Number(ochilganSotuv.summa)) } : m
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

  // --- DINAMIK STATISTIKA (useMemo bilan bog'landi) ---
  const kolbasaJamiNarx = useMemo(() => {
    return products.reduce((sum, p) => sum + (Number(p.price || 0) * Number(p.stock || 0)), 0);
  }, [products]);

  const kolbasaJamiSoni = useMemo(() => {
    return products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
  }, [products]);

  const jamiKirim = useMemo(() => sotuvlar.reduce((sum, s) => sum + Number(s.summa || 0), 0), [sotuvlar]);
  const jamiChiqim = useMemo(() => chiqimlar.reduce((sum, c) => sum + Number(c.summa || 0), 0), [chiqimlar]);
  const jamiQarzlar = useMemo(() => mijozlar.reduce((sum, m) => sum + Number(m.qarzdorlik || 0), 0), [mijozlar]);
  const jamiTayyor = useMemo(() => dinamika.reduce((sum, d) => sum + Number(d.tayyor || 0), 0), [dinamika]);

  return (
    <DataContext.Provider value={{ 
      mijozlar, sotuvlar, chiqimlar, dinamika, products, 
      masalliqlar: products, 
      mijozQoshish, mijozOchirish, mijozYangilash,
      sotuvQoshish, sotuvOchirish,
      chiqimQoshish, chiqimOchirish,
      dinamikaQoshish, dinamikaOchirish,
      setProducts, 
      setMasalliqlar: setProducts, 
      masalliqMiqdoriniYangilash,
      jamiKirim, jamiChiqim, jamiQarzlar, jamiTayyor,
      kolbasaJamiSoni, kolbasaJamiNarx
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);