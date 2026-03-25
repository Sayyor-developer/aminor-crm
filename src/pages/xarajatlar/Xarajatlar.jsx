import React, { useState } from 'react';
import './xarajatlar.css';
import { useData } from '../../DataContext'; 
import { SiInfracost } from "react-icons/si";
import { FiPlus, FiSearch } from "react-icons/fi";
import { toast } from 'react-toastify';

const Xarajatlar = ({ open }) => {
    const { xarajatlar, xarajatQoshish } = useData();
    const today = new Date().toISOString().split('T')[0];
    
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ nomi: '', summa: '', sana: today });
    
    const formatNumber = (num) => {
        if (!num) return '';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'summa') {
            const onlyNums = value.replace(/\s/g, '');
            if (!isNaN(onlyNums)) setFormData({ ...formData, summa: onlyNums });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await xarajatQoshish({ ...formData, summa: Number(formData.summa) });
            toast.success("Qo'shildi!");
            setFormData({ nomi: '', summa: '', sana: today });
        } catch (err) { toast.error("Xato!"); }
    };

    const filteredItems = xarajatlar.filter(item => 
        item.nomi.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`xarajat-main-wrapper ${open ? 'xarajat-sidebar-open' : 'xarajat-sidebar-closed'}`}>
            <div className="xarajat-inner-content">
                <div className="xarajat-header-flex">
                    <div className="xarajat-title-grp">
                        <div className="xarajat-icon-circle"><SiInfracost /></div>
                        <h1 className="xarajat-page-title">Xarajatlar bo'limi</h1>
                    </div>
                </div>

                {/* FORMA */}
                <div className="xarajat-form-container">
                    <form className="xarajat-horizontal-form" onSubmit={handleAdd}>
                        <div className="xarajat-field">
                            <label>Nomi</label>
                            <input type="text" name="nomi" placeholder='comment' value={formData.nomi} onChange={handleChange} required />
                        </div>
                        <div className="xarajat-field">
                            <label>Summa</label>
                            <input type="text" name="summa" placeholder='Narx..' value={formatNumber(formData.summa)} onChange={handleChange} required />
                        </div>
                        <div className="xarajat-field">
                            <label>Sana</label>
                            <input type="date" name="sana" placeholder='Sana' value={formData.sana} onChange={handleChange} required />
                        </div>
                        <button type="submit" className="xarajat-add-inline-btn"><FiPlus /> Qo'shish</button>
                    </form>
                </div>

                <div className="xarajat-search-row">
                    <div className="xarajat-search-box">
                        <FiSearch className="xarajat-s-icon" />
                        <input type="text" placeholder="Qidirish..." onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="xarajat-card-box">
                    <table className="xarajat-table">
                        <thead>
                            <tr>
                                <th>Sana</th>
                                <th>Nomi</th>
                                <th>Summa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.sana}</td>
                                    <td>{item.nomi}</td>
                                    <td className="xarajat-price">{formatNumber(item.summa)}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        {/* O'chirish tugmasi olib tashlandi */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Xarajatlar;