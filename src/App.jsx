import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { DataProvider } from './DataContext'; 
import Header from './components/header/Header';
import SideBar from './components/sidebar/SideBar';

import Home from "./pages/home/Home";
import Kolbasamaxsulotlar from './pages/kolbasamaxsulotlar/Kolbasamaxsulotlar'; 
import Mijozlar from './pages/mijozlar/Mijozlar'; 
import Masalliqlar from './pages/masalliqlar/Masalliqlar';
import Tannarxhisoblash from './pages/tannarxhisoblash/Tannarxhisoblash';
import Moliya from './pages/moliya/Moliya';
import Tovuqchiqim from './pages/tovuqchiqim/Tovuqchiqim';
import Foydalanuvchilar from './pages/foydalanuvchilar/Foydalanuvchilar';
import Direktor from './pages/direktor/Direktor';
import Loading from './Loading';
import Login from './pages/login/Login';

function App() {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  // 1. Tokenni har gal sahifa yangilanganda qat'iy tekshirish
  const token = sessionStorage.getItem("token");
  const isAuthenticated = token === "true";

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // 2. DARVOZABON (Qat'iy blokirovka): 
  // Agar login qilinmagan bo'lsa va /login'da bo'lmasa, pastdagi birorta kodni o'qimasdan LOGIN'ga otadi.
  if (!isAuthenticated && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  const pageTitles = {
    '/': 'Dashboard',
    '/kolbasamaxsulotlar': 'Kolbasa va Maxsulotlar',
    '/mijozlar': 'Mijozlar Bazasi',
    '/masalliqlar': 'Masalliqlar',
    '/tannarxhisoblash': 'Tannarx hisoblash',
    '/moliya': 'Moliya',
    '/tovuqchiqim': 'Tovuq Chiqimlari',
    '/foydalanuvchilar': 'Foydalanuvchilar',
    '/direktor': 'Direktor',  
    '/login': 'Login'
  };

  const currentTitle = pageTitles[location.pathname] || "Aminor";

  return (
    <DataProvider>
      <div className="App">
        <ToastContainer position="top-right" autoClose={2000} />
        
        {/* Sidebar va Header faqat login qilgan bo'lsa chiqadi */}
        {isAuthenticated && (
          <>
            <SideBar open={open} setOpen={setOpen} />
            <Header open={open} title={currentTitle} />
          </>
        )}

        <main className={isAuthenticated ? `main-content ${open ? 'shifted' : 'full'}` : ""}>
          {loading ? (
            <div className="loading-wrapper"><Loading /></div>
          ) : (
            <Routes>
              {/* Login sahifasi mantiqi */}
              <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />

              {/* FAQAT LOGIN QILGANLAR UCHUN YO'LLAR RO'YXATI */}
              {isAuthenticated ? (
                <>
                  <Route path="/" element={<Home open={open} />} />
                  <Route path="/kolbasamaxsulotlar" element={<Kolbasamaxsulotlar open={open} />} />
                  <Route path="/mijozlar" element={<Mijozlar open={open} />} />
                  <Route path="/masalliqlar" element={<Masalliqlar open={open} />} />
                  <Route path="/tannarxhisoblash" element={<Tannarxhisoblash open={open} />} />
                  <Route path="/moliya" element={<Moliya open={open} />} />
                  <Route path="/tovuqchiqim" element={<Tovuqchiqim open={open} />} />
                  <Route path="/foydalanuvchilar" element={<Foydalanuvchilar open={open} />} />
                  <Route path="/direktor" element={<Direktor open={open} />} />
                  
                  {/* Noto'g'ri URL yozilsa Home'ga qaytaradi */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              ) : (
                // Agar tasodifan auth bo'lmasa, hammani login'ga haydaydi
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