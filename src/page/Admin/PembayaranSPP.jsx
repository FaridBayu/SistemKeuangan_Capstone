// src/pages/PembayaranSPP.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Container,
  Form,
  Table,
  Button,
  Modal,
  Row,
  Col,
  Pagination,
  InputGroup,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import axios from "axios";
import { debounce } from "lodash";
import linkTest from "../../srcLink";
import Cookies from "js-cookie";

/* ───────── Komponen Modal Token Expired ───────── */
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
        Token Anda telah kedaluwarsa. Silakan login kembali untuk melanjutkan.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleLogout}>
          Kembali ke Login
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
/* ─────────────────────────────────────────────── */

const LIMIT = 10;

const PembayaranSPP = () => {
  const token = Cookies.get("token");

  /* ───── state utama ───── */
  const [students, setStudents]             = useState([]);
  const [selectedKelas, setSelectedKelas]   = useState("");
  const [searchName, setSearchName]         = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /* ───── modal & toast ───── */
  const [showFormModal, setShowFormModal]       = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  /* ───── detail pembayaran ───── */
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [nominalBayar, setNominalBayar] = useState("");

  /* ───── paging ───── */
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);

  /* ───── toast ───── */
  const [toastMsg, setToastMsg]       = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [showToast, setShowToast]     = useState(false);

  const didMountRef = useRef(false);

  /* ───── list pilihan ───── */
  const kelasList = ["7", "8", "9"];
  const semesterList = [
    { label: "Kelas 7 Semester 1", value: 1 },
    { label: "Kelas 7 Semester 2", value: 2 },
    { label: "Kelas 8 Semester 1", value: 3 },
    { label: "Kelas 8 Semester 2", value: 4 },
    { label: "Kelas 9 Semester 1", value: 5 },
    { label: "Kelas 9 Semester 2", value: 6 },
  ];

  /* ───── debounce search ───── */
  const debounceSearch = useMemo(
    () =>
      debounce((val) => {
        setDebouncedSearch(val);
      }, 1250),
    []
  );
  useEffect(() => () => debounceSearch.cancel(), [debounceSearch]);

  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
    setCurrentPage(1);
    debounceSearch(e.target.value);
  };

  /* ───── fetch siswa ───── */
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const controller = new AbortController();

    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${linkTest}api/spp/pembayaran`, {
          params: {
            input: debouncedSearch,
            kelas: selectedKelas,
            page : currentPage,
            limit: LIMIT,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          signal: controller.signal,
        });

        setStudents(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPage || 1);
      } catch (err) {
        if (axios.isCancel(err)) return;

        /* === DETEKSI TOKEN EXPIRED (HTTP 500 + pesan) === */
        const expired =
          err.response &&
          err.response.status === 500 &&
          typeof err.response.data?.message === "string" &&
          err.response.data.message.toLowerCase().includes("jwt expired");

        if (expired) {
          setShowExpiredModal(true);
          return;
        }

        console.error("Gagal fetch data:", err);
        setStudents([]);
        setTotalPages(1);
      }
    };

    fetchStudents();

    return () => controller.abort();
  }, [debouncedSearch, selectedKelas, currentPage, token]);

  /* ───── simpan pembayaran ───── */
  const handleConfirmSave = async () => {
    try {
      const res = await axios.post(
        `${linkTest}api/spp/pembayaran/add-spp`,
        {
          id_siswa: selectedStudent.id_siswa,
          semester: selectedSemester,
          nominal : Number(nominalBayar),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      setToastMsg(res.data?.message || "Pembayaran berhasil disimpan.");
      setToastVariant("success");
      setShowToast(true);
      setShowConfirmModal(false);
      setShowFormModal(false);
    } catch (err) {
      /* token expired saat POST */
      const expired =
        err.response &&
        err.response.status === 500 &&
        typeof err.response.data?.message === "string" &&
        err.response.data.message.toLowerCase().includes("jwt expired");

      if (expired) {
        setShowConfirmModal(false);
        setShowFormModal(false);
        setShowExpiredModal(true);
        return;
      }

      const msg =
        err.response?.data?.message || "Gagal menyimpan pembayaran.";
      setToastMsg(msg);
      setToastVariant("danger");
      setShowToast(true);
      setShowConfirmModal(false);
    }
  };

  /* ───── render ───── */
  return (
    <Container className="mt-4">
      {/* ===== Modal Token Expired ===== */}
      <SessionExpiredModal show={showExpiredModal} />

      <h2 className="py-3">Kelola Pembayaran SPP</h2>

      {/* Filter & Pencarian */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Select
            value={selectedKelas}
            onChange={(e) => {
              setSelectedKelas(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => (
              <option key={k} value={k}>{`Kelas ${k}`}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Control
            placeholder="Cari nama siswa..."
            value={searchName}
            onChange={handleSearchChange}
          />
        </Col>
      </Row>

      {/* Tabel */}
      <h4 className="py-3">Tabel Siswa</h4>
      <Table bordered hover>
        <thead>
          <tr>
            <th>NISN</th>
            <th>Nama</th>
            <th>Kelas</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id_siswa}>
              <td>{s.nisn}</td>
              <td>{s.nama_lengkap}</td>
              <td>{s.kelas}</td>
              <td>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedStudent(s);
                    setSelectedSemester("");
                    setNominalBayar("");
                    setShowFormModal(true);
                  }}
                >
                  Kelola SPP
                </Button>
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center">
                Tidak ada data
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          />
          <Pagination.Item active>{currentPage}</Pagination.Item>
          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          />
        </Pagination>
      )}

      {/* Modal Form */}
      <Modal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Kelola Pembayaran SPP</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <>
              <p>
                <strong>ID Siswa:</strong> {selectedStudent.id_siswa}
              </p>
              <p>
                <strong>Nama:</strong> {selectedStudent.nama_lengkap}
              </p>
              <p>
                <strong>Kelas:</strong> {selectedStudent.kelas}
              </p>
              <hr />
              <Form.Group className="mb-3">
                <Form.Label>Pilih Semester</Form.Label>
                <Form.Select
                  value={selectedSemester}
                  onChange={(e) =>
                    setSelectedSemester(Number(e.target.value))
                  }
                >
                  <option value="">-- Pilih Semester --</option>
                  {semesterList.map(({ label, value }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {selectedSemester && (
                <Form.Group className="mb-3">
                  <Form.Label>Nominal</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>Rp</InputGroup.Text>
                    <Form.Control
                      type="number"
                      placeholder="Masukkan nominal"
                      value={nominalBayar}
                      onChange={(e) =>
                        e.target.value.length <= 10 &&
                        setNominalBayar(e.target.value)
                      }
                    />
                  </InputGroup>
                </Form.Group>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFormModal(false)}>
            Batal
          </Button>
          <Button
            variant="primary"
            disabled={!selectedSemester || !nominalBayar}
            onClick={() => setShowConfirmModal(true)}
          >
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Konfirmasi */}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Simpan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Apakah Anda yakin ingin menyimpan pembayaran sebesar Rp{" "}
          {Number(nominalBayar).toLocaleString("id-ID")}?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Batal
          </Button>
          <Button variant="primary" onClick={handleConfirmSave}>
            Ya, Simpan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          bg={toastVariant}
          delay={3000}
          autohide
        >
          <Toast.Body className="text-white">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default PembayaranSPP;
