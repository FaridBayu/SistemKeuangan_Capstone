import { useState } from "react";
import {
  Container, Form, Table, Button, Modal, Toast,
  ToastContainer, Row, Col
} from "react-bootstrap";

import DataSiswa from "../../data/DataSiswa";
import DataSiswaBeasiswa from "../../data/DataSiswaBeasiswa";

const StatusSiswa = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBeasiswa, setFilterBeasiswa] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedBeasiswa, setSelectedBeasiswa] = useState("");
  const [showBeasiswaModal, setShowBeasiswaModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", beasiswa: "" });
  const [formError, setFormError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [students, setStudents] = useState(DataSiswaBeasiswa);
  const allStudents = DataSiswa;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const beasiswaOptions = [
    "Prestasi Akademik",
    "Tidak Mampu",
    "Yatim Piatu",
    "Beasiswa Santri Prestasi",
  ];

  const handleOpenBeasiswaModal = (student) => {
    setSelectedStudent(student);
    setSelectedBeasiswa(student.beasiswa);
    setShowBeasiswaModal(true);
  };

  const handleTerapkan = () => {
    setShowBeasiswaModal(false);
    setShowConfirmModal(true);
  };

  const confirmBeasiswa = () => {
    setStudents((prev) =>
      prev.map((s) =>
        s.nisn === selectedStudent.nisn
          ? { ...s, beasiswa: selectedBeasiswa }
          : s
      )
    );
    setShowConfirmModal(false);
    setToastMessage(`Beasiswa ${selectedBeasiswa} berhasil diterapkan ke ${selectedStudent.name}`);
    setShowToast(true);
  };

  const handleShowDeleteModal = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      setStudents((prev) => prev.filter((s) => s.nisn !== studentToDelete.nisn));
      setToastMessage(`Siswa ${studentToDelete.name} berhasil dihapus dari daftar beasiswa`);
      setShowToast(true);
      setStudentToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const filteredStudents = students.filter(
    ({ nisn, name, beasiswa }) =>
      (nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterBeasiswa === "" || beasiswa === filterBeasiswa)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleTambahSiswa = () => {
    setNewStudent({ name: "", beasiswa: "" });
    setFormError("");
    setShowTambahModal(true);
  };

  const tambahSiswa = () => {
    const found = allStudents.find((s) =>
      s.name.toLowerCase() === newStudent.name.toLowerCase() && s.status === "aktif"
    );

    if (!found) {
      setFormError("Nama tidak ditemukan atau siswa tidak aktif di madrasah.");
      return;
    }

    if (!newStudent.beasiswa) {
      setFormError("Silakan pilih jenis beasiswa terlebih dahulu.");
      return;
    }

    const existingStudent = students.some((s) => s.nisn === found.nisn);
    if (existingStudent) {
      setFormError("Siswa sudah terdaftar di daftar beasiswa.");
      return;
    }

    const newData = { ...found, beasiswa: newStudent.beasiswa };
    setStudents([...students, newData]);
    setShowTambahModal(false);
    setToastMessage(`Siswa ${found.name} berhasil ditambahkan dengan beasiswa ${newStudent.beasiswa}`);
    setShowToast(true);
  };

  return (
    <Container className="mt-4">
      <h2 className="py-3">Status Beasiswa Siswa</h2>
      <Row className="my-3">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Cari NISN atau Nama"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Select
            value={filterBeasiswa}
            onChange={(e) => setFilterBeasiswa(e.target.value)}
          >
            <option value="">Filter Jenis Beasiswa</option>
            {beasiswaOptions.map((jenis) => (
              <option key={jenis} value={jenis}>{jenis}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4} className="text-end">
          <Button variant="success" onClick={handleTambahSiswa}>
            Tambah Siswa
          </Button>
        </Col>
      </Row>

      <h4 className="py-3">Tabel Siswa Beasiswa</h4>
      <Table bordered hover>
        <thead>
          <tr>
            <th>NISN</th>
            <th>Nama Siswa</th>
            <th>Kelas</th>
            <th>Jenis Beasiswa</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((siswa) => (
            <tr key={siswa.nisn}>
              <td>{siswa.nisn}</td>
              <td>{siswa.name}</td>
              <td>{siswa.kelas}</td>
              <td>{siswa.beasiswa}</td>
              <td>
                <Button variant="primary" size="sm" onClick={() => handleOpenBeasiswaModal(siswa)}>
                  Ubah
                </Button>{" "}
                <Button variant="danger" size="sm" onClick={() => handleShowDeleteModal(siswa)}>
                  Hapus
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-center">
        <nav>
          <ul className="pagination">
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                <button onClick={() => paginate(i + 1)} className="page-link">
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Modal Ubah Beasiswa */}
      <Modal show={showBeasiswaModal} onHide={() => setShowBeasiswaModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ubah Status Beasiswa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select value={selectedBeasiswa} onChange={(e) => setSelectedBeasiswa(e.target.value)}>
            {beasiswaOptions.map((jenis) => (
              <option key={jenis} value={jenis}>{jenis}</option>
            ))}
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBeasiswaModal(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleTerapkan}>
            Terapkan Beasiswa
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Konfirmasi Pemberian Beasiswa */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Pemberian Beasiswa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Apakah Anda yakin ingin memberikan beasiswa <b>{selectedBeasiswa}</b> kepada <b>{selectedStudent?.name}</b>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Tidak Yakin
          </Button>
          <Button variant="success" onClick={confirmBeasiswa}>
            Yakin
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Hapus Siswa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Apakah Anda yakin menghapus <b>{studentToDelete?.name}</b> dari siswa beasiswa?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Hapus
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Tambah Siswa */}
      <Modal show={showTambahModal} onHide={() => setShowTambahModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Siswa Beasiswa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Nama Siswa</Form.Label>
              <Form.Control
                type="text"
                list="namaSiswaList"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                placeholder="Masukkan nama siswa"
              />
              <datalist id="namaSiswaList">
                {allStudents
                  .filter((s) =>
                    s.status === "aktif" &&
                    s.name.toLowerCase().includes(newStudent.name.toLowerCase())
                  )
                  .slice(0, 5)
                  .map((s) => (
                    <option key={s.nisn} value={s.name} />
                  ))}
              </datalist>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Jenis Beasiswa</Form.Label>
              <Form.Select
                value={newStudent.beasiswa}
                onChange={(e) => setNewStudent({ ...newStudent, beasiswa: e.target.value })}
              >
                <option value="">-- Pilih Jenis Beasiswa --</option>
                {beasiswaOptions.map((jenis) => (
                  <option key={jenis} value={jenis}>{jenis}</option>
                ))}
              </Form.Select>
              {formError && <Form.Text className="text-danger">{formError}</Form.Text>}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTambahModal(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={tambahSiswa}>
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg="success">
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default StatusSiswa;
