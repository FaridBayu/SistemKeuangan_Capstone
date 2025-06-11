import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

import NavbarHeading from './NavbarHeading';
import SidebarAdmin from './SidebarAdmin';
import SidebarSiswa from './SidebarSiswa';
import SidebarOrtu from './SidebarOrtu';
import SidebarKepalaSekolah from './SidebarKepalaSekolah';
import SidebarSuperAdmin from './SidebarSuperAdmin';

const MainLayout = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = Cookies.get('role');
    if (!storedRole) {
      navigate('/Login');
    }
  }, [navigate]);

  const toggleSidebar = () => setShowSidebar(!showSidebar);
  const isLoginPage = location.pathname === '/Login';

  const renderSidebar = () => {
    const currentRole = Cookies.get('role');
    switch (currentRole) {
      case 'admin': return <SidebarAdmin />;
      case 'siswa': return <SidebarSiswa />;
      case 'ortu': return <SidebarOrtu />;
      case 'kepala_sekolah': return <SidebarKepalaSekolah />;
      case 'super_admin': return <SidebarSuperAdmin />;
      default: return null;
    }
  };

  return (
    <>
      {!isLoginPage && (
        <div className="main-layout-container d-flex">
          <div className="navbar-heading">
            <NavbarHeading onToggleSidebar={toggleSidebar} />
          </div>
          <div className="main-body d-flex">
            <div className={`sidebar ${showSidebar ? 'sidebar-show' : 'sidebar-hidden'} bg-primary text-white`}>
              {renderSidebar()}
            </div>
            <div className={`flex-grow-1 p-3 ${!isLoginPage ? (showSidebar ? 'with-sidebar' : 'full-width') : ''}`}>

            <div className="content">
              <Outlet />
            </div>
            </div>
          </div>
        </div>
      )}

      {isLoginPage && <Outlet />}
    </>
  );
};

export default MainLayout;
