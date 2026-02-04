import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './moliya.css';

const Moliya = ({ open }) => {
  const salesData = [
    { oy: 'Yan', sotuv: 4000000 }, { oy: 'Fev', sotuv: 12000000 },
    { oy: 'Mar', sotuv: 9000000 }, { oy: 'Apr', sotuv: 20000000 },
    { oy: 'May', sotuv: 24000000 }, { oy: 'Iyun', sotuv: 21000000 },
    { oy: 'Iyul', sotuv: 32000000 }
  ];

  return (
    <div className={`moliya-wrapper ${open ? 'sidebar-moliya-open' : 'sidebar-moliya-closed'}`}>
      <div className="moliya-container">
        
        <header className="header-section">
          <h2 className="header-title">Moliya Analitikasi</h2>
          <p className="header-subtitle">Asosiy moliyaviy ko'rsatkichlar va dinamika</p>
        </header>

        <section className="stats-grid">
          <div className="stat-card border-green">
            <div className="stat-card-top">
               <div className="icon-box bg-green-soft"><TrendingUp size={20}/></div>
               <span className="trend-val text-kirim">+12.5%</span>
            </div>
            <div className="stat-label">Umumiy Kirim</div>
            <div className="stat-value">150,000,000</div>
          </div>

          <div className="stat-card border-red">
            <div className="stat-card-top">
               <div className="icon-box bg-red-soft"><TrendingDown size={20}/></div>
               <span className="trend-val text-chiqim">-8.3%</span>
            </div>
            <div className="stat-label">Umumiy Chiqim</div>
            <div className="stat-value">95,000,000</div>
          </div>

          <div className="stat-card border-blue">
            <div className="stat-card-top">
               <div className="icon-box bg-blue-soft"><DollarSign size={20}/></div>
               <span className="trend-val bg-blue-soft">+18.2%</span>
            </div>
            <div className="stat-label">Sof Foida</div>
            <div className="stat-value">55,000,000</div>
          </div>

          <div className="stat-card border-purple">
            <div className="stat-card-top">
               <div className="icon-box bg-purple-soft"><Calendar size={20}/></div>
               <span className="trend-val bg-purple-soft">+5.1%</span>
            </div>
            <div className="stat-label">Rentabellik</div>
            <div className="stat-value">36.7%</div>
          </div>
        </section>

        <section className="content-grid">
          <div className="white-card">
            <h3 className="card-title">Sotuvlar Grafigi</h3>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="oy" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000000}M`} />
                  <Tooltip />
                  <Area type="monotone" dataKey="sotuv" stroke="#3b82f6" fill="#eff6ff" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="white-card">
            <h3 className="card-title">Davriy Statistika</h3>
            <div className="period-box p-blue">
              <div className="stat-label">Bugun</div>
              <div className="data-row"><span>Kirim:</span> <span>2.5M</span></div>
              <div className="data-row foida-row"><span>Foida:</span> <span>0.7M</span></div>
            </div>
            <div className="period-box p-green">
              <div className="stat-label">Haftalik</div>
              <div className="data-row"><span>Kirim:</span> <span>15M</span></div>
              <div className="data-row foida-row"><span>Foida:</span> <span>4M</span></div>
            </div>
          </div>
        </section>

        <section className="white-card">
          <h3 className="card-title">To'lovlar Tarixi</h3>
          <div className="table-wrapper">
            <table className="main-table">
              <thead>
                <tr>
                  <th>TURI</th>
                  <th>MANBAA</th>
                  <th>SUMMA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="text-kirim">Kirim</span></td>
                  <td>Mahsulot sotuvi</td>
                  <td>1,500,000</td>
                </tr>
                <tr>
                  <td><span className="text-chiqim">Chiqim</span></td>
                  <td>Xodimlar maoshi</td>
                  <td>12,000,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Moliya;