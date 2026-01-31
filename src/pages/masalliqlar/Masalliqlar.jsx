import './masalliqlar.css'
import { TbMeat, TbEgg, TbBottle, TbLeaf } from "react-icons/tb";
import { FiSearch, FiChevronRight, FiChevronsRight } from "react-icons/fi";

const Masalliqlar = ({ open }) => {
  return (
    /* Klass nomi .masalliqlar bo'lishi kerak, chunki CSS'da shunday yozilgan */
    <div className={`masalliqlar ${!open ? 'sidebar-closed' : ''}`}>
      <div className="main-wrapper">

        {/* 1-Qism: Kartochkalar */}
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Masalliqlar Ro'yxati</h2>
          </div>
          <div className="cards-grid">
            <div className="card meat">
              <div className="card-top">
                <TbMeat className="i" />  
                <div>
                  <h3>Go'sht</h3>
                  <p>Doktor go'shti</p>
                </div>
              </div>
              <h2 className="kg">345 <span>kg</span></h2>
            </div>
            <div className="card egg">
              <div className="card-top">
                <TbEgg className="i" />
                <div>
                  <h3>Tuxum</h3>
                  <p>Tuxummar</p>
                </div>
              </div>
              <h2 className="kg">2400 <span>dona</span></h2>
            </div>
            <div className="card spice">
              <div className="card-top">
                <TbBottle className="i" /> 
                <div>
                  <h3>Ziravorlar</h3>
                  <p>Tabiiy ziravorlar</p>
                </div>
              </div>
              <h2 className="kg">4 <span>kg</span></h2>
            </div>
            <div className="card cabbage">
              <div className="card-top">
                <TbLeaf className="i" />
                <div>
                  <h3>Karam</h3>
                  <p>Yangi karomlar</p>
                </div>
              </div>
              <h2 className="kg">40 <span>kg</span></h2>
            </div>
          </div>
        </div>

        {/* Jadval qism */}
        <div className="section-container table-margin">
          <div className="section-header table-header">
            <h2 className="section-title">Masalliq Kirimlari va Sarflari</h2>
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Masalliq qidirish..." />
            </div>
          </div>

          <div className="remaining-info">
            Remaining: <span>2,841 kg</span>
          </div>

          <div className="o-skrol">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sana</th>
                  <th>Kirim</th>
                  <th>Sarf</th>
                  <th>Qoldiq</th>
                  <th>Izohlar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="blue-text">30 aprel 2024</td>
                  <td>Go'sht</td>
                  <td className="dona">-20 kg</td>
                  <td>345 kg</td>
                  <td>Doktor dizgi go'sht keldi.</td>
                </tr>
                <tr>
                  <td className="blue-text">31 aprel 2024</td>
                  <td>Tuxum</td>
                  <td className="kilo">4880 dona</td>
                  <td>2100 dona</td>
                  <td>Doktor Kolbasa uchun sarflandi.</td>
                </tr>
                <tr>
                  <td className="blue-text">29 aprel 2024</td>
                  <td>Ziravor</td>
                  <td className="kilo">-20 kg</td>
                  <td>2400 dona</td>
                  <td>Doktor Kolbasa uchun tuxum filiali</td>
                </tr>
                <tr>
                  <td className="blue-text">28 aprel 2024</td>
                  <td>Karam</td>
                  <td className="kilo">10 kg</td>
                  <td>410 kg</td>
                  <td>Karam filiali</td>
                </tr>
              </tbody>
            </table>

            <div className="table-footer">
              <p>1dan 3 tasi ko'rsatilmoqda (Jami: 3 ta)</p>
              <div className="total-sum">7,210,000 so'm</div>
              <div className="oldin-keyin">
                <span className="oldingi">Oldingi</span>
                <div className="page-numbers">
                  <button className="active">1</button>
                  <button><FiChevronRight /></button>
                  <button><FiChevronsRight /></button>
                </div>
                <span className="keyingi">Keyingi</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Masalliqlar