import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/Sidebar.css';
import { NavLink } from 'react-router-dom';
import IconSPP from '../assets/icon/RiwayatSPP.png';
import money from '../assets/icon/money.png';
import pembayaranspp from '../assets/icon/pembayaranSPP.png';
import statussiswa from '../assets/icon/statusiswa.png';

function Sidebar({ onClose = () => {} }) {
  /* dipanggil setiap klik link */
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      onClose();            // tutup sidebar hanya di mobile
    }
  };

  return (
    <div className="sidebar d-flex flex-column text-white p-3">
      {/* Judul */}
      <div className="mb-1">
        <h5 className="text-uppercase fw-bold pb-">Admin</h5>
         <hr></hr>
      </div>
      <ul className="nav nav-pills flex-column">
        <li className="nav-item mb-2">
          <NavLink
            to="/MonitoringSPP-admin"
            className="nav-link text-white d-flex align-items-center"
            onClick={handleLinkClick}
          >
            <img src={IconSPP} alt="Riwayat SPP" width={20} height={20} className="me-2" />
            <span>Monitoring SPP</span>
          </NavLink>
        </li>

        <li className="nav-item mb-2">
          <NavLink
            to="/PengaturanEmoney-admin"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${isActive ? 'active' : 'text-white'}`
            }
            onClick={handleLinkClick}
          >
            <img src={money} alt="money" width={20} height={20} className="me-2" />
            <span>Pengaturan E-Money</span>
          </NavLink>
        </li>

        <li className="nav-item mb-1">
          <NavLink
            to="/PengaturanBeasiswasiswa-admin"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${isActive ? 'active' : 'text-white'}`
            }
            onClick={handleLinkClick}
          >
            <img src={statussiswa} alt="status siswa" width={20} height={20} className="me-2" />
            <span>Pengaturan Beasiswa Siswa</span>
          </NavLink>
        </li>

        <li className="nav-item mb-2">
          <NavLink
            to="/PembayaranSPP-admin"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${isActive ? 'active' : 'text-white'}`
            }
            onClick={handleLinkClick}
          >
            <img src={pembayaranspp} alt="Riwayat SPP" width={25} height={25} className="me-2" />
            <span>Pembayaran SPP</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
