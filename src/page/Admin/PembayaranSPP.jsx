import { useState } from "react";
import {
  Container,
  Form,
  Table,
  Button,
  Modal,
  Row,
  Col,
  Pagination,
} from "react-bootstrap";
import DataSiswa from "../../data/DataSiswa";
import DataSiswaBeasiswa from "../../data/DataSiswaBeasiswa";

const PembayaranSPP = () => {
  const [selectedKelas, setSelectedKelas] = useState("");
  const [searchName, setSearchName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pembayaran, setPembayaran] = useState({});
  const [dataPembayaran, setDataPembayaran] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const kelasList = ["7A", "7B", "8A", "8B", "9A", "9B"];

  const semesterList = [
    { label: "Kelas 7 - Semester 1", key: "7_1" },
    { label: "Kelas 7 - Semester 2", key: "7_2" },
    { label: "Kelas 8 - Semester 1", key: "8_1" },
    { label: "Kelas 8 - Semester 2", key: "8_2" },
    { label: "Kelas 9 - Semester 1", key: "9_1" },
    { label: "Kelas 9 - Semester 2", key: "9_2" },
  ];

  const nominalSPP = 800000;

  // Perbaikan: Tampilkan semua siswa jika kelas tidak dipilih
  let filteredStudents = selectedKelas
    ? DataSiswa.filter((s) => s.kelas === selectedKelas)
    : DataSiswa;

  if (searchName.trim() !== "") {
    const lowerSearch = searchName.toLowerCase();
    filteredStudents = filteredStudents.filter((s) =>
      s.name.toLowerCase().includes(lowerSearch)
    );
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const getBeasiswaPotongan = (nisn) => {
    const jenis = DataSiswaBeasiswa.find((b) => b.nisn === nisn)?.beasiswa;
    switch (jenis) {
      case "Prestasi Akademik":
      case "Beasiswa Santri Prestasi":
        return 100000;
      case "Yatim Piatu":
        return 150000;
      case "Tidak Mampu":
        return 500000;
      default:
        return 0;
    }
  };

  const getStatusBeasiswa = (nisn) => {
    return DataSiswaBeasiswa.find((b) => b.nisn === nisn)?.beasiswa || "-";
  };

  const getStatusSiswa = (nisn) => {
    return DataSiswa.find((s) => s.nisn === nisn)?.status || "Aktif";
  };

  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    const nisn = student.nisn;
    const existing = dataPembayaran[nisn] || {};

    const defaultPembayaran = {};
    semesterList.forEach(({ key }) => {
      defaultPembayaran[key] = {
        status: existing[key]?.status || "Belum Lunas",
        nominal: existing[key]?.nominal || "",
      };
    });

    setPembayaran(defaultPembayaran);
    setShowModal(true);
  };

  const handleSave = () => {
    if (selectedStudent) {
      setDataPembayaran((prev) => ({
        ...prev,
        [selectedStudent.nisn]: pembayaran,
      }));
    }
    setShowModal(false);
  };

  const handleNominalChange = (key, value) => {
    const sanitized = Math.max(0, parseInt(value) || 0);
    const potongan = getBeasiswaPotongan(selectedStudent.nisn);
    const totalSPP = nominalSPP - potongan;

    let status = "Belum Lunas";
    if (sanitized >= totalSPP) status = "Lunas";
    else if (sanitized > 0) status = "Parsial";

    setPembayaran((prev) => ({
      ...prev,
      [key]: {
        nominal: sanitized,
        status,
      },
    }));
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
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
            {kelasList.map((kelas) => (
              <option key={kelas} value={kelas}>
                {kelas}
              </option>
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

      <h4 className="py-3">Tabel Siswa</h4>

      <Table bordered hover>
        <thead>
          <tr>
            <th>NISN</th>
            <th>Nama</th>
            <th>Kelas</th>
            <th>Status Beasiswa</th>
            <th>Status Siswa</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((siswa) => (
            <tr key={siswa.nisn}>
              <td>{siswa.nisn}</td>
              <td>{siswa.name}</td>
              <td>{siswa.kelas}</td>
              <td>{getStatusBeasiswa(siswa.nisn)}</td>
              <td>{getStatusSiswa(siswa.nisn)}</td>
              <td>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenModal(siswa)}
                >
                  Kelola SPP
                </Button>
              </td>
            </tr>
          ))}
          {currentItems.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center">
                Tidak ada data siswa ditemukan.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {renderPagination()}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Kelola Pembayaran SPP</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <>
              <p><strong>NISN:</strong> {selectedStudent.nisn}</p>
              <p><strong>Nama:</strong> {selectedStudent.name}</p>
              <p><strong>Kelas:</strong> {selectedStudent.kelas}</p>
              <p><strong>Tahun Ajaran:</strong> 2024/2025</p>
              <hr />
              {semesterList.map(({ label, key }) => {
                const potongan = getBeasiswaPotongan(selectedStudent.nisn);
                const totalSPP = nominalSPP - potongan;
                const nominalDibayar = parseInt(pembayaran[key]?.nominal || 0);
                const sisa = Math.max(0, totalSPP - nominalDibayar);
                const status = pembayaran[key]?.status || "Belum Lunas";

                return (
                  <div key={key} className="mb-3">
                    <h6>{label}</h6>
                    <div className="text-muted mb-1">
                      Biaya yang harus dibayar: Rp {totalSPP.toLocaleString("id-ID")}
                    </div>
                    <Row className="align-items-center">
                      <Col md={4}>
                        <Form.Control
                          plaintext
                          readOnly
                          value={`Status: ${status}`}
                        />
                      </Col>
                      <Col md={8}>
                        <Form.Control
                          type="number"
                          placeholder="Nominal (Rp)"
                          value={pembayaran[key]?.nominal || ""}
                          onChange={(e) => handleNominalChange(key, e.target.value)}
                        />
                      </Col>
                    </Row>
                    {status === "Parsial" && sisa > 0 && (
                      <div className="text-danger mt-1">
                        Sisa yang harus dibayar: Rp {sisa.toLocaleString("id-ID")}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PembayaranSPP;
