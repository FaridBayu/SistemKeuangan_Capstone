import { useState, useEffect } from "react";
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
import linkTest from "../../srcLink";

const PembayaranSPP = () => {
  const [students, setStudents] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [searchName, setSearchName] = useState("");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [beasiswa, setBeasiswa] = useState(null);
  const [nominalBayar, setNominalBayar] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState("success"); // success or danger
  const [showToast, setShowToast] = useState(false);

  const kelasList = ["7", "8", "9"];
  const semesterList = [
    { label: "Semester 1", value: 1 },
    { label: "Semester 2", value: 2 },
    { label: "Semester 3", value: 3 },
    { label: "Semester 4", value: 4 },
    { label: "Semester 5", value: 5 },
    { label: "Semester 6", value: 6 },
  ];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${linkTest}pembayaranspp`, {
          params: {
            input: searchName,
            kelas: selectedKelas,
            page: currentPage,
          },
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        setStudents(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error("Gagal fetch data:", err);
        setStudents([]);
        setTotalPages(1);
      }
    };
    fetchStudents();
  }, [searchName, selectedKelas, currentPage]);

  useEffect(() => {
    const fetchBeasiswa = async () => {
      if (!selectedStudent || !selectedSemester) return;
      try {
        const res = await axios.get(`${linkTest}pembayaranspp/beasiswa`, {
          params: { id: selectedStudent.id_siswa, semester: selectedSemester },
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (res.data.status === "success" && res.data.data.length > 0) {
          setBeasiswa(res.data.data.map((b) => b.keterangan).join(", "));
        } else {
          setBeasiswa(null);
        }
      } catch (err) {
        console.error("Gagal mengambil data beasiswa:", err);
        setBeasiswa(null);
      }
    };
    fetchBeasiswa();
  }, [selectedSemester, selectedStudent]);

  const paginate = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const openFormModal = (student) => {
    setSelectedStudent(student);
    setSelectedSemester("");
    setNominalBayar("");
    setBeasiswa(null);
    setShowFormModal(true);
  };

  const handleSaveClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    try {
      await axios.post(`${linkTest}pembayaranspp/insert`, {
        id_siswa: selectedStudent.id_siswa,
        semester: selectedSemester,
        nominal: Number(nominalBayar),
      }, { headers: { "ngrok-skip-browser-warning": "true" } });

      setToastMsg("Pembayaran berhasil disimpan.");
      setToastVariant("success");
      setShowToast(true);
      setShowConfirmModal(false);
      setShowFormModal(false);
    } catch (err) {
      console.error("Gagal simpan:", err);
      setToastMsg("Gagal menyimpan pembayaran.");
      setToastVariant("danger");
      setShowToast(true);
      setShowConfirmModal(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Kelola Pembayaran SPP</h2>

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
            type="text"
            placeholder="Cari nama siswa..."
            value={searchName}
            onChange={(e) => {
              setSearchName(e.target.value);
              setCurrentPage(1);
            }}
          />
        </Col>
      </Row>

      <Table bordered hover>
        <thead>
          <tr>
            <th>ID Siswa</th>
            <th>Nama</th>
            <th>Kelas</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id_siswa}>
              <td>{s.id_siswa}</td>
              <td>{s.nama_lengkap}</td>
              <td>{s.kelas}</td>
              <td>
                <Button variant="primary" size="sm" onClick={() => openFormModal(s)}>
                  Kelola SPP
                </Button>
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center">Tidak ada data</td>
            </tr>
          )}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
          <Pagination.Item active>{currentPage}</Pagination.Item>
          <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
        </Pagination>
      )}

      <Modal show={showFormModal} onHide={() => setShowFormModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Kelola Pembayaran SPP</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <>
              <p><strong>ID Siswa:</strong> {selectedStudent.id_siswa}</p>
              <p><strong>Nama:</strong> {selectedStudent.nama_lengkap}</p>
              <p><strong>Kelas:</strong> {selectedStudent.kelas}</p>
              <hr />
              <Form.Group className="mb-3">
                <Form.Label>Pilih Semester</Form.Label>
                <Form.Select value={selectedSemester} onChange={(e) => setSelectedSemester(Number(e.target.value))}>
                  <option value="">-- Pilih Semester --</option>
                  {semesterList.map(({ label, value }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              {beasiswa && (
                <div className="mb-3"><strong>Beasiswa:</strong> {beasiswa}</div>
              )}

              {selectedSemester && (
                <Form.Group className="mb-3">
                  <Form.Label>Nominal</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>Rp</InputGroup.Text>
                    <Form.Control
                      type="number"
                      placeholder="Masukkan nominal"
                      value={nominalBayar}
                      onChange={(e) => setNominalBayar(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFormModal(false)}>Batal</Button>
          <Button variant="primary" disabled={!selectedSemester || !nominalBayar} onClick={handleSaveClick}>
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Simpan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Apakah Anda yakin ingin menyimpan pembayaran sebesar Rp {Number(nominalBayar).toLocaleString("id-ID")}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Batal</Button>
          <Button variant="primary" onClick={handleConfirmSave}>Ya, Simpan</Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} bg={toastVariant} delay={3000} autohide>
          <Toast.Body className="text-white">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default PembayaranSPP;
