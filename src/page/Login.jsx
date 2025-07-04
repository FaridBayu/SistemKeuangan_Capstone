import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginImage from '../assets/login.png';
import '../css/Login.css';
import NavbarHeading from '../components/LoginComp/NavHeadLogin';
import logoSekolah from '../assets/logo_login.png';
import Cookies from 'js-cookie';
import linkTest from '../srcLink';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email dan password wajib diisi');
      return;
    }

    try {
      const res  = await fetch(`${linkTest}api/auth/login`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.status === 'success') {
        const { token, user } = data;

        /* simpan token & role di cookie */
        Cookies.set('token', token, { sameSite: 'strict', secure: false });
        Cookies.set('role',  user.role,  { sameSite: 'strict', secure: false });
        Cookies.set('user', JSON.stringify(user), { sameSite: 'strict', secure: false });

        console.log( Cookies.get('user'));
      

        /* navigasi berdasarkan role*/
        switch (user.role) {
          case 'admin':           navigate('/MonitoringSPP-admin');       break;
          case 'super_admin':     navigate('/ManajemenPengguna');         break;
          case 'kepala_sekolah':  navigate('/MonitoringSPP-KepalaSekolah');break;
          case 'orang_tua':            navigate('/RiwayatSPP-ortu');           break;
          case 'siswa':           navigate('/RiwayatSPP-Siswa');          break;
          default: setError('Role tidak dikenali');
        }
      } else {
        setError(data.message || 'Login gagal');
      }

    } catch (err) {
      console.error('Terjadi kesalahan:', err);
      setError('Gagal menghubungi server. Coba lagi nanti.');
    }
  };

  return (
    <>
      <NavbarHeading />
      <div className="Login container-fluid p-0 m-0" style={{ height: '100vh' }}>
        <div className="card shadow-lg border-0 rounded-0 h-100 w-100">
          <div className="row g-0 h-100">

            {/* Gambar kiri */}
            <div className="col-md-6 d-none d-md-block">
              <img
                src={loginImage}
                alt="Login"
                className="img-fluid h-100"
                style={{ objectFit: 'cover', width: '100vh' }}
              />
            </div>

            {/* Form kanan */}
            <div className="col-md-6 d-flex align-items-start justify-content-center bg-white py-5 px-4 pb-5 pb-md-0">

              <div style={{ width: '80%', maxWidth: '350px' }}>
                <div className="logo-img">
                  <img src={logoSekolah} alt="Logo Sekolah" />
                </div>
                <h5 className="mb-4 fw-bold">
                  Selamat Datang Di PPMBS Prambanan
                </h5>

                <form onSubmit={handleLogin}>
                  <div className="mb-2">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Masukkan alamat Email anda"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label fw-semibold">Password</label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control pe-5"
                        placeholder="Masukkan password anda"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        role="button"
                        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </span>
                    </div>
                  </div>

                  {error && <div className="text-danger mb-3">{error}</div>}

                  <div className="d-grid gap-2 py-2">
                    <button type="submit" className="btn btn-primary ">Log in</button>
                  </div>

                  <div className="mt-1 text-center ">
                    <a href="#" className="text-primary">Forgot password?</a>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
