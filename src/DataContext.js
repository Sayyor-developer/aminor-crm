import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    // LocalStorage dan ma'lumotlarni xavfsiz o'qish funksiyasi
    const getLocal = (key, initial) => {
        const saved = localStorage.getItem(key);
        try {
            return saved ? JSON.parse(saved) : initial;
        } catch (e) {
            console.error(`Error parsing localStorage key "${key}":`, e);
            return initial;
        }
    };

    // --- STATE'LAR ---
    const [mijozlar, setMijozlar] = useState(getLocal('mijozlar', []));
    const [products, setProducts] = useState(getLocal('products', []));
    const [sotuvlar, setSotuvlar] = useState(getLocal('sotuvlar', []));
    const [chiqimlar, setChiqimlar] = useState(getLocal('chiqimlar', []));
    const [masalliqlar, setMasalliqlar] = useState(getLocal('masalliqlar', []));
    const [tarix, setTarix] = useState(getLocal('kirim_tarixi', []));
    const [tannarxlar, setTannarxlar] = useState(getLocal('tannarxlar', []));

    // --- LOCALSTORAGE GA SAQLASH ---
    useEffect(() => {
        localStorage.setItem('mijozlar', JSON.stringify(mijozlar));
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('sotuvlar', JSON.stringify(sotuvlar));
        localStorage.setItem('chiqimlar', JSON.stringify(chiqimlar));
        localStorage.setItem('masalliqlar', JSON.stringify(masalliqlar));
        localStorage.setItem('kirim_tarixi', JSON.stringify(tarix));
        localStorage.setItem('tannarxlar', JSON.stringify(tannarxlar));
    }, [mijozlar, products, sotuvlar, chiqimlar, masalliqlar, tarix, tannarxlar]);

    // Ma'lumotlarni tozalash
    const clearAllData = () => {
        if (window.confirm("DIQQAT! Barcha ma'lumotlar butunlay o'chirib tashlansinmi?")) {
            setMijozlar([]); 
            setProducts([]); 
            setSotuvlar([]); 
            setChiqimlar([]); 
            setMasalliqlar([]); 
            setTarix([]);
            setTannarxlar([]);
            localStorage.clear();
        }
    };

    // --- MIJOZLAR FUNKSIYALARI ---
    const mijozQoshish = (yangi) => setMijozlar(prev => [yangi, ...prev]);
    
    const mijozOchirish = (id) => {
        setMijozlar(prev => prev.filter(m => m.id !== id));
        setSotuvlar(prev => prev.filter(s => s.mijozId !== id));
    };
    
    const mijozYangilash = (updated) => setMijozlar(prev => prev.map(m => m.id === updated.id ? updated : m));

    // --- SOTUV FUNKSIYALARI ---
    const sotuvQoshish = (yangiSotuv) => setSotuvlar(prev => [yangiSotuv, ...prev]);
    
    const sotuvYangilash = (updated) => setSotuvlar(prev => prev.map(s => s.id === updated.id ? updated : s));

    const sotuvOchirish = (id) => {
        const ochilayotganSotuv = sotuvlar.find(s => s.id === id);
        if (ochilayotganSotuv) {
            if (ochilayotganSotuv.mijozId) {
                const qolganQarz = parseFloat(ochilayotganSotuv.summa) - parseFloat(ochilayotganSotuv.tulangan || 0);
                setMijozlar(prev => prev.map(m => m.id === ochilayotganSotuv.mijozId ? 
                    { ...m, qarzdorlik: Number((parseFloat(m.qarzdorlik || 0) - qolganQarz).toFixed(2)) } : m
                ));
            }
            setProducts(prev => prev.map(p => p.name === ochilayotganSotuv.mahsulot ? 
                { ...p, stock: Number((parseFloat(p.stock || 0) + parseFloat(ochilayotganSotuv.miqdor)).toFixed(2)) } : p
            ));
        }
        setSotuvlar(prev => prev.filter(s => s.id !== id));
    };

    // --- CHIQIM FUNKSIYALARI ---
    const chiqimQoshish = (yangiChiqim) => setChiqimlar(prev => [yangiChiqim, ...prev]);
    const chiqimOchirish = (id) => setChiqimlar(prev => prev.filter(c => c.id !== id));

    // --- MASALLIQLAR FUNKSIYALARI ---
    const masalliqMiqdoriniYangilash = (id, miqdor) => {
        setMasalliqlar(prev => prev.map(m => m.id === id ? 
            { ...m, miqdori: Number((parseFloat(m.miqdori || 0) + parseFloat(miqdor)).toFixed(2)) } : m
        ));
    };

    // --- GLOBAL STATISTIKA ---
    
    // Jami Kirim: Haqiqatda kassaga kirgan pul
    const jamiKirim = useMemo(() => {
        return sotuvlar.reduce((sum, s) => sum + parseFloat(s.tulangan || 0), 0);
    }, [sotuvlar]);

    // Jami Chiqim: Barcha turdagi xarajatlar (Masalliqlar, tovuq chiqimi va boshqalar)
    const jamiChiqim = useMemo(() => {
        return chiqimlar.reduce((sum, c) => sum + parseFloat(c.summa || 0), 0);
    }, [chiqimlar]);

    // Jami Qarzlar
    const jamiQarzlar = useMemo(() => {
        return mijozlar.reduce((sum, m) => sum + parseFloat(m.qarzdorlik || 0), 0);
    }, [mijozlar]);

    // Haqiqiy Sof Foyda = Jami Kirim - Jami Chiqim
    const sofFoyda = useMemo(() => {
        return jamiKirim - jamiChiqim;
    }, [jamiKirim, jamiChiqim]);

    return (
        <DataContext.Provider value={{
            mijozlar, products, sotuvlar, chiqimlar, masalliqlar, tarix, tannarxlar,
            setMijozlar, setProducts, setSotuvlar, setChiqimlar, setMasalliqlar, setTarix, setTannarxlar,
            mijozQoshish, mijozOchirish, mijozYangilash,
            sotuvQoshish, sotuvOchirish, sotuvYangilash,
            chiqimQoshish, chiqimOchirish,
            masalliqMiqdoriniYangilash,
            jamiKirim, jamiChiqim, jamiQarzlar, sofFoyda, clearAllData
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};