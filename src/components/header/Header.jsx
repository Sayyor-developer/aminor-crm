import  { useState } from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; // Savol belgisi uchun
import { HeaderContainer } from './Header.styles';
import './header.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient';
import { toast } from 'react-toastify';

const Header = ({ open, title }) => {
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Tizimdan chiqildi", {
        position: "top-right"
      });
      navigate('/login');
    } catch (error) {
      toast.error("Chiqishda xatolik: " + error.message, {
        position: "top-right"
      });
    }
  };



  return (
    <>
      <HeaderContainer open={open}>
        <div className="header-wrapper">
          <h2 className="page-title">Dashboard - {title}</h2>
          
          {/* onClick endi modalni ochadi */}
          <div className="account-section" onClick={() => setShowModal(true)}>
            <div className="user-info">
              <AccountCircleIcon className="user-icon" />
              <span className="user-name">Account</span>
            </div>
            <LogoutIcon className="logout-icon" />
          </div>
        </div>
      </HeaderContainer>

      {/* Tasdiqlash Modali */}
      {showModal && (
        <div className="logout-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon">
              <HelpOutlineIcon style={{ fontSize: '48px', color: 'var(--primary-color)' }} />
            </div>
            <h3 className="logout-modal-title">Tizimdan chiqish</h3>
            <p className="logout-modal-text">Haqiqatdan ham tizimdan chiqmoqchimisiz?</p>
            
            <div className="logout-modal-actions">
              <button 
                className="logout-btn-cancel" 
                onClick={() => setShowModal(false)}
              >
                Yo'q
              </button>
              <button 
                className="logout-btn-confirm" 
               onClick={handleLogout} 
              >
                Ha, chiqish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;