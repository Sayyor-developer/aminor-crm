import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    // LocalStorage dan ma'lumotlarni o'qish funksiyasi
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
        if(window.confirm("DIQQAT! Barcha ma'lumotlar butunlay o'chirib tashlansinmi?")) {
            setMijozlar([]); 
            setProducts([]); 
            setSotuvlar([]); 
            setChiqimlar([]); 
            setMasalliqlar([]); 
            setTarix([]);
            localStorage.clear();
        }
    };

    // --- 1. MIJOZLAR MANTIQI ---
    const mijozQoshish = (yangi) => setMijozlar(prev => [yangi, ...prev]);
    
    const mijozOchirish = (id) => {
        setMijozlar(prev => prev.filter(m => m.id !== id));
        setSotuvlar(prev => prev.filter(s => s.mijozId !== id));
    };

    const mijozYangilash = (updated) => {
        setMijozlar(prev => prev.map(m => m.id === updated.id ? updated : m));
    };

    // --- 2. SOTUV MANTIQI (DIQQAT: TUZATILDI) ---
    /**
     * Mijozlar.jsx sahifasida handleSotuvBajarish funksiyasi 
     * allaqachon setProducts va mijozYangilash-ni bajaradi.
     * Shuning uchun sotuvQoshish faqat ro'yxatni yangilashi kerak.
     */
    const sotuvQoshish = (yangiSotuv) => {
        setSotuvlar(prev => [yangiSotuv, ...prev]);
    };

    const sotuvOchirish = (id) => {
        const ochilayotganSotuv = sotuvlar.find(s => s.id === id);
        
        if (ochilayotganSotuv) {
            // A) Mijoz qarzidan qayta ayirish
            if (ochilayotganSotuv.mijozId) {
                setMijozlar(prev => prev.map(m => 
                    m.id === ochilayotganSotuv.mijozId ? 
                    { 
                        ...m, 
                        qarzdorlik: Number((parseFloat(m.qarzdorlik || 0) - parseFloat(ochilayotganSotuv.summa)).toFixed(2)) 
                    } : m
                ));
            }
            // B) OMBORGA QAYTARISH (Sotuv bekor bo'lsa mahsulot qaytadi)
            setProducts(prev => prev.map(p => 
                p.name === ochilayotganSotuv.mahsulot ? 
                { 
                    ...p, 
                    stock: Number((parseFloat(p.stock || 0) + parseFloat(ochilayotganSotuv.miqdor)).toFixed(2)) 
                } : p
            ));
        }
        setSotuvlar(prev => prev.filter(s => s.id !== id));
    };

    // --- 3. MASALLIQ VA CHIQIM MANTIQI ---
    const masalliqMiqdoriniYangilash = (id, miqdor) => {
        setMasalliqlar(prev => prev.map(m => 
            m.id === id ? { ...m, miqdori: Number((parseFloat(m.miqdori || 0) + parseFloat(miqdor)).toFixed(2)) } : m
        ));
    };

    const chiqimQoshish = (yangiChiqim) => setChiqimlar(prev => [yangiChiqim, ...prev]);
    const chiqimOchirish = (id) => setChiqimlar(prev => prev.filter(c => c.id !== id));

    // --- 4. GLOBAL HISOB-KITOBLAR ---
    const jamiKirim = useMemo(() => {
        return sotuvlar.reduce((sum, s) => sum + parseFloat(s.summa || 0), 0);
    }, [sotuvlar]);

    const jamiQarzlar = useMemo(() => {
        return mijozlar.reduce((sum, m) => sum + parseFloat(m.qarzdorlik || 0), 0);
    }, [mijozlar]);

    const jamiChiqim = useMemo(() => {
        return chiqimlar.reduce((sum, c) => sum + parseFloat(c.summa || 0), 0);
    }, [chiqimlar]);

    const kolbasaJamiNarx = useMemo(() => {
        return products.reduce((sum, p) => sum + (parseFloat(p.price || 0) * parseFloat(p.stock || 0)), 0);
    }, [products]);

    const kolbasaJamiSoni = useMemo(() => {
        return products.reduce((sum, p) => sum + parseFloat(p.stock || 0), 0);
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