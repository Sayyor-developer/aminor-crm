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

    const [mijozlar, setMijozlar] = useState(getLocal('mijozlar', []));
    const [products, setProducts] = useState(getLocal('products', []));
    const [sotuvlar, setSotuvlar] = useState(getLocal('sotuvlar', []));
    const [chiqimlar, setChiqimlar] = useState(getLocal('chiqimlar', []));
    const [masalliqlar, setMasalliqlar] = useState(getLocal('masalliqlar', []));
    const [tarix, setTarix] = useState(getLocal('kirim_tarixi', []));

    useEffect(() => {
        localStorage.setItem('mijozlar', JSON.stringify(mijozlar));
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('sotuvlar', JSON.stringify(sotuvlar));
        localStorage.setItem('chiqimlar', JSON.stringify(chiqimlar));
        localStorage.setItem('masalliqlar', JSON.stringify(masalliqlar));
        localStorage.setItem('kirim_tarixi', JSON.stringify(tarix));
    }, [mijozlar, products, sotuvlar, chiqimlar, masalliqlar, tarix]);

    const clearAllData = () => {
        if (window.confirm("DIQQAT! Barcha ma'lumotlar butunlay o'chirib tashlansinmi?")) {
            setMijozlar([]); setProducts([]); setSotuvlar([]); setChiqimlar([]); setMasalliqlar([]); setTarix([]);
            localStorage.clear();
        }
    };

    const mijozQoshish = (yangi) => setMijozlar(prev => [yangi, ...prev]);
    const mijozOchirish = (id) => {
        setMijozlar(prev => prev.filter(m => m.id !== id));
        setSotuvlar(prev => prev.filter(s => s.mijozId !== id));
    };
    const mijozYangilash = (updated) => setMijozlar(prev => prev.map(m => m.id === updated.id ? updated : m));

    const sotuvQoshish = (yangiSotuv) => setSotuvlar(prev => [yangiSotuv, ...prev]);
    
    // --- YANGI QO'SHILGAN FUNKSIYA ---
    const sotuvYangilash = (updated) => {
        setSotuvlar(prev => prev.map(s => s.id === updated.id ? updated : s));
    };

    const sotuvOchirish = (id) => {
        const ochilayotganSotuv = sotuvlar.find(s => s.id === id);
        if (ochilayotganSotuv) {
            if (ochilayotganSotuv.mijozId) {
                setMijozlar(prev => prev.map(m => m.id === ochilayotganSotuv.mijozId ? 
                    { ...m, qarzdorlik: Number((parseFloat(m.qarzdorlik || 0) - parseFloat(ochilayotganSotuv.summa)).toFixed(2)) } : m
                ));
            }
            setProducts(prev => prev.map(p => p.name === ochilayotganSotuv.mahsulot ? 
                { ...p, stock: Number((parseFloat(p.stock || 0) + parseFloat(ochilayotganSotuv.miqdor)).toFixed(2)) } : p
            ));
        }
        setSotuvlar(prev => prev.filter(s => s.id !== id));
    };

    const masalliqMiqdoriniYangilash = (id, miqdor) => {
        setMasalliqlar(prev => prev.map(m => m.id === id ? { ...m, miqdori: Number((parseFloat(m.miqdori || 0) + parseFloat(miqdor)).toFixed(2)) } : m));
    };

    const jamiKirim = useMemo(() => sotuvlar.reduce((sum, s) => sum + parseFloat(s.summa || 0), 0), [sotuvlar]);
    const jamiQarzlar = useMemo(() => mijozlar.reduce((sum, m) => sum + parseFloat(m.qarzdorlik || 0), 0), [mijozlar]);

    return (
        <DataContext.Provider value={{
            mijozlar, sotuvlar, chiqimlar, products, masalliqlar, tarix,
            mijozQoshish, mijozOchirish, mijozYangilash,
            sotuvQoshish, sotuvOchirish, sotuvYangilash, // <-- Providerga qo'shildi
            setProducts, setSotuvlar, setMasalliqlar, setTarix,
            masalliqMiqdoriniYangilash,
            jamiKirim, jamiQarzlar, clearAllData
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);