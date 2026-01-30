import { Route, Routes } from 'react-router-dom';
import Home from "./pages/home/Home"
// ? toast
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css';
import Header from './components/header/Header';
import SideBar from './components/sidebar/SideBar';

function App() {
  
  return (
    
    <div className="App">
      <ToastContainer />

      <Header />
      <SideBar />
     

      
       
    

    {/* ? router */}

      <Routes>
        <Route path='home' element={<Home />}/>

      </Routes>
   
      
    </div>
  );
}

export default App;
