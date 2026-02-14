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

    // --- LOCALSTORAGE BILAN SINXRONIZATSIYA ---
    useEffect(() => {
        localStorage.setItem('mijozlar', JSON.stringify(mijozlar));
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('sotuvlar', JSON.stringify(sotuvlar));
        localStorage.setItem('chiqimlar', JSON.stringify(chiqimlar));
        localStorage.setItem('masalliqlar', JSON.stringify(masalliqlar));
        localStorage.setItem('kirim_tarixi', JSON.stringify(tarix));
    }, [mijozlar, products, sotuvlar, chiqimlar, masalliqlar, tarix]);

    // Barcha ma'lumotlarni tozalash
    const clearAllData = () => {
        if(window.confirm("Barcha ma'lumotlar o'chirib tashlansinmi?")) {
            setMijozlar([]); setProducts([]); setSotuvlar([]); 
            setChiqimlar([]); setMasalliqlar([]); setTarix([]);
            localStorage.clear();
        }
    };

    // --- MANTIQIY FUNKSIYALAR ---
    
    // 1. Mijozlar mantiqi
    const mijozQoshish = (yangi) => setMijozlar(prev => [yangi, ...prev]);
    
    const mijozOchirish = (id) => {
        // Mijoz o'chganda uning hamma izi (sotuvlari) ham o'chishi shart
        setMijozlar(prev => prev.filter(m => m.id !== id));
        setSotuvlar(prev => prev.filter(s => s.mijozId !== id));
    };

    const mijozYangilash = (updated) => setMijozlar(prev => prev.map(m => m.id === updated.id ? updated : m));

    // 2. Sotuvlar mantiqi
    const sotuvQoshish = (yangiSotuv) => {
        setSotuvlar(prev => [yangiSotuv, ...prev]);
        if(yangiSotuv.mijozId) {
            setMijozlar(prev => prev.map(m => 
                m.id === yangiSotuv.mijozId ? 
                { ...m, qarzdorlik: Number(m.qarzdorlik || 0) + Number(yangiSotuv.summa) } : m
            ));
        }
    };

    const sotuvOchirish = (id) => {
        const ochilayotganSotuv = sotuvlar.find(s => s.id === id);
        if (ochilayotganSotuv && ochilayotganSotuv.mijozId) {
            setMijozlar(prev => prev.map(m => 
                m.id === ochilayotganSotuv.mijozId ? 
                { ...m, qarzdorlik: Math.max(0, Number(m.qarzdorlik || 0) - Number(ochilayotganSotuv.summa)) } : m
            ));
        }
        setSotuvlar(prev => prev.filter(s => s.id !== id));
    };

    // 3. Masalliq va Chiqim
    const masalliqMiqdoriniYangilash = (id, miqdor) => {
        setMasalliqlar(prev => prev.map(m => 
            m.id === id ? { ...m, miqdori: Number(m.miqdori || 0) + Number(miqdor) } : m
        ));
    };

    const chiqimQoshish = (yangiChiqim) => setChiqimlar(prev => [yangiChiqim, ...prev]);
    const chiqimOchirish = (id) => setChiqimlar(prev => prev.filter(c => c.id !== id));

    // --- GLOBAL HISOB-KITOBLAR (HOME UCHUN STATISTIKA) ---
    // 
    
    const jamiKirim = useMemo(() => {
        return sotuvlar.reduce((sum, s) => sum + Number(s.summa || 0), 0);
    }, [sotuvlar]);

    const jamiQarzlar = useMemo(() => {
        return mijozlar.reduce((sum, m) => sum + Number(m.qarzdorlik || 0), 0);
    }, [mijozlar]);

    const jamiChiqim = useMemo(() => {
        return chiqimlar.reduce((sum, c) => sum + Number(c.summa || 0), 0);
    }, [chiqimlar]);

    const kolbasaJamiNarx = useMemo(() => {
        return products.reduce((sum, p) => sum + (Number(p.price || 0) * Number(p.stock || 0)), 0);
    }, [products]);

    const kolbasaJamiSoni = useMemo(() => {
        return products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
    }, [products]);

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