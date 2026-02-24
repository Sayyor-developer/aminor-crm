import React, { useEffect, useState, useCallback } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { DataProvider } from './DataContext';
import { supabase } from './api/supabaseClient'; 
import Header from './components/header/Header';
import SideBar from './components/sidebar/SideBar';
import Loading from './Loading';

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
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const location = useLocation();

  const fetchUserProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setUserData(data);
      }
    } catch (err) {
      console.error("Profil yuklashda xato:", err);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setUserData(null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (session && userData) {
      setPageLoading(true);
      const timer = setTimeout(() => setPageLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, session, userData]);

  if (authLoading || (session && !userData)) return <Loading />;

  const hasAccess = (sectionName) => {
    if (!userData) return false;
    const role = userData.role ? userData.role.toLowerCase().trim() : '';
    if (role === 'direktor' || role === 'director') return true; 

    const perms = userData.permissions;
    if (!perms) return false;

    if (Array.isArray(perms)) return perms.includes(sectionName);
    
    if (typeof perms === 'object' && perms !== null) {
      return perms[sectionName] === true || 
             perms[sectionName.toLowerCase()] === true ||
             perms[sectionName.replace(/\s+/g, '').toLowerCase()] === true;
    }
    return false;
  };

  const pageTitles = {
    '/home': 'Dashboard',
    '/kolbasamaxsulotlar': 'Kolbasa va Maxsulotlar',
    '/mijozlar': 'Mijozlar Bazasi',
    '/masalliqlar': 'Masalliqlar',
    '/tannarxhisoblash': 'Tannarx hisoblash',
    '/moliya': 'Moliya',
    '/tovuqchiqim': 'Tovuq Chiqimlari',
    '/foydalanuvchilar': 'Foydalanuvchilar',
    '/direktor': 'Direktor'
  };

  const getTitle = () => {
    if (location.pathname.startsWith('/mijozlar/')) return "Mijoz Profili";
    return pageTitles[location.pathname] || "Aminor";
  };

  return (
    <DataProvider>
      <div className="App">
        <ToastContainer position="top-right" autoClose={2000} />

        {session && userData && (
          <>
            <SideBar 
              open={open} 
              setOpen={setOpen} 
              userPermissions={userData?.permissions || []} 
              userRole={userData?.role || ''} 
            />
            <Header open={open} title={getTitle()} />
          </>
        )}

        <main className={session ? `main-content ${open ? 'shifted' : 'full'}` : ""}>
          {pageLoading ? (
            <div className="loading-wrapper"><Loading /></div>
          ) : (
            <Routes>
              <Route path="/" element={session ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
              <Route path="/login" element={session ? <Navigate to="/home" replace /> : <Login />} />

              {session && userData ? (
                <>
                  <Route path="/home" element={hasAccess('Dashboard') ? <Home open={open} /> : <Navigate to="/login" replace />} />
                  <Route path="/kolbasamaxsulotlar" element={hasAccess('Kolbasa va Maxsulotlar') ? <Kolbasamaxsulotlar open={open} /> : <Navigate to="/home" replace />} />
                  <Route path="/mijozlar" element={hasAccess('Mijozlar Bazasi') ? <Mijozlar open={open} /> : <Navigate to="/home" replace />} />
                  <Route path="/mijozlar/:id" element={hasAccess('Mijozlar Bazasi') ? <MijozProfil open={open} /> : <Navigate to="/home" replace />} />
                  <Route path="/masalliqlar" element={hasAccess('Masalliqlar') ? <Masalliqlar open={open} /> : <Navigate to="/home" replace />} />
                  <Route path="/tannarxhisoblash" element={hasAccess('Tannarx hisoblash') ? <Tannarxhisoblash open={open} /> : <Navigate to="/home" replace />} />
                  <Route path="/moliya" element={hasAccess('Moliya') ? <Moliya open={open} /> : <Navigate to="/home" replace />} />
                  <Route path="/tovuqchiqim" element={hasAccess('Tovuq Chiqimlari') ? <Tovuqchiqim open={open} /> : <Navigate to="/home" replace />} />
                  <Route path="/foydalanuvchilar" element={hasAccess('Foydalanuvchilar') ? <Foydalanuvchilar open={open} /> : <Navigate to="/home" replace />} />
                  <Route path="/direktor" element={hasAccess('Direktor') ? <Direktor open={open} /> : <Navigate to="/home" replace />} />
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </>
              ) : (
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