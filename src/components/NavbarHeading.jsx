import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/NavbarHeading.css';
import logoSekolah from '../assets/icon/logosekolah.png';
import Cookies from 'js-cookie';

function NavbarHeading({ onToggleSidebar }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cookieUser = Cookies.get('user');
    if (cookieUser) {
      setUser(JSON.parse(cookieUser));
    }
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light w-100">
      <div className="container-fluid">
        <button className="btn" onClick={onToggleSidebar}>
          <i className="bi bi-list fs-3"></i>
        </button>

        <div className="position-absolute start-50 translate-middle-x">
          <img src={logoSekolah} alt="Logo Sekolah" style={{ width: 100, height: 50 }} />
        </div>

        <div className="d-flex align-items-center justify-content-start ps-3 gap-2">
          {user && (
            <>
              <span className="fw-bold d-none d-lg-inline">
                {user.nama} <small className="text-muted">({user.role.replace('_', ' ')})</small>
              </span>
              <i className="bi bi-person-circle fs-4"></i>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavbarHeading;
