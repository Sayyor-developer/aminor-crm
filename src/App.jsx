import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Context va Komponentlar
import { DataProvider } from './DataContext';
import { supabase } from './api/supabaseClient'; 
import Header from './components/header/Header';
import SideBar from './components/sidebar/SideBar';
import Loading from './Loading';

// Sahifalar
import Home from "./pages/home/Home";
import Kolbasamaxsulotlar from './pages/kolbasamaxsulotlar/Kolbasamaxsulotlar';
import Mijozlar from './pages/mijozlar/Mijozlar';
import MijozProfil from './pages/mijozlar/MijozProfil';
import Masalliqlar from './pages/masalliqlar/Masalliqlar';
import Tannarxhisoblash from './pages/tannarxhisoblash/Tannarxhisoblash';
import Moliya from './pages/moliya/Moliya';
import Tovuqchiqim from './pages/tovuqchiqim/Tovuqchiqim';
import Foydalanuvchilar from './pages/foydalanuvchilar/Foydalanuvchilar';
import Direktor from './pages/direktor/Direktor';
import Login from './pages/login/Login';

function App() {
  const [open, setOpen] = useState(true);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      setPageLoading(true);
      const timer = setTimeout(() => setPageLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, session]);

  if (authLoading) return <Loading />;

  const pageTitles = {
    '/home': 'Dashboard',
    '/kolbasamaxsulotlar': 'Kolbasa va Maxsulotlar',
    '/mijozlar': 'Mijozlar Bazasi',
    '/masalliqlar': 'Masalliqlar',
    '/tannarxhisoblash': 'Tannarx hisoblash',
    '/moliya': 'Moliya',
    '/tovuqchiqim': 'Tovuq Chiqimlari',
    '/foydalanuvchilar': 'Foydalanuvchilar',
    '/direktor': 'Direktor',
    '/login': 'Kirish'
  };

  const getTitle = () => {
    if (location.pathname.startsWith('/mijozlar/')) return "Mijoz Profili";
    return pageTitles[location.pathname] || "Aminor";
  };

  return (
    <DataProvider>
      <div className="App">
        <ToastContainer position="top-right" autoClose={2000} />

        {session && (
          <>
            <SideBar open={open} setOpen={setOpen} />
            <Header open={open} title={getTitle()} />
          </>
        )}

        <main className={session ? `main-content ${open ? 'shifted' : 'full'}` : ""}>
          {pageLoading ? (
            <div className="loading-wrapper"><Loading /></div>
          ) : (
        <Routes>
  {/* 1. Saytga birinchi kirganda (/) login holatini tekshirish */}
  <Route 
    path="/" 
    element={session ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} 
  />

  {/* 2. Login sahifasi: kirmagan bo'lsa Login, kirgan bo'lsa Home ga otish */}
  <Route 
    path="/login" 
    element={session ? <Navigate to="/home" replace /> : <Login />} 
  />

  {/* 3. Himoyalangan sahifalar (Faqat session bo'lsa) */}
  {session ? (
    <>
      <Route path="/home" element={<Home open={open} />} />
      <Route path="/kolbasamaxsulotlar" element={<Kolbasamaxsulotlar open={open} />} />
      <Route path="/mijozlar" element={<Mijozlar open={open} />} />
      <Route path="/mijozlar/:id" element={<MijozProfil open={open} />} />
      <Route path="/masalliqlar" element={<Masalliqlar open={open} />} />
      <Route path="/tannarxhisoblash" element={<Tannarxhisoblash open={open} />} />
      <Route path="/moliya" element={<Moliya open={open} />} />
      <Route path="/tovuqchiqim" element={<Tovuqchiqim open={open} />} />
      <Route path="/foydalanuvchilar" element={<Foydalanuvchilar open={open} />} />
      <Route path="/direktor" element={<Direktor open={open} />} />
      
      {/* Noto'g'ri URL yozilsa Home ga otish */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </>
  ) : (
    /* 4. Agar kirmagan bo'lsa va boshqa sahifaga o'tmoqchi bo'lsa, Login ga qaytarish */
    <Route path="*" element={<Navigate to="/login" replace />} />
  )}
</Routes>
          )}
        </main>
      </div>
    </DataProvider>
  );
}

export default App;