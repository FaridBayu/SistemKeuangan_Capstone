import React, { useState, useEffect } from "react";
import { Form, Table, Pagination } from "react-bootstrap";
import axios from "axios";
import linkTest from "../../srcLink";

const KPMonitoringSPP = () => {
  const [students, setStudents]   = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [filterKelas, setFilterKelas]       = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [searchTerm, setSearchTerm]         = useState("");
  const [currentPage, setCurrentPage]       = useState(1);

  /* ───────────────────── Request data tiap perubahan filter ───────────────────── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${linkTest}spp`, {
          params: {
            input:    searchTerm,       // kata kunci nama siswa
            kelas:    filterKelas,      // 7 / 8 / 9  ("" = semua)
            semester: filterSemester,   // 1 / 2 / "" (semua)
            page:     currentPage,      // halaman (mulai 1)
          },
          headers: {
            "ngrok-skip-browser-warning": "true",
            Accept: "application/json",
          },
        });

        if (data.status === "success") {
          setStudents(data.data || []);
          setTotalPages(data.totalPages || 1);
        } else {
          setStudents([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Gagal fetch data:", err);
        setStudents([]);
        setTotalPages(1);
      }
    };

    fetchData();
  }, [filterKelas, filterSemester, searchTerm, currentPage]);

  /* ────────────────────────── Helpers ────────────────────────── */
  const formatRupiah = (val) => {
    const num = Number(val);
    if (!val || val === "-" || isNaN(num)) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatSemester = (sem) => {
  const num = Number(sem);          // pastikan number
  switch (num) {
    case 1: return "Kelas 7 Semester 1";
    case 2: return "Kelas 7 Semester 2";
    case 3: return "Kelas 8 Semester 1";
    case 4: return "Kelas 8 Semester 2";
    case 5: return "Kelas 9 Semester 1";
    case 6: return "Kelas 9 Semester 2";
    default: return `Semester ${sem}`;  // fallback
  }
};

  const renderPagination = () => (
    <Pagination className="justify-content-center">
      <Pagination.Prev
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
      />
      <Pagination.Item active>{currentPage}</Pagination.Item>
      <Pagination.Next
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
      />
    </Pagination>
  );

  /* ──────────────────────────── UI ──────────────────────────── */
  return (
    <div className="p-4">
      <h2 className="mb-4">Monitoring Pembayaran SPP</h2>

      {/* Filter */}
      <div className="d-flex gap-3 mb-3">
        <Form.Select
          value={filterKelas}
          onChange={(e) => {
            setCurrentPage(1);          // reset halaman
            setFilterKelas(e.target.value);
          }}
        >
          <option value="">Semua Kelas</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
        </Form.Select>

        <Form.Select
          value={filterSemester}
          onChange={(e) => {
            setCurrentPage(1);
            setFilterSemester(e.target.value);
          }}
        >
          <option value="">Semua Semester</option>
          <option value="1">Kelas 7 Semester 1</option>
          <option value="2">Kelas 7 Semester 2</option>
          <option value="3">Kelas 8 Semester 1</option>
          <option value="4">Kelas 8 Semester 2</option>
          <option value="5">Kelas 9 Semester 1</option>
          <option value="6">Kelas 9 Semester 2</option>
        </Form.Select>
      </div>

      {/* Search */}
      <div className="mb-3">
        <Form.Control
          type="text"
          placeholder="Cari Nama Siswa"
          value={searchTerm}
          onChange={(e) => {
            setCurrentPage(1);
            setSearchTerm(e.target.value);
          }}
        />
      </div>

      {/* Table */}
      <h4 className="py-3">Tabel Siswa</h4>
      <Table bordered hover>
        <thead>
          <tr>
            <th>NISN</th>
            <th>Nama Siswa</th>
            <th>Kelas</th>
            <th>Semester</th>
            <th>Status</th>
            <th>Nominal Dibayar</th>
            <th>Tunggakan</th>
            <th>Tanggal Bayar</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((s) => (
              <tr key={`${s.id_spp}-${s.id_siswa}`}>
                <td>{s.id_siswa}</td>
                <td>{s.nama_lengkap}</td>
                <td>{s.kelas}</td>
                <td>{formatSemester(s.semester)}</td>
                <td>
                  <span
                    className={`badge ${
                      s.status === "Lunas" ? "bg-success" : "bg-warning text-dark"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td>{formatRupiah(s.nominal_dibayar)}</td>
                <td>{formatRupiah(s.tunggakan)}</td>
                <td>
                  {s.tanggal_bayar === "-"
                    ? "-"
                    : new Date(s.tanggal_bayar).toLocaleDateString("id-ID")}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center text-muted">
                Tidak ada data yang cocok.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {totalPages > 1 && renderPagination()}
    </div>
  );
};

export default KPMonitoringSPP;
