import React, { useState, useEffect, useMemo } from "react";
import {
  Form,
  Table,
  Pagination,
  Modal,
  Button,
} from "react-bootstrap";
import axios from "axios";
import { debounce } from "lodash";
import linkTest from "../../srcLink";
import Cookies from "js-cookie";

const LIMIT = 10;

/* ───────── Modal sesi kedaluwarsa ───────── */
const SessionExpiredModal = ({ show }) => {
  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("user");
    window.location.href = "/login";
  };

  return (
    <Modal show={show} backdrop="static" keyboard={false} centered>
      <Modal.Header>
        <Modal.Title>Sesi Anda Telah Habis</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Token Anda kedaluwarsa. Silakan login kembali untuk melanjutkan.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleLogout}>
          Kembali ke Login
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
/* ─────────────────────────────────────────── */

const KPMonitoringSPP = () => {
  const token = Cookies.get("token");
  const [students, setStudents] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [filterKelas, setFilterKelas] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showExpiredModal, setShowExpiredModal] = useState(false);


  /* util token expired */
  const isExpired = (err) =>
    err.response &&
    err.response.status === 500 &&
    typeof err.response.data?.message === "string" &&
    err.response.data.message.toLowerCase().includes("jwt expired");

  /* debounce search */
  const debounceSearch = useMemo(
    () =>
      debounce((val) => {
        setDebouncedSearchTerm(val);
      }, 1250),
    []
  );

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setCurrentPage(1);
    debounceSearch(val);
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${linkTest}api/spp`, {
          params: {
            input: debouncedSearchTerm,
            kelas: filterKelas,
            semester: filterSemester,
            page: currentPage,
            limit: LIMIT,
          },
          headers: { "ngrok-skip-browser-warning": "true", Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (data.status === "success") {
          setStudents(data.data || []);
          setTotalPages(data.pagination?.totalPage || 1);
        } else {
          setStudents([]);
          setTotalPages(1);
        }
      } catch (err) {
        if (axios.isCancel(err)) return;

        if (isExpired(err)) {
          setShowExpiredModal(true);
          return;
        }

        console.error("Gagal fetch:", err);
        setStudents([]);
        setTotalPages(1);
      }
    };

    fetchData();

    return () => {
      controller.abort();
      debounceSearch.cancel();
    };
  }, [debouncedSearchTerm, filterKelas, filterSemester, currentPage, debounceSearch]);

  const rupiah = (v) =>
    !v || isNaN(v)
      ? "-"
      : new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(v);

  const semText = (s) =>
    [
      "",
      "Kelas 7 Semester 1",
      "Kelas 7 Semester 2",
      "Kelas 8 Semester 1",
      "Kelas 8 Semester 2",
      "Kelas 9 Semester 1",
      "Kelas 9 Semester 2",
    ][s] || `Semester ${s}`;

  return (
    <div className="p-4">
      {/* modal session expired */}
      <SessionExpiredModal show={showExpiredModal} />

      <h2 className="mb-4">Monitoring Pembayaran SPP</h2>

      {/* Filter */}
      <div className="d-flex gap-3 mb-3">
        <Form.Select
          value={filterKelas}
          onChange={(e) => {
            setCurrentPage(1);
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
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <option key={s} value={s}>
              {semText(s)}
            </option>
          ))}
        </Form.Select>
      </div>

      {/* Search */}
      <Form.Control
        className="mb-3"
        placeholder="Cari Nama Siswa"
        value={searchTerm}
        onChange={handleSearchChange}
      />

      {/* Table */}
      <h4 className="py-3">Tabel Siswa</h4>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>NISN</th>
            <th>Nama Siswa</th>
            <th>Kelas</th>
            <th>Semester</th>
            <th>Status</th>
            <th>Nominal Dibayar</th>
            <th>Tunggakan</th>
            <th>Tanggal Bayar Terakhir</th>
          </tr>
        </thead>
        <tbody>
          {students.length ? (
            students.map((s) => (
              <tr key={`${s.nisn}-${s.semester}`}>
                <td>{s.nisn}</td>
                <td>{s.nama_lengkap}</td>
                <td>{s.kelas}</td>
                <td>{semText(s.semester)}</td>
                <td>
                  <span
                    className={`badge ${
                      s.status === "Lunas"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td>{rupiah(s.total_pembayaran)}</td>
                <td>{rupiah(s.tunggakan)}</td>
                <td>
                  {s.tanggal_terakhir_bayar &&
                  s.tanggal_terakhir_bayar !== "-" ? (
                    new Date(s.tanggal_terakhir_bayar).toLocaleDateString("id-ID")
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center text-muted">
                Tidak ada data.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* pagination */}
      {totalPages > 1 && (
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
      )}
    </div>
  );
};

export default KPMonitoringSPP;
