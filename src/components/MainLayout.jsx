// src/layouts/MainLayout.js
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import NavbarHeading       from './NavbarHeading';
import SidebarAdmin        from './SidebarAdmin';
import SidebarSiswa        from './SidebarSiswa';
import SidebarOrtu         from './SidebarOrtu';
import SidebarKepalaSekolah from './SidebarKepalaSekolah';
import SidebarSuperAdmin   from './SidebarSuperAdmin';


const MainLayout = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/Login';

  /* Redirect jika belum login */
  useEffect(() => {
    const role = Cookies.get('role');
    if (!role) navigate('/Login');
  }, [navigate]);

  /* Handler buka/tutup sidebar  */
  const toggleSidebar = () => setShowSidebar((prev) => !prev);
  const closeSidebar  = () => setShowSidebar(false);

  /* Kirim Sidebar sesuai role */
  const renderSidebar = () => {
    const role = Cookies.get('role');

    /* fungsi tutup sidebar khusus mobile */
    const onCloseMobile = () => {
      if (window.innerWidth <= 768) {
        setShowSidebar(false);
      }
    };

    const sidebarProps = { onClose: onCloseMobile };

    switch (role) {
      case 'admin':          return <SidebarAdmin        {...sidebarProps} />;
      case 'siswa':          return <SidebarSiswa        {...sidebarProps} />;
      case 'orang_tua':           return <SidebarOrtu         {...sidebarProps} />;
      case 'kepala_sekolah': return <SidebarKepalaSekolah {...sidebarProps} />;
      case 'super_admin':    return <SidebarSuperAdmin   {...sidebarProps} />;
      default:               return null;
    }
  };

  /* ───────── Layout ───────── */
  return (
    <>
      {isLoginPage ? (
        /* Halaman Login: tampilkan konten saja */
        <Outlet />
      ) : (
        /* Halaman selain Login: tampilkan Navbar + Sidebar */
        <div className="main-layout-container d-flex">

          {/* Navbar (selalu di atas) */}
          <NavbarHeading
            onToggleSidebar={toggleSidebar}
            closeSidebar={closeSidebar}
            sidebarOpen={showSidebar}
          />

          {/* Body (sidebar + konten) */}
          <div className="main-body d-flex">

            {/* Sidebar (kiri) */}
            <div
              className={`sidebar ${
                showSidebar ? 'sidebar-show' : 'sidebar-hidden'
              } bg-primary text-white`}
            >
              {renderSidebar()}
            </div>

            {/* Konten utama */}
            <div
              className={`flex-grow-1 p-3 ${
                showSidebar ? 'with-sidebar' : 'full-width'
              }`}
            >
              <Outlet />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MainLayout;
