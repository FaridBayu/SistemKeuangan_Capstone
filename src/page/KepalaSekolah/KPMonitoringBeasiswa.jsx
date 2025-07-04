import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import debounce from "lodash/debounce";
import linkTest from "../../srcLink";
import {
  Container,
  Row,
  Col,
  Form,
  Table,
  Pagination,
  Modal,
  Button,
} from "react-bootstrap";
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

/* helper label beasiswa */
const beasiswaText = (id) =>
  (
    {
      1: "Beasiswa Prestasi",
      2: "Beasiswa Kurang Mampu",
      3: "Beasiswa Yatim Piatu",
      4: "Beasiswa Tahfidz",
    }[id] || `ID ${id}`
  );

const KPMonitoringBeasiswa = () => {
  const token = Cookies.get("token");

  /* ───── state utama ───── */
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  /* filter kelas */
  const [selectedClass, setSelectedClass] = useState("");

  /* filter beasiswa */
  const [selectedFilter, setSelectedFilter] = useState("");
  const [customFilter, setCustomFilter] = useState("");
  const [debouncedCustomFilter, setDebouncedCustomFilter] = useState("");

  /* paging */
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* modal token expired */
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  const didMountRef = useRef(false);

  /* util deteksi jwt expired */
  const isExpired = (err) =>
    err.response &&
    err.response.status === 500 &&
    typeof err.response.data?.message === "string" &&
    err.response.data.message.toLowerCase().includes("jwt expired");

  /* ───── debounce pencarian nama/nisn ───── */
  const debouncedSearch = useMemo(
    () => debounce((val) => setDebouncedSearchTerm(val), 1250),
    []
  );

  /* bersihkan debounce di unmount */
  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  /* panggil debounce setiap searchTerm berubah */
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  /* ───── debounce custom filter beasiswa ───── */
  const debouncedCustom = useMemo(
    () => debounce((val) => setDebouncedCustomFilter(val), 800),
    []
  );

  useEffect(() => () => debouncedCustom.cancel(), [debouncedCustom]);

  useEffect(() => {
    if (selectedFilter === "__OTHER__") {
      debouncedCustom(customFilter);
    }
  }, [customFilter, selectedFilter, debouncedCustom]);

  /* ───── fetch data ───── */
  const fetchBeasiswaData = useCallback(async () => {
    const filterParam =
      selectedFilter === "__OTHER__"
        ? debouncedCustomFilter.trim()
        : selectedFilter;

    try {
      const res = await axios.get(
        `${linkTest}api/beasiswa?input=${encodeURIComponent(
          debouncedSearchTerm
        )}&filter=${encodeURIComponent(
          filterParam
        )}&page=${currentPage}&limit=${LIMIT}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (res.data.status === "success") {
        /* filter kelas di FE */
        const filtered = res.data.data.filter((it) =>
          selectedClass
            ? it.kelas.toLowerCase().startsWith(selectedClass.toLowerCase())
            : true
        );

        const arr = filtered.map((it) => ({
          nisn: it.nisn,
          name: it.nama_lengkap,
          kelas: it.kelas,
          beasiswa: it.keterangan,
        }));

        setStudents(arr);
        setTotalPages(res.data.pagination?.totalPage || 1);
      } else {
        setStudents([]);
        setTotalPages(1);
      }
    } catch (err) {
      if (isExpired(err)) {
        setShowExpiredModal(true);
        return;
      }
      console.error("Gagal mengambil data beasiswa:", err);
      setStudents([]);
      setTotalPages(1);
    }
  }, [
    debouncedSearchTerm,
    selectedFilter,
    debouncedCustomFilter,
    selectedClass,
    currentPage,
    token,
  ]);

  /* panggil fetch setiap dependency berubah */
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    fetchBeasiswaData();
  }, [fetchBeasiswaData]);

  /* ───── handler halaman ───── */
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  /* ───── render ───── */
  return (
    <Container className="mt-4">
      {/* modal sesi expired */}
      <SessionExpiredModal show={showExpiredModal} />

      <h2 className="py-3">Monitoring Siswa Penerima Beasiswa</h2>

      {/* filter dropdown */}
      <Row className="mb-3">
        <Col md={12}>
          <Row className="g-2">
            {/* filter kelas */}
            <Col md={6}>
              <Form.Select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Filter Kelas</option>
                <option value="7">Kelas 7</option>
                <option value="8">Kelas 8</option>
                <option value="9">Kelas 9</option>
              </Form.Select>
            </Col>

            {/* filter jenis beasiswa */}
            <Col md={6}>
              <Form.Select
                value={selectedFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedFilter(v);
                  if (v !== "__OTHER__") {
                    setCustomFilter("");
                    setDebouncedCustomFilter("");
                  }
                  setCurrentPage(1);
                }}
              >
                <option value="">Semua Jenis Beasiswa</option>
                {[1, 2, 3, 4].map((i) => (
                  <option key={i} value={beasiswaText(i)}>
                    {beasiswaText(i)}
                  </option>
                ))}
                <option value="__OTHER__">Lainnya…</option>
              </Form.Select>

              {selectedFilter === "__OTHER__" && (
                <Form.Control
                  className="mt-2"
                  placeholder="Masukkan jenis beasiswa"
                  value={customFilter}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCustomFilter(v);
                    setCurrentPage(1);
                  }}
                />
              )}
            </Col>
          </Row>
        </Col>
      </Row>

      {/* search bar */}
      <Row className="mb-3">
        <Col md={12}>
          <Form.Control
            placeholder="Cari NISN atau Nama"
            value={searchTerm}
            onChange={(e) => {
              const v = e.target.value;
              setSearchTerm(v);
              setCurrentPage(1);
            }}
          />
        </Col>
      </Row>

      {/* table */}
      <h4 className="py-3">Tabel Siswa</h4>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>NISN</th>
            <th>Nama</th>
            <th>Kelas</th>
            <th>Jenis Beasiswa</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                Tidak ada data siswa
              </td>
            </tr>
          ) : (
            students.map((s) => (
              <tr key={s.nisn}>
                <td>{s.nisn}</td>
                <td>{s.name}</td>
                <td>{s.kelas}</td>
                <td>{s.beasiswa}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* pagination */}
      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          />
          <Pagination.Item active>{currentPage}</Pagination.Item>
          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          />
        </Pagination>
      )}
    </Container>
  );
};

export default KPMonitoringBeasiswa;
