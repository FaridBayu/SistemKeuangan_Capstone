import { useState, useEffect } from "react";
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
  const [users, setUsers] = useState([
    { nisn: "12345", name: "Agus", kelas: "8A", saldo: 0 },
    { nisn: "23456", name: "Budi", kelas: "9B", saldo: 0 },
    { nisn: "34567", name: "Citra", kelas: "7C", saldo: 0 },
    { nisn: "45678", name: "Dewi", kelas: "8A", saldo: 0 },
    { nisn: "56789", name: "Eko", kelas: "9A", saldo: 0 },
    { nisn: "67890", name: "Fajar", kelas: "7B", saldo: 0 },
    { nisn: "78901", name: "Gita", kelas: "8B", saldo: 0 },
    { nisn: "89012", name: "Hani", kelas: "7A", saldo: 0 },
    { nisn: "90123", name: "Ivan", kelas: "9C", saldo: 0 },
    { nisn: "01234", name: "Joko", kelas: "8C", saldo: 0 },
    { nisn: "11223", name: "Kiki", kelas: "7D", saldo: 0 },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [selectedNISN, setSelectedNISN] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [saldoForm, setSaldoForm] = useState({ action: "add", saldo: "" });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleAturSaldoClick = (nisn) => {
    setSelectedNISN(nisn);
    setSaldoForm({ action: "add", saldo: "" });
    setErrorMessage("");
    setShowModal(true);
  };

  const handleSaldoChange = (e) => {
    const { name, value } = e.target;
    if (name === "saldo" && !/^\d*$/.test(value)) return;
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

  const confirmUpdateSaldo = () => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.nisn === selectedNISN) {
          const newSaldo =
            confirmAction === "add"
              ? user.saldo + parseFloat(saldoForm.saldo)
              : user.saldo - parseFloat(saldoForm.saldo);
          return {
            ...user,
            saldo: newSaldo < 0 ? 0 : newSaldo,
          };
        }
        return user;
      })
    );
    setShowConfirmModal(false);
    setToastMessage(
      `Saldo berhasil ${confirmAction === "add" ? "ditambahkan" : "dikurangi"}`
    );
    setShowToast(true);
  };

  const filteredUsers = users.filter(({ nisn, name, kelas }) => {
    const matchesSearch =
      searchTerm === "" ||
      nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesKelas =
      !filterKelas || kelas.startsWith(filterKelas.toString());

    return matchesSearch && matchesKelas;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterKelas]);

  const renderPagination = () => (
    <Pagination className="justify-content-center">
      <Pagination.Prev
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
      />
      <Pagination.Item active>{currentPage}</Pagination.Item>
      <Pagination.Next
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    </Pagination>
  );

  const selectedUser = users.find((u) => u.nisn === selectedNISN);

  return (
    <Container className="mt-4">
      <h2>Pengaturan E-Money</h2>

      <Form.Control
        type="text"
        placeholder="Cari NISN atau Nama"
        className="my-3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="d-flex gap-3 mb-3">
        <Form.Select
          value={filterKelas}
          onChange={(e) => setFilterKelas(e.target.value)}
        >
          <option value="">Semua Kelas</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
        </Form.Select>
      </div>

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
          {currentItems.map(({ nisn, name, kelas, saldo }) => (
            <tr key={nisn}>
              <td>{nisn}</td>
              <td>{name}</td>
              <td>{kelas}</td>
              <td>Rp{saldo}</td>
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