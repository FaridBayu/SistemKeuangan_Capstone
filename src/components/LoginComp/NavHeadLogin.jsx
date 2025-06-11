import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../css/NavHeadLogin.css"; // pastikan file ini ada
import logoSekolah from "../../assets/icon/logosekolah.png";

function NavHeadLogin() {
  return (
    <nav className="navhead-login">
      <div className="navhead-container">
        <img
          src={logoSekolah}
          alt="Logo Sekolah"
          className="navhead-logo"
        />
      </div>
    </nav>
  );
}

export default NavHeadLogin;