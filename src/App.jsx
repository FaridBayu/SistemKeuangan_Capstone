import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import MainLayout from './components/MainLayout';
import Login from './page/Login';

import StatusSiswa from './page/Admin/StatusSiswa';
import InputEmoney from './page/Admin/PengaturanEmoney';
import MonitoringSPP from './page/Admin/MonitoringSPP';
import PembayaranSPP from './page/Admin/PembayaranSPP';
import KPMonitoringSPP from './page/KepalaSekolah/KPMonitoringSPP';
import KPMonitoringEmoney from './page/KepalaSekolah/KPMonitoringEmoney';
import KPMonitoringBeasiswa from './page/KepalaSekolah/KPMonitoringbeasiswa';
import RiwayatSPP from './page/OrtuSiswa/RiwayatSPP';
import RiwayatEmoney from './page/OrtuSiswa/RiwayatEmoney';
import InfoSPP from './page/OrtuSiswa/InfoSPP';
import RiwayatEmoneySiswa from './page/Siswa/RiwayatEmoneySiswa';
import RiwayatSPPSiswa from './page/Siswa/RiwayatSPPSiswa';
import InfoSPPSiswa from './page/Siswa/InfoSPPSiswa';
import ManajemenPengguna from './page/SuperAdmin/ManajemenPengguna';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Login" />} />
        <Route path="/Login" element={<Login />} />

        {/* Semua halaman setelah login menggunakan layout */}
        <Route path="/" element={<MainLayout />}>
          <Route path="/ManajemenPengguna" element={<ManajemenPengguna />} />
          <Route path="/Statussiswa" element={<StatusSiswa />} />
          <Route path="/PengaturanEmoney" element={<InputEmoney />} />
          <Route path="/MonitoringSPP" element={<MonitoringSPP />} />
          <Route path="/PembayaranSPP" element={<PembayaranSPP />} />
          <Route path="/KPMonitoringSPP" element={<KPMonitoringSPP />} />
          <Route path="/KPMonitoringEmoney" element={<KPMonitoringEmoney />} />
          <Route path="/KPMonitoringBeasiswa" element={<KPMonitoringBeasiswa />} />
          <Route path="/RiwayatSPP" element={<RiwayatSPP />} />
          <Route path="/RiwayatEmoney" element={<RiwayatEmoney />} />
          <Route path="/InfoSPP" element={<InfoSPP />} />
          <Route path="/RiwayatEmoneySiswa" element={<RiwayatEmoneySiswa />} />
          <Route path="/RiwayatSPPSiswa" element={<RiwayatSPPSiswa />} />
          <Route path="/InfoSPPSiswa" element={<InfoSPPSiswa />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
