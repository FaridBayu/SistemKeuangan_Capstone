import React, { useEffect, useState, useRef } from 'react'; 
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/NavbarHeading.css';
import logoSekolah from '../assets/icon/logosekolah.png';
import Cookies from 'js-cookie';

function NavbarHeading({
  onToggleSidebar,
  closeSidebar = () => {},
  sidebarOpen  = false
}) {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const menuRef   = useRef(null);
  const navigate  = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const cb = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', cb);
    return () => window.removeEventListener('resize', cb);
  }, []);

  useEffect(() => {
    const cookieUser = Cookies.get('user');
    if (cookieUser) setUser(JSON.parse(cookieUser));
  }, []);

  // 🆕 hanya aktif saat dropdown terbuka
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        hideMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const hideMenu = () => {
    if (!showMenu) return;
    setDropdownVisible(false);
    setTimeout(() => setShowMenu(false), 200);
  };

  const handleLogout = () => {
    Cookies.remove('user');
    navigate('/login');
  };

  const handleUserIconClick = () => {
    if (isMobile && sidebarOpen) closeSidebar();

    if (!showMenu) {
      setShowMenu(true);
      setTimeout(() => setDropdownVisible(true), 20);
    } else {
      hideMenu();
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light w-100 position-relative">
      <div className="container-fluid">
        <button className="btn" onClick={onToggleSidebar}>
          <i className="bi bi-list fs-3" />
        </button>

        <div className="position-absolute start-50 translate-middle-x">
          <img src={logoSekolah} alt="Logo Sekolah" style={{ width: 100, height: 50 }} />
        </div>

        <div
          className="d-flex align-items-center justify-content-start ps-3 gap-2 position-relative"
          ref={menuRef}
        >
          {user && (
            <>
              <span className="fw-bold d-none d-lg-inline">
                {user.nama}{' '}
                <small className="text-muted">({user.role.replace('_', ' ')})</small>
              </span>

              <i
                className="bi bi-person-circle fs-4"
                style={{ cursor: 'pointer' }}
                onClick={handleUserIconClick}
              />

              {showMenu && (
                <div
                  className={`user-dropdown shadow-sm ${
                    dropdownVisible ? 'visible' : ''
                  }`}
                >
                  <div
                    className="user-dropdown-item"
                    onClick={() => {
                      hideMenu();
                      navigate('/profile');
                    }}
                  >
                    <i className="bi bi-person me-2" />My&nbsp;Profile
                  </div>

                  <div className="dropdown-divider" />

                  <div
                    className="user-dropdown-item"
                    onClick={() => {
                      hideMenu();
                      handleLogout();
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-2" />Log&nbsp;Out
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavbarHeading;
