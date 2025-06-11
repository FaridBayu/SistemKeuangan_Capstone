const DataSiswa = [
  // Kelas 9A (sebelumnya 6A)
  { nisn: "6001", name: "Andi Pratama", kelas: "9A", status: "aktif" },
  { nisn: "6002", name: "Siti Zahra", kelas: "9A", status: "aktif" },
  { nisn: "6003", name: "Rian Saputra", kelas: "9A", status: "aktif" },
  { nisn: "6004", name: "Lina Kurnia", kelas: "9A", status: "aktif" },
  { nisn: "6005", name: "Bagus Hidayat", kelas: "9A", status: "aktif" },
  { nisn: "6006", name: "Fira Lestari", kelas: "9A", status: "aktif" },
  { nisn: "6007", name: "Yusuf Ramadhan", kelas: "9A", status: "aktif" },
  { nisn: "6008", name: "Tina Safitri", kelas: "9A", status: "aktif" },
  { nisn: "6009", name: "Hana Maulida", kelas: "9A", status: "aktif" },
  { nisn: "6010", name: "Dedi Firmansyah", kelas: "9A", status: "aktif" },

  // Kelas 9B (sebelumnya 6B)
  { nisn: "6011", name: "Ayu Wulandari", kelas: "9B", status: "aktif" },
  { nisn: "6012", name: "Bima Nugroho", kelas: "9B", status: "aktif" },
  { nisn: "6013", name: "Citra Anggraini", kelas: "9B", status: "aktif" },
  { nisn: "6014", name: "Danu Prakoso", kelas: "9B", status: "aktif" },
  { nisn: "6015", name: "Eka Rizki", kelas: "9B", status: "aktif" },
  { nisn: "6016", name: "Fitriani Dewi", kelas: "9B", status: "aktif" },
  { nisn: "6017", name: "Gilang Saputra", kelas: "9B", status: "aktif" },
  { nisn: "6018", name: "Hana Fauziah", kelas: "9B", status: "aktif" },
  { nisn: "6019", name: "Indra Maulana", kelas: "9B", status: "aktif" },
  { nisn: "6020", name: "Julia Putri", kelas: "9B", status: "aktif" },

  // Kelas 7A
  { nisn: "7001", name: "Dina Maulida", kelas: "7A", status: "aktif" },
  { nisn: "7002", name: "Rafi Pratama", kelas: "7A", status: "aktif" },
  { nisn: "7003", name: "Indah Permata", kelas: "7A", status: "aktif" },
  { nisn: "7004", name: "Yusuf Hidayat", kelas: "7A", status: "aktif" },
  { nisn: "7005", name: "Citra Dewi", kelas: "7A", status: "aktif" },
  { nisn: "7006", name: "Galang Nugraha", kelas: "7A", status: "aktif" },
  { nisn: "7007", name: "Salsabila Putri", kelas: "7A", status: "aktif" },
  { nisn: "7008", name: "Rizky Ramadhan", kelas: "7A", status: "aktif" },
  { nisn: "7009", name: "Anisa Nurhaliza", kelas: "7A", status: "aktif" },
  { nisn: "7010", name: "Zulham Fikri", kelas: "7A", status: "non-aktif" },

  // Kelas 7B
  { nisn: "7011", name: "Dani Hidayat", kelas: "7B", status: "aktif" },
  { nisn: "7012", name: "Evi Lestari", kelas: "7B", status: "aktif" },
  { nisn: "7013", name: "Fajar Nugroho", kelas: "7B", status: "aktif" },
  { nisn: "7014", name: "Gita Ramadhani", kelas: "7B", status: "aktif" },
  { nisn: "7015", name: "Hadi Prasetyo", kelas: "7B", status: "aktif" },
  { nisn: "7016", name: "Intan Sari", kelas: "7B", status: "aktif" },
  { nisn: "7017", name: "Joko Susanto", kelas: "7B", status: "aktif" },
  { nisn: "7018", name: "Kiki Amelia", kelas: "7B", status: "aktif" },
  { nisn: "7019", name: "Lukmanul Hakim", kelas: "7B", status: "aktif" },
  { nisn: "7020", name: "Maya Salsabila", kelas: "7B", status: "aktif" },

  // Kelas 8A
  { nisn: "1234", name: "Agus Rahman", kelas: "8A", status: "aktif" },
  { nisn: "8001", name: "Nur Azizah", kelas: "8A", status: "aktif" },
  { nisn: "8002", name: "Hendra Saputra", kelas: "8A", status: "aktif" },
  { nisn: "8003", name: "Nina Anggraini", kelas: "8A", status: "aktif" },
  { nisn: "8004", name: "Yogi Setiawan", kelas: "8A", status: "aktif" },
  { nisn: "8005", name: "Siti Maesaroh", kelas: "8A", status: "aktif" },
  { nisn: "8006", name: "Eka Wulandari", kelas: "8A", status: "aktif" },
  { nisn: "8007", name: "Ahmad Rizal", kelas: "8A", status: "aktif" },
  { nisn: "8008", name: "Nabila Khairunnisa", kelas: "8A", status: "aktif" },
  { nisn: "8009", name: "Rian Hermawan", kelas: "8A", status: "aktif" },

  // Kelas 8B
  { nisn: "8010", name: "Andika Pratama", kelas: "8B", status: "aktif" },
  { nisn: "8011", name: "Bella Salsabila", kelas: "8B", status: "aktif" },
  { nisn: "8012", name: "Cahya Nur", kelas: "8B", status: "aktif" },
  { nisn: "8013", name: "Dimas Ardiansyah", kelas: "8B", status: "aktif" },
  { nisn: "8014", name: "Elsa Putri", kelas: "8B", status: "aktif" },
  { nisn: "8015", name: "Farhan Fauzi", kelas: "8B", status: "aktif" },
  { nisn: "8016", name: "Gita Novita", kelas: "8B", status: "aktif" },
  { nisn: "8017", name: "Hana Salma", kelas: "8B", status: "aktif" },
  { nisn: "8018", name: "Ivan Kurniawan", kelas: "8B", status: "aktif" },
  { nisn: "8019", name: "Jihan Maulani", kelas: "8B", status: "aktif" },
];

export default DataSiswa;
