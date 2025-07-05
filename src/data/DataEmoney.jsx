// src/api/getEmoneyData.js
import axios from 'axios';
import linkTest from '../srcLink';

const getEmoneyData = async () => {
  try {
    const res = await axios.get(
      `${linkTest}Emoney/search?input=&page=1`,
      {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
        },
      }
    );

    // Ubah struktur data agar cocok dengan tabel kamu
    const mappedData = res.data.data.map(item => ({
      nisn: item.id_siswa,
      name: item.nama_lengkap,
      kelas: item.kelas,
      saldo: item.nominal,
    }));

    return mappedData;
  } catch (err) {
    console.error('Gagal mengambil data e-money:', err);
    return [];
  }
};

export default getEmoneyData;
