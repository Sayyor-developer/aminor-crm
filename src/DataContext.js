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

  // --- GLOBAL STATE-LAR ---
  const [mijozlar, setMijozlar] = useState(getLocal('mijozlar', []));
  const [products, setProducts] = useState(getLocal('products', []));
  const [sotuvlar, setSotuvlar] = useState(getLocal('sotuvlar', [])); 
  const [chiqimlar, setChiqimlar] = useState(getLocal('chiqimlar', [])); 
  const [masalliqlar, setMasalliqlar] = useState(getLocal('masalliqlar', []));
  const [tarix, setTarix] = useState(getLocal('kirim_tarixi', []));

  // --- LOCALSTORAGE BILAN DOIMIY ALOQA ---
  useEffect(() => {
    localStorage.setItem('mijozlar', JSON.stringify(mijozlar));
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('sotuvlar', JSON.stringify(sotuvlar));
    localStorage.setItem('chiqimlar', JSON.stringify(chiqimlar));
    localStorage.setItem('masalliqlar', JSON.stringify(masalliqlar));
    localStorage.setItem('kirim_tarixi', JSON.stringify(tarix));
  }, [mijozlar, products, sotuvlar, chiqimlar, masalliqlar, tarix]);

  const clearAllData = () => {
    setMijozlar([]); setProducts([]); setSotuvlar([]); setChiqimlar([]); setMasalliqlar([]); setTarix([]);
    localStorage.clear();
  };

  // --- MANTIQIY FUNKSIYALAR ---
  const masalliqMiqdoriniYangilash = (id, miqdor) => {
    setMasalliqlar(prev => prev.map(m => 
      m.id === id ? { ...m, miqdori: Number(m.miqdori || 0) + Number(miqdor) } : m
    ));
  };

  const mijozQoshish = (yangi) => setMijozlar(prev => [yangi, ...prev]);
  const mijozOchirish = (id) => setMijozlar(prev => prev.filter(m => m.id !== id));
  const mijozYangilash = (updated) => setMijozlar(prev => prev.map(m => m.id === updated.id ? updated : m));

  const sotuvQoshish = (yangiSotuv) => {
    setSotuvlar(prev => [yangiSotuv, ...prev]);
    if(yangiSotuv.mijozId) {
      setMijozlar(prev => prev.map(m => 
        m.id === yangiSotuv.mijozId ? { ...m, qarzdorlik: Number(m.qarzdorlik || 0) + Number(yangiSotuv.summa) } : m
      ));
    }
  };

  const sotuvOchirish = (id) => {
    const och = sotuvlar.find(s => s.id === id);
    if (och && och.mijozId) {
      setMijozlar(prev => prev.map(m => 
        m.id === och.mijozId ? { ...m, qarzdorlik: Math.max(0, Number(m.qarzdorlik || 0) - Number(och.summa)) } : m
      ));
    }
    setSotuvlar(prev => prev.filter(s => s.id !== id));
  };

  const chiqimQoshish = (yangiChiqim) => setChiqimlar(prev => [yangiChiqim, ...prev]);
  const chiqimOchirish = (id) => setChiqimlar(prev => prev.filter(c => c.id !== id));

  // --- HISOB-KITOBLAR ---
  const kolbasaJamiNarx = useMemo(() => products.reduce((sum, p) => sum + (Number(p.price || 0) * Number(p.stock || 0)), 0), [products]);
  const kolbasaJamiSoni = useMemo(() => products.reduce((sum, p) => sum + Number(p.stock || 0), 0), [products]);
  const jamiKirim = useMemo(() => sotuvlar.reduce((sum, s) => sum + Number(s.summa || 0), 0), [sotuvlar]);
  const jamiQarzlar = useMemo(() => mijozlar.reduce((sum, m) => sum + Number(m.qarzdorlik || 0), 0), [mijozlar]);
  const jamiChiqim = useMemo(() => chiqimlar.reduce((sum, c) => sum + Number(c.summa || 0), 0), [chiqimlar]);

  return (
    <DataContext.Provider value={{ 
      mijozlar, sotuvlar, chiqimlar, products, masalliqlar, tarix,
      mijozQoshish, mijozOchirish, mijozYangilash,
      sotuvQoshish, sotuvOchirish, chiqimQoshish, chiqimOchirish,
      setProducts, setSotuvlar, setMasalliqlar, setTarix,
      masalliqMiqdoriniYangilash,
      jamiKirim, jamiQarzlar, jamiChiqim, kolbasaJamiSoni, kolbasaJamiNarx,
      clearAllData 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);