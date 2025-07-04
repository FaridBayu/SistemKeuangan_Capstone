import React from 'react';
import { NavLink } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/Sidebar.css';

import IconSPP     from '../assets/icon/RiwayatSPP.png';
import money       from '../assets/icon/money.png';
import statussiswa from '../assets/icon/statusiswa.png';

function Sidebar({ onClose = () => {} }) {
  /* Tutup sidebar hanya di perangkat mobile */
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <div className="sidebar d-flex flex-column text-white p-3">
      {/* Judul */}
      <div className="mb-1">
        <h5 className="text-uppercase fw-bold pb-2">Kepala Sekolah</h5>
        <hr></hr>
      </div>

      <ul className="nav nav-pills flex-column">
        <li className="nav-item mb-2">
          <NavLink
            to="/MonitoringSPP-KepalaSekolah"
            className="nav-link text-white d-flex align-items-center"
            onClick={handleLinkClick}
          >
            <img src={IconSPP} alt="Riwayat SPP" width={30} height={30} className="me-2" />
            <span>Monitoring SPP</span>
          </NavLink>
        </li>

        <li className="nav-item mb-2">
          <NavLink
            to="/MonitoringEmoney-KepalaSekolah"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${isActive ? 'active' : 'text-white'}`
            }
            onClick={handleLinkClick}
          >
            <img src={money} alt="E-Money" width={30} height={30} className="me-2" />
            <span>Monitoring E-Money</span>
          </NavLink>
        </li>

        <li className="nav-item mb-2">
          <NavLink
            to="/MonitoringBeasiswa-KepalaSekolah"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${isActive ? 'active' : 'text-white'}`
            }
            onClick={handleLinkClick}
          >
            <img src={statussiswa} alt="Siswa Beasiswa" width={30} height={30} className="me-2" />
            <span>Monitoring Siswa Beasiswa</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
