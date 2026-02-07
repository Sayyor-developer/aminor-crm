import React, { createContext, useState, useContext, useEffect } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // --- 1. LOCAL STORAGE INTEGRATSIYASI ---
  const getLocal = (key, initial) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  };

  // --- 2. ASOSIY STATELAR ---
  const [mijozlar, setMijozlar] = useState(getLocal('mijozlar', [
   { id: 1, ism: 'Alisher Valiyev', telefon: '+998901234567', qarzdorlik: 500000, oxirgiXarid: '2024-05-10', status: true, tolovTarixi: [{sana: '2024-05-10', miqdor: 200000, tur: 'Naqd', xodim: 'Admin'}] },
    { id: 2, ism: 'Dilnoza Karimova', telefon: '+998912345678', qarzdorlik: 0, oxirgiXarid: '2024-05-12', status: true, tolovTarixi: [] },
    { id: 3, ism: 'Jamshid Tursunov', telefon: '+998933456789', qarzdorlik: 1200000, oxirgiXarid: '2024-04-20', status: false, tolovTarixi: [] },
    { id: 4, ism: 'Sevara Rahimova', telefon: '+998944567890', qarzdorlik: 0, oxirgiXarid: '2024-05-15', status: true, tolovTarixi: [] },
    { id: 5, ism: 'Bekzod Azimov', telefon: '+998955678901', qarzdorlik: 350000, oxirgiXarid: '2024-05-01', status: true, tolovTarixi: [] },
    { id: 6, ism: 'Bekzod Qochqorov', telefon: '+998901234567', qarzdorlik: 700000, oxirgiXarid: '2024-05-10', status: true, tolovTarixi: [] },
    { id: 7, ism: 'Sayyor Ismoilov', telefon: '+998912345678', qarzdorlik: 0, oxirgiXarid: '2024-05-12', status: true, tolovTarixi: [] },
    { id: 8, ism: 'Sayyor Xalikov', telefon: '+998933456789', qarzdorlik: 5200000, oxirgiXarid: '2024-04-20', status: false, tolovTarixi: [] },
    { id: 9, ism: 'Ibrohim Muhammadiyev', telefon: '+998944567890', qarzdorlik: 6000000, oxirgiXarid: '2024-05-15', status: true, tolovTarixi: [] },
    { id: 10, ism: 'Sherzor Ravshanov', telefon: '+998955678901', qarzdorlik: 380000, oxirgiXarid: '2024-05-01', status: true, tolovTarixi: [] },
    { id: 11, ism: 'Sardor Valiyev', telefon: '+998901234567', qarzdorlik: 57800000, oxirgiXarid: '2024-05-10', status: true, tolovTarixi: [] },
    { id: 12, ism: 'Nuriddin Karimov', telefon: '+998912345678', qarzdorlik: 0, oxirgiXarid: '2024-05-12', status: true, tolovTarixi: [] },
    { id: 13, ism: 'Xurshid Qodirov', telefon: '+998933456789', qarzdorlik: 1200000, oxirgiXarid: '2024-04-20', status: false, tolovTarixi: [] },
    { id: 14, ism: 'Zarif Qodirov', telefon: '+998944567890', qarzdorlik: 0, oxirgiXarid: '2024-05-15', status: true, tolovTarixi: [] },
    { id: 15, ism: 'Abdulloh Qodirov', telefon: '+998955678901', qarzdorlik: 350000, oxirgiXarid: '2024-05-01', status: true, tolovTarixi: [] },
  ]));

  const [sotuvlar, setSotuvlar] = useState(getLocal('sotuvlar', [])); // Home va Moliya uchun
  const [chiqimlar, setChiqimlar] = useState(getLocal('chiqimlar', [])); // Xarajatlar (Masalliq/Tovuq)
  const [masalliqlar, setMasalliqlar] = useState(getLocal('masalliqlar', [])); // Ombor holati

  // --- 3. MA'LUMOTLARNI SAQLASH (LocalStorage) ---
  useEffect(() => {
    localStorage.setItem('mijozlar', JSON.stringify(mijozlar));
    localStorage.setItem('sotuvlar', JSON.stringify(sotuvlar));
    localStorage.setItem('chiqimlar', JSON.stringify(chiqimlar));
    localStorage.setItem('masalliqlar', JSON.stringify(masalliqlar));
  }, [mijozlar, sotuvlar, chiqimlar, masalliqlar]);

  // --- 4. FUNKSIYALAR ---

  // Mijozlar bilan ishlash
  const mijozQoshish = (yangi) => setMijozlar(prev => [yangi, ...prev]);
  const mijozOchirish = (id) => setMijozlar(prev => prev.filter(m => m.id !== id));
  const mijozYangilash = (updated) => setMijozlar(prev => prev.map(m => m.id === updated.id ? updated : m));

  // Sotuv (Kirim) - Mijoz qarzdorligini va umumiy savdoni boshqaradi
  const sotuvQoshish = (yangiSotuv) => {
    setSotuvlar(prev => [yangiSotuv, ...prev]);
    // Agar mijozga qarzga sotilsa, uning qarzdorligini oshirish:
    if(yangiSotuv.mijozId) {
        setMijozlar(prev => prev.map(m => 
            m.id === yangiSotuv.mijozId ? { ...m, qarzdorlik: m.qarzdorlik + yangiSotuv.summa } : m
        ));
    }
  };

  // Chiqim (Xarajat) - Masalliq yoki Tovuq sotib olinganda ishlaydi
  const chiqimQoshish = (yangiChiqim) => {
    setChiqimlar(prev => [yangiChiqim, ...prev]);
  };

  // Ombor (Masalliqlar) boshqaruvi
  const masalliqMiqdoriniYangilash = (id, miqdor) => {
    setMasalliqlar(prev => prev.map(m => 
        m.id === id ? { ...m, miqdori: m.miqdori + Number(miqdor) } : m
    ));
  };

  // --- 5. GLOBAL MOLIYA HISOB-KITOBI ---
  const jamiKirim = sotuvlar.reduce((sum, s) => sum + Number(s.summa), 0);
  const jamiChiqim = chiqimlar.reduce((sum, c) => sum + Number(c.summa), 0);
  const jamiQarzlar = mijozlar.reduce((sum, m) => sum + Number(m.qarzdorlik), 0);
  const sofFoida = jamiKirim - jamiChiqim;

  return (
    <DataContext.Provider value={{ 
      mijozlar, mijozQoshish, mijozOchirish, mijozYangilash, 
      sotuvlar, sotuvQoshish,
      chiqimlar, chiqimQoshish,
      masalliqlar, setMasalliqlar, masalliqMiqdoriniYangilash,
      jamiKirim, jamiChiqim, jamiQarzlar, sofFoida
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);