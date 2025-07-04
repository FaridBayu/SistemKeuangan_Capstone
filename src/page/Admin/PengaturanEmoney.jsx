// src/pages/PengaturanEmoney.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import linkTest from "../../srcLink";
import {
  Table,
  Button,
  Container,
  Modal,
  Form,
  Pagination,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { debounce } from "lodash";
import Cookies from "js-cookie";

const LIMIT = 10;

/* ───────── Modal Sesi Kedaluwarsa ───────── */
const SessionExpiredModal = ({ show }) => {
  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("user");
    window.location.href = "/login"; // pakai navigate() bila pakai react‑router v6
  };

  return (
    <Modal show={show} backdrop="static" keyboard={false} centered>
      <Modal.Header>
        <Modal.Title>Sesi Anda Telah Habis</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Token login Anda kedaluwarsa. Silakan masuk kembali untuk melanjutkan.
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

const PengaturanEmoney = () => {
  const token = Cookies.get("token");

  /* ───── state utama ───── */
  const [users, setUsers]                 = useState([]);
  const [searchTerm, setSearchTerm]       = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterKelas, setFilterKelas]     = useState("");

  /* ───── modal & toast ───── */
  const [showModal, setShowModal]             = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /* ───── token expired modal ───── */
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  /* ───── form / detail siswa ───── */
  const [selectedNISN, setSelectedNISN] = useState(null);
  const [saldoForm, setSaldoForm]       = useState({ action: "", saldo: "" });
  const [confirmAction, setConfirmAction] = useState(null);

  /* ───── paging ───── */
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);

  const didMountRef = useRef(false);

  /* ───── debounce search ───── */
  const debounceSearch = useMemo(
    () => debounce((val) => setDebouncedSearch(val), 1250),
    []
  );
  useEffect(() => () => debounceSearch.cancel(), [debounceSearch]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
    debounceSearch(e.target.value);
  };

  /* ───── fetch data ───── */
  const fetchData = async (page = 1, input = "", kelas = "") => {
    try {
      const resp = await axios.get(
        `${linkTest}api/emoney?input=${input}&kelas=${kelas}&page=${page}&limit=${LIMIT}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
            Accept: "application/json",
          },
        }
      );

      const { data, pagination } = resp.data;

      const transformed = data.map((item) => ({
        nisn   : item.nisn,
        name   : item.nama_lengkap,
        kelas  : item.kelas,
        saldo  : item.nominal,
        emoneyId: item.id_emoney,
      }));

      setUsers(transformed);
      setTotalPages(pagination.totalPage || 1);
    } catch (err) {
      /* ===== DETEKSI JWT EXPIRED ===== */
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
    }
  };

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    fetchData(currentPage, debouncedSearch, filterKelas);
  }, [currentPage, debouncedSearch, filterKelas]);

  useEffect(() => setCurrentPage(1), [searchTerm, filterKelas]);

  /* ───── form handlers ───── */
  const handleAturSaldoClick = (nisn) => {
    setSelectedNISN(nisn);
    setSaldoForm({ action: "", saldo: "" });
    setErrorMessage("");
    setShowModal(true);
  };

  const handleSaldoChange = (e) => {
    const { name, value } = e.target;
    if (name === "saldo" && !/^\d{0,10}$/.test(value)) return;
    setSaldoForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitSaldo = (e) => {
    e.preventDefault();
    const nominal = parseFloat(saldoForm.saldo);
    const user = users.find((u) => u.nisn === selectedNISN);

    if (!user) return setErrorMessage("Siswa tidak ditemukan.");
    if (!nominal || nominal <= 0)
      return setErrorMessage("Jumlah saldo harus lebih dari 0.");
    if (saldoForm.action === "subtract" && nominal > user.saldo)
      return setErrorMessage("Saldo tidak mencukupi untuk dikurangi.");

    setConfirmAction(saldoForm.action);
    setShowModal(false);
    setShowConfirmModal(true);
  };

  /* ───── konfirmasi update saldo ───── */
  const confirmUpdateSaldo = async () => {
    const user = users.find((u) => u.nisn === selectedNISN);
    if (!user) return;

    const nominal = parseFloat(saldoForm.saldo);
    const endpoint =
      confirmAction === "add"
        ? `${linkTest}api/emoney/add-emoney`
        : `${linkTest}api/emoney/reduce-emoney`;

    try {
      await axios.post(
        endpoint,
        { id_emoney: user.emoneyId, nominal },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
            Accept: "application/json",
          },
        }
      );

      setUsers((prev) =>
        prev.map((u) =>
          u.nisn === selectedNISN
            ? {
                ...u,
                saldo:
                  confirmAction === "add"
                    ? u.saldo + nominal
                    : u.saldo - nominal,
              }
            : u
        )
      );

      setToastMessage(
        `Saldo berhasil ${
          confirmAction === "add" ? "ditambahkan" : "dikurangi"
        }.`
      );
    } catch (err) {
      /* ===== TOKEN EXPIRED SAAT POST ===== */
      const expired =
        err.response &&
        err.response.status === 500 &&
        typeof err.response.data?.message === "string" &&
        err.response.data.message.toLowerCase().includes("jwt expired");

      if (expired) {
        setShowConfirmModal(false);
        setShowExpiredModal(true);
        return;
      }

      setToastMessage("Gagal memperbarui saldo.");
      console.error("Error update saldo:", err);
    } finally {
      setShowConfirmModal(false);
      setShowToast(true);
    }
  };

  /* ───── pagination helpers ───── */
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage((p) => p + 1);
  const handlePrev = () =>
    currentPage > 1 && setCurrentPage((p) => p - 1);

  const renderPagination = () =>
    totalPages > 1 && (
      <Pagination className="justify-content-center">
        <Pagination.Prev onClick={handlePrev} disabled={currentPage === 1} />
        <Pagination.Item active>{currentPage}</Pagination.Item>
        <Pagination.Next
          onClick={handleNext}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );

  const selectedUser = users.find((u) => u.nisn === selectedNISN);

  /* ───── render ───── */
  return (
    <Container className="mt-4">
      {/* ===== Modal Token Expired ===== */}
      <SessionExpiredModal show={showExpiredModal} />

      <h2 className="py-3">Pengaturan E‑Money</h2>

      {/* Filter & Pencarian */}
      <Form className="row g-2 md-3">
        <div className="col-md-6">
          <Form.Control
            placeholder="Cari NISN atau Nama"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="col-md-6">
          <Form.Select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            <option value="7">Kelas 7</option>
            <option value="8">Kelas 8</option>
            <option value="9">Kelas 9</option>
          </Form.Select>
        </div>
      </Form>

      {/* Tabel Siswa */}
      <h4 className="py-3">Tabel Siswa</h4>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>NISN</th>
            <th>Nama</th>
            <th>Kelas</th>
            <th>Saldo E‑Money</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map(({ nisn, name, kelas, saldo }) => (
            <tr key={nisn}>
              <td>{nisn}</td>
              <td>{name}</td>
              <td>{kelas}</td>
              <td>Rp{saldo.toLocaleString("id-ID")}</td>
              <td>
                <Button size="sm" onClick={() => handleAturSaldoClick(nisn)}>
                  Atur Saldo
                </Button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center">
                Tidak ada data.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {renderPagination()}

      {/* Toast */}      
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg="success"
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
        >
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Modal Form Input */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Atur Saldo E‑Money</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitSaldo}>
            {errorMessage && (
              <div className="text-danger mb-2">{errorMessage}</div>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Aksi</Form.Label>
              <Form.Select
                name="action"
                value={saldoForm.action}
                onChange={handleSaldoChange}
                required
              >
                <option value="" disabled hidden>
                  Pilih
                </option>
                <option value="add">Tambahkan Saldo</option>
                <option value="subtract">Kurangkan Saldo</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nominal</Form.Label>
              <div className="input-group">
                <span className="input-group-text">Rp</span>
                <Form.Control
                  name="saldo"
                  value={saldoForm.saldo}
                  onChange={handleSaldoChange}
                  required
                />
              </div>
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => setShowModal(false)}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary">
                Simpan
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Konfirmasi */}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser ? (
            confirmAction === "subtract" ? (
              <>
                Apakah Anda yakin ingin <strong>mengurangi</strong> saldo{" "}
                <strong>{selectedUser.name}</strong> sebesar{" "}
                <strong>Rp{saldoForm.saldo}</strong>?
              </>
            ) : (
              <>
                Apakah Anda yakin ingin <strong>menambahkan</strong> saldo{" "}
                <strong>{selectedUser.name}</strong> sebesar{" "}
                <strong>Rp{saldoForm.saldo}</strong>?
              </>
            )
          ) : (
            <span className="text-danger">Data siswa tidak ditemukan.</span>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Batal
          </Button>
          {selectedUser && (
            <Button variant="primary" onClick={confirmUpdateSaldo}>
              Ya, Lanjutkan
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PengaturanEmoney;
