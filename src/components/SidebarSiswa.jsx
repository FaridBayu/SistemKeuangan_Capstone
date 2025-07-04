import React from 'react';
import { NavLink } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/Sidebar.css';

import IconSPP from '../assets/icon/RiwayatSPP.png';
import money   from '../assets/icon/money.png';

function Sidebar({ onClose = () => {} }) {
  /* Tutup sidebar jika di perangkat mobile */
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <div className="sidebar d-flex flex-column text-white p-3">
      {/* Judul */}
      <div className="mb-1">
        <h5 className="text-uppercase fw-bold pb-2">Siswa</h5>
        <hr></hr>
      </div>

      {/* Menu */}
      <ul className="nav nav-pills flex-column">
        <li className="nav-item mb-2">
          <NavLink
            to="/RiwayatSPP-Siswa"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${isActive ? 'active' : 'text-white'}`
            }
            onClick={handleLinkClick}
          >
            <img src={IconSPP} alt="Riwayat SPP" width={30} height={30} className="me-2" />
            <span>Riwayat SPP </span>
          </NavLink>
        </li>

        <li className="nav-item mb-2">
          <NavLink
            to="/RiwayatEmoney-Siswa"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${isActive ? 'active' : 'text-white'}`
            }
            onClick={handleLinkClick}
          >
            <img src={money} alt="E-Money" width={30} height={30} className="me-2" />
            <span>E-Money</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
