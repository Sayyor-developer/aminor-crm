import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { supabase } from './api/supabaseClient'; 

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    // LocalStorage-dan ma'lumotni xavfsiz o'qish
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
    const [tannarxlar, setTannarxlar] = useState(getLocal('tannarxlar', [])); // Tannarx qo'shildi
    const [loading, setLoading] = useState(true);

    // --- DATA FETCHING (Barcha ma'lumotlarni bazadan olish) ---
    const fetchData = async () => {
        try {
            setLoading(true);
            const [mRes, sRes, pRes, cRes, masRes, tRes] = await Promise.all([
                supabase.from('mijozlar').select('*').order('id', { ascending: false }),
                supabase.from('sotuvlar').select('*').order('id', { ascending: false }),
                supabase.from('products').select('*').order('id', { ascending: false }),
                supabase.from('chiqimlar').select('*').order('id', { ascending: false }),
                supabase.from('masalliqlar').select('*').order('id', { ascending: false }),
                supabase.from('tannarxlar').select('*').order('id', { ascending: false }) // Tannarx yuklash
            ]);

            if (mRes.data) setMijozlar(mRes.data.map(m => ({ ...m, oxirgiXarid: m.oxirgixarid })));
            if (sRes.data) setSotuvlar(sRes.data.map(s => ({ ...s, mijozId: s.mijozid })));
            if (pRes.data) setProducts(pRes.data);
            if (cRes.data) setChiqimlar(cRes.data);
            if (masRes.data) setMasalliqlar(masRes.data); 
            if (tRes.data) setTannarxlar(tRes.data); // Tannarx state-ga yozish
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
            localStorage.setItem('tannarxlar', JSON.stringify(tannarxlar)); // Sync tannarx
        }
    }, [mijozlar, products, sotuvlar, chiqimlar, masalliqlar, tannarxlar, loading]);

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

    // --- PRODUCTS (MAHSULOTLAR) FUNKSIYALARI ---
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

    // --- SOTUVLAR & STOCK (OMBOR) FUNKSIYALARI ---
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

    // --- TANNARX FUNKSIYALARI ---
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

    // --- HAMMA NARSANI O'CHIRISH ---
    const clearAllData = async () => {
        try {
            const tables = ['sotuvlar', 'mijozlar', 'products', 'chiqimlar', 'masalliqlar', 'tannarxlar'];
            await Promise.all(tables.map(table => supabase.from(table).delete().neq('id', 0)));
            localStorage.clear();
            setMijozlar([]); setSotuvlar([]); setProducts([]); setChiqimlar([]); setMasalliqlar([]); setTannarxlar([]);
            return true;
        } catch (err) {
            console.error("Tozalashda xato:", err);
            return false;
        }
    };

    // --- MOLIYAVIY HISOB-KITOB ---
    const jamiKirim = useMemo(() => {
        return sotuvlar.reduce((sum, s) => sum + parseFloat(s.tulangan || 0), 0);
    }, [sotuvlar]);

    const jamiChiqim = useMemo(() => {
        const x = chiqimlar.reduce((sum, c) => sum + parseFloat(c.summa || 0), 0);
        const m = masalliqlar.reduce((sum, mas) => sum + (parseFloat(mas.narxi || 0) * parseFloat(mas.miqdori || 0)), 0);
        return x + m;
    }, [chiqimlar, masalliqlar]);

    const jamiQarzlar = useMemo(() => {
        return mijozlar.reduce((sum, m) => sum + parseFloat(m.qarzdorlik || 0), 0);
    }, [mijozlar]);

    const sofFoyda = useMemo(() => {
        return jamiKirim - jamiChiqim;
    }, [jamiKirim, jamiChiqim]);

    return (
        <DataContext.Provider value={{
            mijozlar, products, sotuvlar, chiqimlar, masalliqlar, tannarxlar, loading,
            setProducts, setMasalliqlar, setChiqimlar, setMijozlar, setSotuvlar, setTannarxlar, fetchData,
            mijozQoshish, mijozOchirish, mijozYangilash,
            productQoshish, productYangilash,
            masalliqQoshish, sotuvQoshish, sotuvYangilash, sotuvOchirish,
            tannarxQoshish, tannarxOchirish,
            chiqimQoshish, clearAllData,
            jamiKirim, jamiChiqim, jamiQarzlar, sofFoyda,
            supabase 
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);