import React, { useState } from 'react';
import { Search, Edit, Trash2, Plus, ChevronRight } from 'lucide-react';
import './kolbasamaxsulotlar.css';

export default function Kolbasamaxsulotlar({ open }) {
  const [products, setProducts] = useState([
    { id: 1, name: 'Doktor Kolbasa', unit: 'kg', stock: 1200, price: 40000, active: true },
    { id: 2, name: 'Sosiska', unit: 'kg', stock: 850, price: 30000, active: false },
    { id: 3, name: "Mol go'shtli Kolbasa", unit: 'kg', stock: 1400, price: 48000, active: true },
    { id: 4, name: 'Deli Kolbasa', unit: 'kg', stock: 1550, price: 35000, active: true },
    { id: 5, name: "Go'shtli Sardelka", unit: 'kg', stock: 340, price: 28000, active: false },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', unit: 'kg', price: '' });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    const product = {
      id: Date.now(),
      name: newProduct.name,
      unit: newProduct.unit,
      stock: 0,
      price: Number(newProduct.price),
      active: true,
    };
    setProducts([...products, product]);
    setNewProduct({ name: '', unit: 'kg', price: '' });
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <div className={`home-page ${!open ? 'sidebar-closed' : ''}`}>
      <div className="content-scroll">
        <div className="content-wrapper">
          
          {/* Mahsulot Qo'shish Seksiyasi */}
          <div className="table-container" style={{padding: '2rem', backgroundColor: '#fff'}}>
            <h2 className="section-title">Mahsulot (Kolbasa) Qo'shish</h2>
            <div className="form-grid">
              <div>
                <label className="input-label">Mahsulot Nomi</label>
                <input
                  className="custom-input-style"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Mahsulot nomini kiriting"
                />
              </div>
              <div>
                <label className="input-label">O'lchov Birligi</label>
                <select
                  className="custom-input-style"
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                >
                  <option value="kg">kg</option>
                  <option value="dona">dona</option>
                </select>
              </div>
              <div>
                <label className="input-label">Sotuv Narxi</label>
                <input
                  className="custom-input-style"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="40,000 so'm"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={handleAddProduct} className="action-btn edit-btn add-button" style={{width: '100%', height: '42px', gap: '8px'}}>
                  <Plus size={18} /> Qo'shish
                </button>
              </div>
            </div>
          </div>

          {/* Ro'yxat Seksiyasi */}
          <div className="table-container" style={{padding: '2rem', backgroundColor: '#fff'}}>
            <div className="list-header">
              <div>
                <h2 className="section-title">Kolbasa Mahsulotlari Ro'yxati</h2>
                <p className="stock-summary">
                  Umumiy Tayyor Qoldiq: <span>{totalStock.toLocaleString()} kg</span>
                </p>
              </div>
              <div className="search-box">
                <Search className="search-icon" />
                <input
                  className="custom-input-style"
                  style={{paddingLeft: '2.5rem'}}
                  placeholder="Mahsulotni qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="table-container">
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb'}}>
                    <th className="table-head" style={{padding: '1rem', textAlign: 'left'}}>Mahsulot Nomi</th>
                    <th className="table-head" style={{padding: '1rem', textAlign: 'left'}}>Birlik</th>
                    <th className="table-head" style={{padding: '1rem', textAlign: 'left'}}>Qoldiq</th>
                    <th className="table-head" style={{padding: '1rem', textAlign: 'left'}}>Narxi</th>
                    <th className="table-head" style={{padding: '1rem', textAlign: 'right'}}>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} style={{borderBottom: '1px solid #e5e7eb'}}>
                      <td style={{padding: '1rem'}}>{product.name}</td>
                      <td style={{padding: '1rem', color: '#4b5563'}}>{product.unit}</td>
                      <td className="stock-cell" style={{padding: '1rem'}}>{product.stock.toLocaleString()} kg</td>
                      <td className="price-cell" style={{padding: '1rem'}}>{product.price.toLocaleString()} so'm</td>
                      <td style={{padding: '1rem'}}>
                        <div className="actions-wrapper">
                          <button className="action-btn edit-btn"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="action-btn delete-btn">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination-container">
              <div>1 dan {filteredProducts.length} gacha ko'rsatilmoqda</div>
              <div className="pagination-controls">
                <span>Oldingi</span>
                <div style={{display: 'flex', gap: '0.25rem'}}>
                  <button className="page-num active">1</button>
                  <button className="page-num"><ChevronRight size={16} /></button>
                </div>
                <span>Keyingi</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}