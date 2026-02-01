import React, { useState } from 'react';
import { Route, Routes, /* useNavigate */ } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
// import { IoIosArrowBack } from "react-icons/io";
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

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
import User from './pages/user/User';

function App() {
  // const navigate = useNavigate();
  const [open, setOpen] = useState(true); // Sidebar holati

  return (
    <div className="App">
      <ToastContainer />
      
      {/* Sidebar yopilganda 'sidebar-closed' klassi orqali chapga suriladi */}
      {/* <div className={`go-back ${!open ? 'sidebar-closed' : ''}`} onClick={() => navigate(-1)}>
        <IoIosArrowBack />
        <p>go back</p>
      </div> */}

      <Header />
      <SideBar open={open} setOpen={setOpen} />

      <Routes>
        {/* Barcha sahifalarga sidebar holatini (open) prop qilib beramiz */}
        <Route path='/' element={<Home open={open} />}/>
        <Route path='/kolbasamaxsulotlar' element={<Kolbasamaxsulotlar open={open} />}/>
        <Route path='/mijozlar' element={<Mijozlar open={open} />}/>
        <Route path='/masalliqlar' element={<Masalliqlar open={open} />}/>
        <Route path='/tannarxhisoblash' element={<Tannarxhisoblash open={open} />}/>
        <Route path='/moliya' element={<Moliya open={open} />}/>
        <Route path='/tovuqchiqim' element={<Tovuqchiqim open={open} />}/>
        <Route path='/foydalanuvchilar' element={<Foydalanuvchilar open={open} />}/>
        <Route path='/user' element={<User open={open} />}/>
      </Routes>
    </div>
  );
}

export default App;