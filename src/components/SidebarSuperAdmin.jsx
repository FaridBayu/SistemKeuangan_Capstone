import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/Sidebar.css';
import { NavLink } from 'react-router-dom';
import IconSPP from '../assets/icon/RiwayatSPP.png'; // Ganti jika ada ikon khusus

function SidebarSuperAdmin() {
  return (
    <div className='sidebar d-flex flex-column text-white p-3'>
      {/* Judul */}
      <div className='mb-4'>
        <h5 className='text-uppercase fw-bold'>Super Admin</h5>
      </div>

      {/* Menu */}
      <ul className='nav nav-pills flex-column'>
        <li className='nav-item mb-2'>
          <NavLink
            to='/ManajemenPengguna'
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${isActive ? 'active' : 'text-white'}`
            }
          >
            <img src={IconSPP} alt='Manajemen Pengguna' width={30} height={30} className='me-2' />
            <span>Manajemen Pengguna</span>
          </NavLink>
        </li>
      </ul>

      {/* Logout */}
      <div className='logout-link mt-auto'>
        <hr />
        <ul className='nav nav-pills flex-column'>
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
    </div>
  );
}

export default SidebarSuperAdmin;
