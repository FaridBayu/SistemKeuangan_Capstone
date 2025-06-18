import { useState, useEffect } from "react";
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

const PengaturanEmoney = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  const fetchData = async (page = 1, input = "") => {
    try {
      const response = await axios.get(
        `${linkTest}Emoney/search?input=${input}&page=${page}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            Accept: "application/json",
          },
        }
      );

      const transformedData = response.data.data.map((item) => ({
        nisn: item.id_siswa,
        name: item.nama_lengkap,
        kelas: item.kelas,
        saldo: item.nominal,
        emoneyId: item.id_emoney,
      }));

      setUsers(transformedData);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Gagal fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleAturSaldoClick = (nisn) => {
    setSelectedNISN(nisn);
    setSaldoForm({ action: "", saldo: "" });
    setErrorMessage("");
    setShowModal(true);
  };

  const handleSaldoChange = (e) => {
    const { name, value } = e.target;
    if (name === "saldo" && !/^[0-9]*$/.test(value)) return;
    setSaldoForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitSaldo = (e) => {
    e.preventDefault();
    const saldoValue = parseFloat(saldoForm.saldo);
    const user = users.find((u) => u.nisn === selectedNISN);

    if (!user) {
      setErrorMessage("Siswa tidak ditemukan.");
      return;
    }

    if (isNaN(saldoValue) || saldoValue <= 0) {
      setErrorMessage("Jumlah saldo harus lebih dari 0.");
      return;
    }

    if (saldoForm.action === "subtract" && saldoValue > user.saldo) {
      setErrorMessage("Saldo tidak mencukupi untuk dikurangi.");
      return;
    }

    setErrorMessage("");
    setConfirmAction(saldoForm.action);
    setShowModal(false);
    setShowConfirmModal(true);
  };

  const confirmUpdateSaldo = async () => {
    const user = users.find((u) => u.nisn === selectedNISN);
    if (!user) return;

    const nominalValue = parseFloat(saldoForm.saldo);
    if (isNaN(nominalValue) || nominalValue <= 0) {
      setToastMessage("Nominal tidak valid.");
      setShowToast(true);
      return;
    }

    const endpoint =
      confirmAction === "add"
        ? `${linkTest}emoney/add/${user.emoneyId}`
        : `${linkTest}emoney/deduct/${user.emoneyId}`;

    try {
      await axios.put(
        endpoint,
        { nominal: nominalValue },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            Accept: "application/json",
          },
        }
      );

      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.nisn === selectedNISN) {
            const newSaldo =
              confirmAction === "add"
                ? u.saldo + nominalValue
                : u.saldo - nominalValue;
            return {
              ...u,
              saldo: newSaldo < 0 ? 0 : newSaldo,
            };
          }
          return u;
        })
      );

      setToastMessage(
        `Saldo berhasil ${confirmAction === "add" ? "ditambahkan" : "dikurangi"}`
      );
      setShowToast(true);
    } catch (error) {
      setToastMessage("Gagal memperbarui saldo.");
      setShowToast(true);
      console.error("Error saat update saldo:", error);
    } finally {
      setShowConfirmModal(false);
    }
  };

  const filteredUsers = users.filter(({ kelas }) => {
    return !filterKelas || kelas.startsWith(filterKelas.toString());
  });

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const renderPagination = () => (
    <Pagination className="justify-content-center">
      <Pagination.Prev onClick={handlePrev} disabled={currentPage === 1} />
      <Pagination.Item active>{currentPage}</Pagination.Item>
      <Pagination.Next onClick={handleNext} disabled={currentPage === totalPages} />
    </Pagination>
  );

  const selectedUser = users.find((u) => u.nisn === selectedNISN);

  return (
    <Container className="mt-4">
      <h2>Pengaturan E-Money</h2>

      <Form className="row g-2 mb-3">
        <div className="col-md-6">
          <Form.Control
            type="text"
            placeholder="Cari NISN atau Nama"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      <Table bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>NISN</th>
            <th>Nama</th>
            <th>Kelas</th>
            <th>Saldo E-Money</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(({ nisn, name, kelas, saldo }) => (
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

      {totalPages > 1 && renderPagination()}

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
          <Modal.Title>Atur Saldo E-Money</Modal.Title>
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
              >
                <option value="" disabled hidden>Pilih</option>
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
                onClick={() => setShowModal(false)}
                className="me-2"
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
                Apakah Anda yakin ingin mengurangi saldo <strong>{selectedUser.name}</strong> sebesar <strong>Rp{saldoForm.saldo}</strong>?
              </>
            ) : (
              <>
                Apakah Anda yakin ingin menambahkan saldo <strong>{selectedUser.name}</strong> sebesar <strong>Rp{saldoForm.saldo}</strong>?
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
