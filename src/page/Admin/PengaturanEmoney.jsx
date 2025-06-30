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

const LIMIT = 10;

const PengaturanEmoney = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [selectedNISN, setSelectedNISN] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [saldoForm, setSaldoForm] = useState({ action: "", saldo: "" });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const didMountRef = useRef(false);

  const debounceSearch = useMemo(
    () => debounce((val) => setDebouncedSearch(val), 1250),
    []
  );

  useEffect(() => {
    return () => debounceSearch.cancel();
  }, [debounceSearch]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
    debounceSearch(e.target.value);
  };

  const fetchData = async (page = 1, input = "", kelas = "") => {
    try {
      const resp = await axios.get(
        `${linkTest}api/emoney?input=${input}&kelas=${kelas}&page=${page}&limit=${LIMIT}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            Accept: "application/json",
          },
        }
      );

      const { data, pagination } = resp.data;

      const transformed = data.map((item) => ({
        nisn: item.nisn,
        name: item.nama_lengkap,
        kelas: item.kelas,
        saldo: item.nominal,
        emoneyId: item.id_emoney,
      }));

      setUsers(transformed);
      setTotalPages(pagination.totalPage || 1);
    } catch (err) {
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
      setToastMessage("Gagal memperbarui saldo.");
      console.error("Error update saldo:", err);
    } finally {
      setShowConfirmModal(false);
      setShowToast(true);
    }
  };

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

  return (
    <Container className="mt-4">
      <h2 className="py-3">Pengaturan E‑Money</h2>

      <Form className="row g-2 md-3">
        <div className="col-md-6">
          <Form.Control
            type="text"
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
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAturSaldoClick(nisn)}
                >
                  Atur Saldo
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {renderPagination()}

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
                  type="text"
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
                Apakah Anda yakin ingin mengurangi saldo{" "}
                <strong>{selectedUser.name}</strong> sebesar{" "}
                <strong>Rp{saldoForm.saldo}</strong>?
              </>
            ) : (
              <>
                Apakah Anda yakin ingin menambahkan saldo{" "}
                <strong>{selectedUser.name}</strong> sebesar{" "}
                <strong>Rp{saldoForm.saldo}</strong>?
              </>
            )
          ) : (
            <span className="text-danger">Data siswa tidak ditemukan.</span>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
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