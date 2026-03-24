import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { supabase } from './api/supabaseClient'; 

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    // LocalStorage-dan ma'lumotni xavfsiz o'qish funksiyasi
    const getLocal = (key, initial) => {
        const saved = localStorage.getItem(key);
        try {
            return saved ? JSON.parse(saved) : initial;
        } catch (e) {
            return initial;
        }
    };

    // --- BARCHA STATE-LAR ---
    const [mijozlar, setMijozlar] = useState(getLocal('mijozlar', []));
    const [products, setProducts] = useState(getLocal('products', []));
    const [sotuvlar, setSotuvlar] = useState(getLocal('sotuvlar', []));
    const [chiqimlar, setChiqimlar] = useState(getLocal('chiqimlar', []));
    const [masalliqlar, setMasalliqlar] = useState(getLocal('masalliqlar', [])); 
    const [tannarxlar, setTannarxlar] = useState(getLocal('tannarxlar', []));
    const [xarajatlar, setXarajatlar] = useState(getLocal('xarajatlar', [])); 
    const [loading, setLoading] = useState(true);

    // --- MA'LUMOTLARNI SUPABASE-DAN YUKLASH ---
    const fetchData = async () => {
        try {
            setLoading(true);
            const [mRes, sRes, pRes, cRes, masRes, tRes, xRes] = await Promise.all([
                supabase.from('mijozlar').select('*').order('id', { ascending: false }),
                supabase.from('sotuvlar').select('*').order('id', { ascending: false }),
                supabase.from('products').select('*').order('id', { ascending: false }),
                supabase.from('chiqimlar').select('*').order('id', { ascending: false }),
                supabase.from('masalliqlar').select('*').order('id', { ascending: false }),
                supabase.from('tannarxlar').select('*').order('id', { ascending: false }),
                supabase.from('xarajatlar').select('*').order('id', { ascending: false }) 
            ]);

            if (mRes.data) setMijozlar(mRes.data.map(m => ({ ...m, oxirgiXarid: m.oxirgixarid })));
            if (sRes.data) setSotuvlar(sRes.data.map(s => ({ ...s, mijozId: s.mijozid })));
            if (pRes.data) setProducts(pRes.data);
            if (cRes.data) setChiqimlar(cRes.data);
            if (masRes.data) setMasalliqlar(masRes.data); 
            if (tRes.data) setTannarxlar(tRes.data);
            if (xRes.data) setXarajatlar(xRes.data);
        } catch (err) {
            console.error("Ma'lumotlarni yuklashda xatolik:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- LOCALSTORAGE SINXRONIZATSIYASI ---
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('mijozlar', JSON.stringify(mijozlar));
            localStorage.setItem('products', JSON.stringify(products));
            localStorage.setItem('sotuvlar', JSON.stringify(sotuvlar));
            localStorage.setItem('chiqimlar', JSON.stringify(chiqimlar));
            localStorage.setItem('masalliqlar', JSON.stringify(masalliqlar));
            localStorage.setItem('tannarxlar', JSON.stringify(tannarxlar));
            localStorage.setItem('xarajatlar', JSON.stringify(xarajatlar));
        }
    }, [mijozlar, products, sotuvlar, chiqimlar, masalliqlar, tannarxlar, xarajatlar, loading]);

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

    // --- MAHSULOTLAR (PRODUCTS) FUNKSIYALARI ---
    const productQoshish = async (yangi) => {
        const { data, error } = await supabase.from('products').insert([yangi]).select();
        if (error) throw error;
        setProducts(prev => [data[0], ...prev]);
    };

    const productYangilash = async (p) => {
        const { error } = await supabase.from('products').update({
            name: p.name, price: p.price, stock: p.stock, category: p.category
        }).eq('id', p.id);
        if (error) throw error;
        setProducts(prev => prev.map(x => x.id === p.id ? p : x));
    };

    // --- SOTUVLAR & OMBOR (STOCK) FUNKSIYALARI ---
    const sotuvQoshish = async (yangiSotuv) => {
        const mahsulot = products.find(p => p.name.trim().toLowerCase() === yangiSotuv.mahsulot.trim().toLowerCase());
        if (!mahsulot) throw new Error(`"${yangiSotuv.mahsulot}" topilmadi!`);

        const joriyZaxira = Number(mahsulot.stock || 0);
        const sotuvMiqdori = Number(yangiSotuv.miqdor || 0);
        if (joriyZaxira < sotuvMiqdori) throw new Error(`Omborda yetarli qoldiq yo'q!`);

        const { data, error } = await supabase.from('sotuvlar').insert([{
            mijozid: yangiSotuv.mijozId, mahsulot: yangiSotuv.mahsulot, miqdor: yangiSotuv.miqdor,
            summa: yangiSotuv.summa, tulangan: yangiSotuv.tulangan, sana: yangiSotuv.sana
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
            mijozid: updated.mijozId, mahsulot: updated.mahsulot, miqdor: updated.miqdor,
            summa: updated.summa, tulangan: updated.tulangan, sana: updated.sana
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

    // --- XARAJATLAR FUNKSIYALARI ---
    const xarajatQoshish = async (yangi) => {
        const { data, error } = await supabase.from('xarajatlar').insert([yangi]).select();
        if (error) throw error;
        setXarajatlar(prev => [data[0], ...prev]);
    };

    const xarajatYangilash = async (updated) => {
        const { error } = await supabase.from('xarajatlar').update({
            nomi: updated.nomi,
            summa: Number(updated.summa),
            sana: updated.sana
        }).eq('id', updated.id);
        if (error) throw error;
        setXarajatlar(prev => prev.map(x => x.id === updated.id ? updated : x));
    };

    const xarajatOchirish = async (id) => {
        const { error } = await supabase.from('xarajatlar').delete().eq('id', id);
        if (error) throw error;
        setXarajatlar(prev => prev.filter(x => x.id !== id));
    };

    // --- TANNARX, MASALLIQ & CHIQIM FUNKSIYALARI ---
    const tannarxQoshish = async (yangi) => {
        const { data, error } = await supabase.from('tannarxlar').insert([yangi]).select();
        if (error) throw error;
        setTannarxlar(prev => [data[0], ...prev]);
    };

    const tannarxOchirish = async (id) => {
        const { error } = await supabase.from('tannarxlar').delete().eq('id', id);
        if (error) throw error;
        setTannarxlar(prev => prev.filter(t => t.id !== id));
    };

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

    const clearAllData = async () => {
        try {
            const tables = ['sotuvlar', 'mijozlar', 'products', 'chiqimlar', 'masalliqlar', 'tannarxlar', 'xarajatlar'];
            await Promise.all(tables.map(table => supabase.from(table).delete().neq('id', 0)));
            localStorage.clear();
            setMijozlar([]); setSotuvlar([]); setProducts([]); setChiqimlar([]); setMasalliqlar([]); setTannarxlar([]); setXarajatlar([]);
            return true;
        } catch (err) {
            console.error("Tozalashda xato:", err);
            return false;
        }
    };

    // --- MOLIYAVIY HISOB-KITOB (USEMEMO) ---
    const jamiKirim = useMemo(() => {
        return sotuvlar.reduce((sum, s) => sum + parseFloat(s.tulangan || 0), 0);
    }, [sotuvlar]);

    const jamiXarajatlarSumma = useMemo(() => {
        return xarajatlar.reduce((sum, x) => sum + parseFloat(x.summa || 0), 0);
    }, [xarajatlar]);

    const jamiChiqim = useMemo(() => {
        const x = chiqimlar.reduce((sum, c) => sum + parseFloat(c.summa || 0), 0);
        const m = masalliqlar.reduce((sum, mas) => sum + (parseFloat(mas.narxi || 0) * parseFloat(mas.miqdori || 0)), 0);
        return x + m + jamiXarajatlarSumma;
    }, [chiqimlar, masalliqlar, jamiXarajatlarSumma]);

    const jamiQarzlar = useMemo(() => {
        return mijozlar.reduce((sum, m) => sum + parseFloat(m.qarzdorlik || 0), 0);
    }, [mijozlar]);

    const sofFoyda = useMemo(() => {
        return jamiKirim - jamiChiqim;
    }, [jamiKirim, jamiChiqim]);

    // --- CONTEXT PROVIDER VALUE ---
    return (
        <DataContext.Provider value={{
            mijozlar, products, sotuvlar, chiqimlar, masalliqlar, tannarxlar, xarajatlar, loading,
            setProducts, setMasalliqlar, setChiqimlar, setMijozlar, setSotuvlar, setTannarxlar, setXarajatlar, fetchData,
            mijozQoshish, mijozOchirish, mijozYangilash,
            productQoshish, productYangilash,
            masalliqQoshish, sotuvQoshish, sotuvYangilash, sotuvOchirish,
            tannarxQoshish, tannarxOchirish,
            xarajatQoshish, xarajatOchirish, xarajatYangilash,
            chiqimQoshish, clearAllData,
            jamiKirim, jamiChiqim, jamiQarzlar, sofFoyda, jamiXarajatlarSumma,
            supabase 
        }}>
            {children}
        </DataContext.Provider>
    );
};

// Custom Hook
export const useData = () => useContext(DataContext);