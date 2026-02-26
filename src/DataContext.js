import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { supabase } from './api/supabaseClient'; 

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const getLocal = (key, initial) => {
        const saved = localStorage.getItem(key);
        try {
            return saved ? JSON.parse(saved) : initial;
        } catch (e) {
            console.error(`Error parsing localStorage key "${key}":`, e);
            return initial;
        }
    };

    // --- STATES ---
    const [mijozlar, setMijozlar] = useState(getLocal('mijozlar', []));
    const [products, setProducts] = useState(getLocal('products', []));
    const [sotuvlar, setSotuvlar] = useState(getLocal('sotuvlar', []));
    const [chiqimlar, setChiqimlar] = useState(getLocal('chiqimlar', []));
    const [masalliqlar, setMasalliqlar] = useState(getLocal('masalliqlar', [])); 
    const [loading, setLoading] = useState(true);

    // --- DATA FETCHING ---
    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: mData } = await supabase.from('mijozlar').select('*').order('id', { ascending: false });
            const { data: sData } = await supabase.from('sotuvlar').select('*').order('id', { ascending: false });
            const { data: pData } = await supabase.from('products').select('*').order('id', { ascending: false });
            const { data: cData } = await supabase.from('chiqimlar').select('*').order('id', { ascending: false });
            const { data: masData } = await supabase.from('masalliqlar').select('*').order('id', { ascending: false });

            if (mData) setMijozlar(mData.map(m => ({ ...m, oxirgiXarid: m.oxirgixarid })));
            if (sData) setSotuvlar(sData.map(s => ({ ...s, mijozId: s.mijozid })));
            if (pData) setProducts(pData);
            if (cData) setChiqimlar(cData);
            if (masData) setMasalliqlar(masData); 
        } catch (err) {
            console.error("Ma'lumotlarni yuklashda xato:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // LocalStorage sinxronizatsiyasi
    useEffect(() => {
        localStorage.setItem('mijozlar', JSON.stringify(mijozlar));
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('sotuvlar', JSON.stringify(sotuvlar));
        localStorage.setItem('chiqimlar', JSON.stringify(chiqimlar));
        localStorage.setItem('masalliqlar', JSON.stringify(masalliqlar));
    }, [mijozlar, products, sotuvlar, chiqimlar, masalliqlar]);

    // --- CHIQIM QOSHISH ---
    const chiqimQoshish = async (yangiChiqim) => {
        try {
            const { data, error } = await supabase
                .from('chiqimlar')
                .insert([{
                    turi: yangiChiqim.turi,
                    manbaa: yangiChiqim.manbaa,
                    summa: parseFloat(yangiChiqim.summa),
                    sana: yangiChiqim.sana
                }])
                .select();

            if (error) throw error;
            if (data) {
                setChiqimlar(prev => [data[0], ...prev]);
                return data[0];
            }
        } catch (err) {
            console.error("Chiqim qo'shishda xato:", err.message);
            throw err;
        }
    };

    // --- MASALLIQLAR ---
    const masalliqQoshish = async (yangi) => {
        try {
            const toBase = {
                nomi: yangi.nomi,
                miqdori: parseFloat(yangi.miqdori || 0),
                birlik: yangi.birlik || 'kg',
                narxi: parseFloat(yangi.narxi || 0)
            };
            const { data, error } = await supabase.from('masalliqlar').insert([toBase]).select();
            if (error) throw error;
            if (data) {
                setMasalliqlar(prev => [data[0], ...prev]);
                return data[0];
            }
        } catch (err) {
            console.error("Masalliq qo'shishda xato:", err.message);
        }
    };

    const masalliqOchirish = async (id) => {
        try {
            const { error } = await supabase.from('masalliqlar').delete().eq('id', id);
            if (error) throw error;
            setMasalliqlar(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            alert("O'chirishda xato: " + err.message);
        }
    };

    // --- MAHSULOTLAR ---
    const productQoshish = async (yangiMahsulot) => {
        try {
            const { data, error } = await supabase.from('products').insert([yangiMahsulot]).select();
            if (error) throw error;
            if (data) {
                setProducts(prev => [data[0], ...prev]);
                return data[0];
            }
        } catch (err) {
            throw new Error(err.message);
        }
    };

    // --- MIJOZLAR ---
    const mijozQoshish = async (yangi) => {
        const { data, error } = await supabase.from('mijozlar').insert([yangi]).select();
        if (error) throw error;
        setMijozlar(prev => [{ ...data[0], oxirgiXarid: data[0].oxirgixarid }, ...prev]);
    };

    const mijozYangilash = async (updated) => {
        const toBase = { 
            ism: updated.ism, 
            telefon: updated.telefon, 
            qarzdorlik: updated.qarzdorlik,
            oxirgixarid: updated.oxirgiXarid 
        };
        const { error } = await supabase.from('mijozlar').update(toBase).eq('id', updated.id);
        if (error) throw error;
        setMijozlar(prev => prev.map(m => m.id === updated.id ? updated : m));
    };

    const mijozOchirish = async (id) => {
        const { error } = await supabase.from('mijozlar').delete().eq('id', id);
        if (error) throw error;
        setMijozlar(prev => prev.filter(m => m.id !== id));
    };

    // --- SOTUVLAR (YANGILASH VA OCHIRISH QO'SHILDI) ---
    const sotuvQoshish = async (yangiSotuv) => {
        try {
            const mahsulot = products.find(p => p.name.trim().toLowerCase() === yangiSotuv.mahsulot.trim().toLowerCase());
            if (!mahsulot) throw new Error(`"${yangiSotuv.mahsulot}" topilmadi!`);

            const joriyZaxira = Number(mahsulot.stock || 0);
            const sotuvMiqdori = Number(yangiSotuv.miqdor || 0);
            if (joriyZaxira < sotuvMiqdori) throw new Error(`Omborda yetarli qoldiq yo'q!`);

            const toBaseSotuv = {
                mijozid: yangiSotuv.mijozId,
                mahsulot: yangiSotuv.mahsulot,
                miqdor: yangiSotuv.miqdor,
                summa: yangiSotuv.summa,
                tulangan: yangiSotuv.tulangan,
                sana: yangiSotuv.sana
            };

            const { data, error } = await supabase.from('sotuvlar').insert([toBaseSotuv]).select();
            if (error) throw error;
            
            if (data) {
                const yangiZaxira = Number((joriyZaxira - sotuvMiqdori).toFixed(2));
                await supabase.from('products').update({ stock: yangiZaxira }).eq('id', mahsulot.id);
                setProducts(prev => prev.map(p => p.id === mahsulot.id ? { ...p, stock: yangiZaxira } : p));
                const formatlanganSotuv = { ...data[0], mijozId: data[0].mijozid };
                setSotuvlar(prev => [formatlanganSotuv, ...prev]);
                return formatlanganSotuv;
            }
        } catch (err) {
            alert("Sotuvda xato: " + err.message);
            throw err;
        }
    };

    const sotuvYangilash = async (updated) => {
        try {
            const toBase = {
                mijozid: updated.mijozId,
                mahsulot: updated.mahsulot,
                miqdor: updated.miqdor,
                summa: updated.summa,
                tulangan: updated.tulangan,
                sana: updated.sana
            };
            const { error } = await supabase.from('sotuvlar').update(toBase).eq('id', updated.id);
            if (error) throw error;
            setSotuvlar(prev => prev.map(s => s.id === updated.id ? updated : s));
        } catch (err) {
            console.error("Sotuvni yangilashda xato:", err.message);
        }
    };

    const sotuvOchirish = async (id) => {
        try {
            const { error } = await supabase.from('sotuvlar').delete().eq('id', id);
            if (error) throw error;
            setSotuvlar(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error("Sotuvni o'chirishda xato:", err.message);
        }
    };

    // --- TOZALASH ---
    const clearAllData = async () => {
        if (window.confirm("DIQQAT! Barcha ma'lumotlar o'chib ketadi. Rozimisiz?")) {
            try {
                setLoading(true);
                await Promise.all([
                    supabase.from('sotuvlar').delete().gt('id', 0),
                    supabase.from('mijozlar').delete().gt('id', 0),
                    supabase.from('products').delete().gt('id', 0),
                    supabase.from('chiqimlar').delete().gt('id', 0),
                    supabase.from('masalliqlar').delete().gt('id', 0)
                ]);
                
                setMijozlar([]);
                setProducts([]);
                setSotuvlar([]);
                setChiqimlar([]);
                setMasalliqlar([]);
                localStorage.clear();
                alert("Barcha ma'lumotlar o'chirildi!");
            } catch (err) {
                alert("Xatolik: " + err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    // --- CALCULATIONS ---
    const jamiKirim = useMemo(() => sotuvlar.reduce((sum, s) => sum + parseFloat(s.tulangan || 0), 0), [sotuvlar]);
    
    const jamiChiqim = useMemo(() => {
        const xarajatlar = chiqimlar.reduce((sum, c) => sum + parseFloat(c.summa || 0), 0);
        const masalliqXarajat = masalliqlar.reduce((sum, m) => sum + (parseFloat(m.narxi || 0) * parseFloat(m.miqdori || 1)), 0);
        return xarajatlar + masalliqXarajat;
    }, [chiqimlar, masalliqlar]);
    
    const jamiQarzlar = useMemo(() => mijozlar.reduce((sum, m) => sum + parseFloat(m.qarzdorlik || 0), 0), [mijozlar]);
    const sofFoyda = useMemo(() => jamiKirim - jamiChiqim, [jamiKirim, jamiChiqim]);

    return (
        <DataContext.Provider value={{
            mijozlar, products, sotuvlar, chiqimlar, masalliqlar, loading, supabase,
            setMijozlar, setProducts, setSotuvlar, setChiqimlar, setMasalliqlar,
            mijozQoshish, mijozOchirish, mijozYangilash,
            productQoshish,
            masalliqQoshish, masalliqOchirish,
            sotuvQoshish, sotuvYangilash, sotuvOchirish, // <-- ENDI BU FUNKSIYALAR MAVJUD
            chiqimQoshish,
            clearAllData, fetchData, jamiKirim, jamiChiqim, jamiQarzlar, sofFoyda
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);