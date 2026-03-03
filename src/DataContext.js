import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { supabase } from './api/supabaseClient'; 

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

    // --- STATES ---
    const [mijozlar, setMijozlar] = useState(getLocal('mijozlar', []));
    const [products, setProducts] = useState(getLocal('products', []));
    const [sotuvlar, setSotuvlar] = useState(getLocal('sotuvlar', []));
    const [chiqimlar, setChiqimlar] = useState(getLocal('chiqimlar', []));
    const [masalliqlar, setMasalliqlar] = useState(getLocal('masalliqlar', [])); 
    const [loading, setLoading] = useState(true);

    // --- DATA FETCHING (Barcha ma'lumotlarni bazadan olish) ---
    const fetchData = async () => {
        try {
            setLoading(true);
            const [mRes, sRes, pRes, cRes, masRes] = await Promise.all([
                supabase.from('mijozlar').select('*').order('id', { ascending: false }),
                supabase.from('sotuvlar').select('*').order('id', { ascending: false }),
                supabase.from('products').select('*').order('id', { ascending: false }),
                supabase.from('chiqimlar').select('*').order('id', { ascending: false }),
                supabase.from('masalliqlar').select('*').order('id', { ascending: false })
            ]);

            if (mRes.data) setMijozlar(mRes.data.map(m => ({ ...m, oxirgiXarid: m.oxirgixarid })));
            if (sRes.data) setSotuvlar(sRes.data.map(s => ({ ...s, mijozId: s.mijozid })));
            if (pRes.data) setProducts(pRes.data);
            if (cRes.data) setChiqimlar(cRes.data);
            if (masRes.data) setMasalliqlar(masRes.data); 
        } catch (err) {
            console.error("Yuklashda xato:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Ma'lumotlar o'zgarganda LocalStorage-ga sinxronlash
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('mijozlar', JSON.stringify(mijozlar));
            localStorage.setItem('products', JSON.stringify(products));
            localStorage.setItem('sotuvlar', JSON.stringify(sotuvlar));
            localStorage.setItem('chiqimlar', JSON.stringify(chiqimlar));
            localStorage.setItem('masalliqlar', JSON.stringify(masalliqlar));
        }
    }, [mijozlar, products, sotuvlar, chiqimlar, masalliqlar, loading]);

    // --- MIJOZLAR FUNKSIYALARI ---
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
        setSotuvlar(prev => prev.filter(s => s.mijozId !== id));
    };

    // --- SOTUVLAR & STOCK (OMBOR) FUNKSIYALARI ---
    const sotuvQoshish = async (yangiSotuv) => {
        const mahsulot = products.find(p => p.name.trim().toLowerCase() === yangiSotuv.mahsulot.trim().toLowerCase());
        if (!mahsulot) throw new Error(`"${yangiSotuv.mahsulot}" topilmadi!`);

        const joriyZaxira = Number(mahsulot.stock || 0);
        const sotuvMiqdori = Number(yangiSotuv.miqdor || 0);
        if (joriyZaxira < sotuvMiqdori) throw new Error(`Omborda yetarli qoldiq yo'q!`);

        const { data, error } = await supabase.from('sotuvlar').insert([{
            mijozid: yangiSotuv.mijozId,
            mahsulot: yangiSotuv.mahsulot,
            miqdor: yangiSotuv.miqdor,
            summa: yangiSotuv.summa,
            tulangan: yangiSotuv.tulangan,
            sana: yangiSotuv.sana
        }]).select();

        if (error) throw error;
        
        const yangiZaxira = Number((joriyZaxira - sotuvMiqdori).toFixed(2));
        await supabase.from('products').update({ stock: yangiZaxira }).eq('id', mahsulot.id);
        
        setProducts(prev => prev.map(p => p.id === mahsulot.id ? { ...p, stock: yangiZaxira } : p));
        setSotuvlar(prev => [{ ...data[0], mijozId: data[0].mijozid }, ...prev]);
    };

    const sotuvYangilash = async (updated) => {
        const eskiSotuv = sotuvlar.find(s => s.id === updated.id);
        const mahsulot = products.find(p => p.name === updated.mahsulot);

        if (mahsulot && eskiSotuv) {
            const farq = Number(updated.miqdor) - Number(eskiSotuv.miqdor);
            const yangiStock = Number((Number(mahsulot.stock) - farq).toFixed(2));
            
            await supabase.from('products').update({ stock: yangiStock }).eq('id', mahsulot.id);
            setProducts(prev => prev.map(p => p.id === mahsulot.id ? { ...p, stock: yangiStock } : p));
        }

        const { error } = await supabase.from('sotuvlar').update({
            mijozid: updated.mijozId,
            mahsulot: updated.mahsulot,
            miqdor: updated.miqdor,
            summa: updated.summa,
            tulangan: updated.tulangan,
            sana: updated.sana
        }).eq('id', updated.id);

        if (error) throw error;
        setSotuvlar(prev => prev.map(s => s.id === updated.id ? updated : s));
    };

    const sotuvOchirish = async (id) => {
        const ochilayotganSotuv = sotuvlar.find(s => s.id === id);
        const mahsulot = products.find(p => p.name === ochilayotganSotuv?.mahsulot);

        if (mahsulot && ochilayotganSotuv) {
            const qaytganStock = Number((Number(mahsulot.stock) + Number(ochilayotganSotuv.miqdor)).toFixed(2));
            await supabase.from('products').update({ stock: qaytganStock }).eq('id', mahsulot.id);
            setProducts(prev => prev.map(p => p.id === mahsulot.id ? { ...p, stock: qaytganStock } : p));
        }

        const { error } = await supabase.from('sotuvlar').delete().eq('id', id);
        if (error) throw error;
        setSotuvlar(prev => prev.filter(s => s.id !== id));
    };

    // --- MASALLIQLAR & CHIQIMLAR FUNKSIYALARI ---
    const masalliqQoshish = async (yangi) => {
        const { data, error } = await supabase.from('masalliqlar').insert([yangi]).select();
        if (error) throw error;
        setMasalliqlar(prev => [data[0], ...prev]);
    };

    const chiqimQoshish = async (y) => {
        const { data, error } = await supabase.from('chiqimlar').insert([y]).select();
        if (error) throw error;
        setChiqimlar(prev => [data[0], ...prev]);
    };

    const productQoshish = async (yangi) => {
        const { data, error } = await supabase.from('products').insert([yangi]).select();
        if (error) throw error;
        setProducts(prev => [data[0], ...prev]);
    };

    const clearAllData = async () => {
        if (window.confirm("Barcha ma'lumotlar o'chib ketadi!")) {
            await Promise.all([
                supabase.from('sotuvlar').delete().gt('id', 0),
                supabase.from('mijozlar').delete().gt('id', 0),
                supabase.from('products').delete().gt('id', 0),
                supabase.from('chiqimlar').delete().gt('id', 0),
                supabase.from('masalliqlar').delete().gt('id', 0)
            ]);
            window.location.reload();
        }
    };

    // --- MOLIYAVIY HISOB-KITOB (REAL-TIME) ---
    
    // 1. Jami tushgan naqd pul (Kirim)
    const jamiKirim = useMemo(() => {
        return sotuvlar.reduce((sum, s) => sum + parseFloat(s.tulangan || 0), 0);
    }, [sotuvlar]);

    // 2. Jami harajatlar (Chiqim + Tasdiqlanmagan masalliqlar)
    const jamiChiqim = useMemo(() => {
        const x = chiqimlar.reduce((sum, c) => sum + parseFloat(c.summa || 0), 0);
        const m = masalliqlar.reduce((sum, mas) => sum + (parseFloat(mas.narxi || 0) * parseFloat(mas.miqdori || 0)), 0);
        return x + m;
    }, [chiqimlar, masalliqlar]);

    // 3. Bozordagi jami qarzlarimiz
    const jamiQarzlar = useMemo(() => {
        return mijozlar.reduce((sum, m) => sum + parseFloat(m.qarzdorlik || 0), 0);
    }, [mijozlar]);

    // 4. SOF FOYDA (Kirim - Chiqim)
    const sofFoyda = useMemo(() => {
        return jamiKirim - jamiChiqim;
    }, [jamiKirim, jamiChiqim]);

    return (
        <DataContext.Provider value={{
            mijozlar, products, sotuvlar, chiqimlar, masalliqlar, loading,
            setProducts, setMasalliqlar, setChiqimlar, fetchData,
            mijozQoshish, mijozOchirish, mijozYangilash,
            productQoshish, masalliqQoshish, sotuvQoshish, sotuvYangilash, sotuvOchirish,
            chiqimQoshish, clearAllData,
            jamiKirim, jamiChiqim, jamiQarzlar, sofFoyda,
            supabase // Masalliqlar sahifasida to'g'ridan-to'g'ri ishlatish uchun
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);