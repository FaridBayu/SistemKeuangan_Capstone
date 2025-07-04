// src/pages/MonitoringSPP.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Form, Table, Pagination, Modal, Button, Container} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { debounce } from "lodash";
import linkTest from "../../srcLink";
import Cookies from "js-cookie";

const LIMIT = 10;

const MonitoringSPP = () => {
  const navigate = useNavigate();
  const token = Cookies.get("token");

  /* data & filter */
  const [students, setStudents] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [filterKelas, setFilterKelas] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /*  token expired  */
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const handleExpiredClose = () => {
    setShowExpiredModal(false);
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("user");
    navigate("/login", { replace: true });
  };

  /*  debounce search  */
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

  /* fetch data */
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
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
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

        const isExpired =
          err.response &&
          err.response.status === 500 &&
          typeof err.response.data?.message === "string" &&
          err.response.data.message.toLowerCase().includes("jwt expired");

        if (isExpired) {
          setShowExpiredModal(true);
        } else {
          console.error("Gagal fetch:", err);
          setStudents([]);
          setTotalPages(1);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();      
      debounceSearch.cancel(); 
    };
    
  }, [filterKelas, filterSemester, debouncedSearchTerm, currentPage,token, debounceSearch]);

  /* ─tampilan uang rp */
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

  const renderPagination = () =>
    totalPages > 1 && (
      <Pagination className="justify-content-center pt-3">
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

  /* konten */
  return (
    <>
      {/* token expired */}
      <Modal
        show={showExpiredModal}
        onHide={handleExpiredClose}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Sesi Anda Telah Habis</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Token Anda telah kedaluwarsa. Silakan login kembali untuk melanjutkan.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleExpiredClose}>
            Ke Halaman Login
          </Button>
        </Modal.Footer>
      </Modal>

      {/*  Konten utama  */}
      <Container className="mt-4 pb-5 pb-sm-0">
        <h2 className="mb-4">Monitoring Pembayaran SPP</h2>

        {/* Filter kelas & semester */}
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
                    s.tanggal_terakhir_bayar !== "-"
                      ? new Date(s.tanggal_terakhir_bayar).toLocaleDateString(
                          "id-ID"
                        )
                      : "-"}
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

        {renderPagination()}
      </Container>
    </>
  );
};

export default MonitoringSPP;
