import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginImage from '../assets/login.png';
import '../css/Login.css';
import NavbarHeading from '../components/LoginComp/NavHeadLogin';
import logoSekolah from '../assets/logo_login.png';
import Cookies from 'js-cookie';
import DataUser from '../data/DataUser';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email dan password wajib diisi');
      return;
    }

    const foundUser = DataUser.find(
      user => user.email === email && user.password === password
    );

    if (!foundUser) {
      setError('Email atau password salah');
      return;
    }

    Cookies.set('user', JSON.stringify(foundUser), { expires: 1 });
    Cookies.set('role', foundUser.role, { expires: 1 });

    switch (foundUser.role) {
      case 'admin':
        navigate('/MonitoringSPP');
        break;
      case 'super_admin':
        navigate('/ManajemenPengguna');
        break;
      case 'kepala_sekolah':
        navigate('/KPMonitoringSPP');
        break;
      case 'ortu':
        navigate('/RiwayatSPP');
        break;
      case 'siswa':
        navigate('/RiwayatSPPSiswa');
        break;
      default:
        setError('Role tidak dikenali');
    }
  };


  // const handleLogin = async (e) => {
  //   e.preventDefault();

  //   if (!email || !password) {
  //     setError('Email dan password wajib diisi');
  //     return;
  //   }

  //   try {
  //     const response = await fetch('https://eb77-182-253-131-54.ngrok-free.app/auth/login', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({ email, password })  // ⬅ Kirim sebagai `email`
  //     });

  //     const data = await response.json();

  //     if (data.status === 'success') {
  //       const token = data.token;
  //       const nama = data.name;
  //       const role = data.role;

  //       Cookies.set('token', token);
  //       Cookies.set('nama', nama);
  //       Cookies.set('role', role);

  //       setError('');

  //       // Navigasi berdasarkan role
  //       switch (role) {
  //         case 'admin':
  //           navigate('/MonitoringSPP');
  //           break;
  //         case 'super_admin':
  //           navigate('/ManajemenPengguna');
  //           break;
  //         case 'kepala_sekolah':
  //           navigate('/KPMonitoringSPP');
  //           break;
  //         case 'ortu':
  //           navigate('/RiwayatSPP');
  //           break;
  //         case 'siswa':
  //           navigate('/RiwayatSPPSiswa');
  //           break;
  //         default:
  //           setError('Role tidak dikenali');
  //       }

  //     } else {
  //       setError(data.message || 'Login gagal');
  //     }

  //   } catch (err) {
  //     console.error('Terjadi kesalahan:', err);
  //     setError('Gagal menghubungi server. Coba lagi nanti.');
  //   }
  // };


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
            <div className="col-md-6 d-flex align-items-center justify-content-center bg-white p-5">
              <div style={{ width: '100%', maxWidth: '400px' }}>
                <div className="logo-img">
                  <img src={logoSekolah} alt="Logo Sekolah" />
                </div>
                <h5 className="mb-4 fw-bold">
                  Selamat Datang Di PPMBS Prambanan
                </h5>

                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Masukkan alamat Email anda"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
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

                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary">Log in</button>
                  </div>

                  <div className="mt-3 text-center">
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
