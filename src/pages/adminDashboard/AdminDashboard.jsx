import React from 'react';
// import Header from '../eader'; // Header komponentini import qilamiz
import './adminDashboard.css'; // Admin uchun maxsus stillar
import Header  from '../../components/header/Header';

const AdminDashboard = ({ open }) => {
  return (
    <div className={`admin-page ${open ? 'shifted' : 'collapsed'}`}>
      {/* Headerga Admin Paneli sarlavhasini beramiz */}
      <Header title="Admin Paneli" />

      <div className="admin-wrapper">
        <div className="admin-card">
          <div className="admin-welcome">
            <h1>Admin Paneli</h1>
            <p>Xush kelibsiz! Tizimni boshqarish uchun barcha asboblar tayyor.</p>
          </div>
          
          {/* Kelajakda bu yerga jadvallar yoki boshqa vidjetlar qo'shishingiz mumkin */}
          <div className="dashboard-placeholder">
             Bu yerda adminning asosiy statistikasi va ma'lumotlari joylashadi.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;