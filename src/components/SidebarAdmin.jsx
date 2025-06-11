import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/Sidebar.css';
import { NavLink } from 'react-router-dom';
import IconSPP from '../assets/icon/RiwayatSPP.png';
import money from '../assets/icon/money.png';
import pembayaranspp from '../assets/icon/pembayaranSPP.png';
import statussiswa from '../assets/icon/statusiswa.png';

function Sidebar() {
  return (
    <div className='sidebar d-flex flex-column text-white p-3 '>
      {/* Judul / Menu */}
      <div className='mb-4'>
        <h5 className='text-uppercase fw-bold'>Admin</h5>
      </div>

      <ul className='nav nav-pills flex-column'>
        <li className='nav-item mb-2'>
          <NavLink to='/MonitoringSPP' className='nav-link text-white d-flex align-items-center'>
            <img src={IconSPP} alt='Riwayat SPP' width={30} height={30} className='me-2'
            />
            <span>Monitoring SPP</span>
          </NavLink>
        </li>

        <li className='nav-item mb-2'>
          <NavLink to='/PengaturanEmoney' className={({ isActive }) =>
            `nav-link d-flex align-items-center ${isActive ? 'active' : 'text-white'}`
          }>
            <img src={money} alt='money' width={30} height={30} className='me-2'
            />
            <span>Pengaturan E-Money</span>
          </NavLink>
        </li>

        <li className='nav-item mb-2'>
          <NavLink to='/StatusSiswa' className={({ isActive }) =>
            `nav-link d-flex align-items-center ${isActive ? 'active' : 'text-white'}`
          }>
            <img src={statussiswa} alt='status siswa' width={30} height={30} className='me-2'
            />
            <span>Status Siswa</span>
          </NavLink>
        </li>

        <li className='nav-item mb-2'>
          <NavLink to='/PembayaranSPP' className={({ isActive }) =>
            `nav-link d-flex align-items-center ${isActive ? 'active' : 'text-white'}`
          }>
            <img src={pembayaranspp} alt='Riwayat SPP' width={35} height={35} className='me-2'
            />
            <span>Pembayaran SPP</span>
          </NavLink>
        </li>

      </ul>


      <div className='logout-link'>
        <hr />
        <ul className="nav nav-pills flex-column">
          <li className='nav-item'>
            <NavLink
              to='/Login'
              className={({ isActive }) =>
                `nav-link d-flex align-items-center ${isActive ? 'active' : 'text-white'}`
              }
            >
              <i className='bi bi-power me-2'></i>
              <span>Logout</span>
            </NavLink>
          </li>
        </ul>
      </div>

    </div >
  );
}

export default Sidebar; 