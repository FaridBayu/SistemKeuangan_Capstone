import React, { useState } from "react";
import { Modal, Button, Form, Table, Pagination } from "react-bootstrap";
import studentSPP from "../../data/StudentSPP";
import SPPSiswa from "../../data/SPPSiswa";

const ITEMS_PER_PAGE = 10;

const KPMonitoringSPP = () => {
  const [students] = useState(studentSPP);
  const [filterKelas, setFilterKelas] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleShowDetail = (student) => {
    setSelectedStudent(student);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setSelectedStudent(null);
    setShowDetail(false);
  };

  const getSPPDetailByNISN = (nisn) => {
    return SPPSiswa.find((siswa) => String(siswa.nisn) === String(nisn));
  };

  const filteredStudents = students
    .filter((student) => {
      const matchKelas = filterKelas ? student.kelas.startsWith(filterKelas) : true;
      const matchSemester = filterSemester ? student.semester === filterSemester : true;
      const matchNama = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchKelas && matchSemester && matchNama;
    })
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)); // Terbaru ke terlama

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const renderPagination = () => (
    <Pagination className="justify-content-center">
      <Pagination.Prev
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
      />
      <Pagination.Item active>{currentPage}</Pagination.Item>
      <Pagination.Next
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    </Pagination>
  );

  const sppDetail = selectedStudent ? getSPPDetailByNISN(selectedStudent.nisn) : null;

  return (
    <div className="p-4">
      <h2 className="mb-4">Monitoring Pembayaran SPP</h2>

      {/* Filter */}
      <div className="d-flex gap-3 mb-3">
        <Form.Select value={filterKelas} onChange={(e) => setFilterKelas(e.target.value)}>
          <option value="">Semua Kelas</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
        </Form.Select>

        <Form.Select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)}>
          <option value="">Semua Semester</option>
          <option value="1">1</option>
          <option value="2">2</option>
        </Form.Select>
      </div>

      {/* Pencarian */}
      <div className="mb-3">
        <Form.Control
          type="text"
          placeholder="Cari Nama Siswa"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabel */}
      <h4 className="py-3">Tabel Siswa </h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nama Siswa</th>
            <th>Kelas</th>
            <th>Semester</th>
            <th>Status</th>
            <th>Nominal Dibayar</th>
            <th>Tunggakan</th>
            <th>Tanggal Bayar</th>
            <th>Lihat Detail</th>
          </tr>
        </thead>
        <tbody>
          {paginatedStudents.length > 0 ? (
            paginatedStudents.map((student, index) => (
              <tr key={index}>
                <td>{student.name}</td>
                <td>{student.kelas}</td>
                <td>{student.semester}</td>
                <td>{student.status}</td>
                <td>Rp {student.nominal}</td>
                <td>Rp {student.tunggakan}</td>
                <td>{student.tanggal}</td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleShowDetail(student)}
                  >
                    Lihat
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center text-muted">
                Tidak ada data yang cocok.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {filteredStudents.length > ITEMS_PER_PAGE && renderPagination()}

      {/* Modal Detail */}
      <Modal show={showDetail} onHide={handleCloseDetail}>
        <Modal.Header closeButton>
          <Modal.Title>Detail Pembayaran</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {sppDetail && selectedStudent ? (
            <div>
              <p><strong>Nama:</strong> {selectedStudent.name}</p>
              <p><strong>Kelas:</strong> {selectedStudent.kelas}</p>
              <p><strong>NISN:</strong> {selectedStudent.nisn}</p>
              <hr />
              <p><strong>Pembayaran SPP:</strong></p>
              <div style={{ paddingLeft: "1rem" }}>
                <p><strong>Kelas 6:</strong></p>
                <p>Semester 1: {sppDetail.kelas6S1}</p>
                <p>Semester 2: {sppDetail.kelas6S2}</p>
                <p><strong>Kelas 7:</strong></p>
                <p>Semester 1: {sppDetail.kelas7S1}</p>
                <p>Semester 2: {sppDetail.kelas7S2}</p>
                <p><strong>Kelas 8:</strong></p>
                <p>Semester 1: {sppDetail.kelas8S1}</p>
                <p>Semester 2: {sppDetail.kelas8S2}</p>
              </div>
            </div>
          ) : (
            <p>Data pembayaran tidak ditemukan untuk NISN tersebut.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetail}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default KPMonitoringSPP;
