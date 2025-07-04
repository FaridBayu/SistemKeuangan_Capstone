import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import MainLayout from './components/MainLayout';
import RoleBasedRoute from "./components/RoleBasedRoute";
import Login from './page/Login';
import Unauthorized from "./page/Unauthorized";

import StatusSiswa from './page/Admin/StatusSiswa';
import InputEmoney from './page/Admin/PengaturanEmoney';
import MonitoringSPP from './page/Admin/MonitoringSPP';
import PembayaranSPP from './page/Admin/PembayaranSPP';
import KPMonitoringSPP from './page/KepalaSekolah/KPMonitoringSPP';
import KPMonitoringEmoney from './page/KepalaSekolah/KPMonitoringEmoney';
import KPMonitoringBeasiswa from './page/KepalaSekolah/KPMonitoringBeasiswa';
import RiwayatSPP from './page/OrtuSiswa/RiwayatSPP';
import RiwayatEmoney from './page/OrtuSiswa/RiwayatEmoney';
import RiwayatEmoneySiswa from './page/Siswa/RiwayatEmoneySiswa';
import RiwayatSPPSiswa from './page/Siswa/RiwayatSPPSiswa';
import ManajemenPengguna from './page/SuperAdmin/ManajemenPengguna';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Login" />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/" element={<MainLayout />}>
           {/* SUPER ADMIN only */}
          <Route element={<RoleBasedRoute allowedRoles={["super_admin"]} />}>
            <Route path="/ManajemenPengguna" element={<ManajemenPengguna />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>

          {/* ADMIN */}
          <Route element={<RoleBasedRoute allowedRoles={["admin"]} />}>
            <Route path="/PengaturanBeasiswasiswa-admin" element={<StatusSiswa />} />
            <Route path="/PengaturanEmoney-admin" element={<InputEmoney />} />
            <Route path="/MonitoringSPP-admin" element={<MonitoringSPP />} />
            <Route path="/PembayaranSPP-admin" element={<PembayaranSPP />} />
          </Route>

          {/* KEPALA SEKOLAH */}
          <Route element={<RoleBasedRoute allowedRoles={["kepala_sekolah"]} />}>
            <Route path="/MonitoringSPP-KepalaSekolah" element={<KPMonitoringSPP />} />
            <Route path="/MonitoringEmoney-KepalaSekolah" element={<KPMonitoringEmoney />} />
            <Route path="/MonitoringBeasiswa-KepalaSekolah" element={<KPMonitoringBeasiswa />} />
          </Route>

          {/* ORANG TUA */}
          <Route element={<RoleBasedRoute allowedRoles={["orang_tua"]} />}>
            <Route path="/RiwayatSPP-ortu" element={<RiwayatSPP />} />
            <Route path="/RiwayatEmoney-ortu" element={<RiwayatEmoney />} />
          </Route>

          {/* SISWA */}
          <Route element={<RoleBasedRoute allowedRoles={["siswa"]} />}>
            <Route path="/RiwayatEmoney-Siswa" element={<RiwayatEmoneySiswa />} />
            <Route path="/RiwayatSPP-Siswa" element={<RiwayatSPPSiswa />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
