import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// CONTEXT PROVIDERNI IMPORT QILAMIZ
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

function App() {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const pageTitles = {
    '/': 'Dashboard',
    '/kolbasamaxsulotlar': 'Kolbasa va Maxsulotlar',
    '/mijozlar': 'Mijozlar Bazasi',
    '/masalliqlar': 'Masalliqlar',
    '/tannarxhisoblash': 'Tannarx hisoblash',
    '/moliya': 'Moliya',
    '/tovuqchiqim': 'Tovuq Chiqimlari',
    '/foydalanuvchilar': 'Foydalanuvchilar',
    '/direktor': 'Direktor'
  };

  const currentTitle = pageTitles[location.pathname] || "Aminor";

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    // 1. DATA PROVIDER BILAN BUTUN APP'NI O'RAYMIZ
    <DataProvider>
      <div className="App">
        <ToastContainer />
        
        <SideBar open={open} setOpen={setOpen} />
        <Header open={open} title={currentTitle} />

        <main className={`main-content ${open ? 'shifted' : 'full'}`}>
          {loading ? (
            <div className="loading-wrapper">
              <Loading />
            </div>
          ) : (
            <Routes>
              {/* Barcha componentlar endi context'dan ma'lumot olishi mumkin */}
              <Route path='/' element={<Home open={open} />}/>
              <Route path='/kolbasamaxsulotlar' element={<Kolbasamaxsulotlar open={open} />}/>
              <Route path='/mijozlar' element={<Mijozlar open={open} />}/>
              <Route path='/masalliqlar' element={<Masalliqlar open={open} />}/>
              <Route path='/tannarxhisoblash' element={<Tannarxhisoblash open={open} />}/>
              <Route path='/moliya' element={<Moliya open={open} />}/>
              <Route path='/tovuqchiqim' element={<Tovuqchiqim open={open} />}/>
              <Route path='/foydalanuvchilar' element={<Foydalanuvchilar open={open} />}/>
              <Route path='/direktor' element={<Direktor open={open} />}/>
            </Routes>
          )}
        </main>
      </div>
    </DataProvider>
  );
}

export default App;