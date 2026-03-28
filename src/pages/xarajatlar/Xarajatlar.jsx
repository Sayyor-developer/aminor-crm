import React, { useState, useEffect } from 'react';
import './xarajatlar.css';
import { useData } from '../../DataContext'; 
import { SiInfracost } from "react-icons/si";
import { FiPlus, FiFilter } from "react-icons/fi";
import { toast } from 'react-toastify';

const Xarajatlar = ({ open }) => {
    const { xarajatlar, xarajatQoshish } = useData();
    const today = new Date().toISOString().split('T')[0];
    
    const [formData, setFormData] = useState({ nomi: '', summa: '', sana: today });
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [displayItems, setDisplayItems] = useState([]);

    // Komponent yuklanganda barcha xarajatlarni ko'rsatish
    useEffect(() => {
        setDisplayItems(xarajatlar);
    }, [xarajatlar]);

    const formatNumber = (num) => {
        if (!num) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    // Umumiy summani hisoblash
    const totalSumma = displayItems.reduce((acc, item) => acc + Number(item.summa), 0);

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

    const handleFilter = () => {
        if (!startDate || !endDate) {
            toast.info("Iltimos, ikkala sanani ham tanlang!");
            setDisplayItems(xarajatlar);
            return;
        }

        const filtered = xarajatlar.filter(item => {
            const itemDate = new Date(item.sana);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return itemDate >= start && itemDate <= end;
        });

        setDisplayItems(filtered);
        if (filtered.length === 0) {
            toast.warn("Ushbu vaqt oralig'ida xarajatlar topilmadi.");
        }
    };

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
                            <input type="text" name="nomi" placeholder='Izoh...' value={formData.nomi} onChange={handleChange} required />
                        </div>
                        <div className="xarajat-field">
                            <label>Summa</label>
                            <input type="text" name="summa" placeholder='Narx..' value={formatNumber(formData.summa)} onChange={handleChange} required />
                        </div>
                        <div className="xarajat-field">
                            <label>Sana</label>
                            <input type="date" name="sana" value={formData.sana} onChange={handleChange} required />
                        </div>
                        <button type="submit" className="xarajat-add-inline-btn"><FiPlus /> Qo'shish</button>
                    </form>
                </div>

                {/* FILTR */}
                <div className="xarajat-search-row">
                    <div className="xarajat-filter-box">
                        <div className="filter-input-grp">
                            <label>Dan:</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="filter-date-input" />
                        </div>
                        <div className="filter-input-grp">
                            <label>Gacha:</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="filter-date-input" />
                        </div>
                        <button type="button" onClick={handleFilter} className="xarajat-show-btn"><FiFilter /> Ko'rsatish</button>
                    </div>
                </div>

                {/* JADVAL */}
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
                            {displayItems.length > 0 ? (
                                <>
                                    {displayItems.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.sana}</td>
                                            <td>{item.nomi}</td>
                                            <td className="xarajat-price">{formatNumber(item.summa)} so'm</td>
                                        </tr>
                                    ))}
                                    {/* TOTAL QATORI */}
                                    <tr className="xarajat-total-row">
                                        <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold' }}>JAMI:</td>
                                        <td className="xarajat-total-price">{formatNumber(totalSumma)} so'm</td>
                                    </tr>
                                </>
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>Ma'lumot topilmadi</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Xarajatlar;