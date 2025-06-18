import { useState, useEffect } from "react";
import axios from "axios";
import linkTest from "../../srcLink";
import { Container, Row, Col, Form, Table, Pagination } from "react-bootstrap";

const KPMonitoringBeasiswa = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBeasiswaData = async (page = 1) => {
    try {
      const res = await axios.get(
        `${linkTest}beasiswa?input=${encodeURIComponent(
          searchTerm
        )}&filter=${selectedFilter}&page=${page}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (res.data.status === "success") {
        const filteredData = res.data.data.filter((item) => {
          if (!selectedClass) return true;
          return item.kelas.toLowerCase().startsWith(selectedClass.toLowerCase());
        });

        const arr = filteredData.map((item) => ({
          id: item.id_siswa,
          name: item.nama_lengkap,
          kelas: item.kelas,
          beasiswa: beasiswaText(item.keterangan),
        }));

        setStudents(arr);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setStudents([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Gagal mengambil data beasiswa:", error);
      setStudents([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchBeasiswaData(currentPage);
  }, [searchTerm, selectedFilter, selectedClass, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const beasiswaText = (id) =>
  ({
    1: "Beasiswa Prestasi",
    2: "Beasiswa Kurang Mampu",
    3: "Beasiswa Yatim Piatu",
    4: "Beasiswa Tahfidz",
  }[id] || `ID ${id}`);

  return (
    <Container className="mt-4">
      <h2 className="py-3">Monitoring Siswa Penerima Beasiswa</h2>

      {/* Filter Dropdown */}
      <Row className="mb-3">
        <Col md={12}>
          <Row className="g-2">
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
            <Col md={6}>
              <Form.Select
                value={selectedFilter}
                onChange={(e) => {
                  setSelectedFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Filter Jenis Beasiswa</option>
                <option value="1">Beasiswa Prestasi</option>
                <option value="2">Beasiswa Kurang Mampu</option>
                <option value="3">Beasiswa Yatim Piatu</option>
                <option value="4">Beasiswa Tahfidz</option>
              </Form.Select>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Search Bar */}
      <Row className="mb-3">
        <Col md={12}>
          <Form.Control
            type="text"
            placeholder="Cari NISN atau Nama"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </Col>
      </Row>

      {/* Table */}
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
            students.map((siswa, index) => (
              <tr key={`${siswa.id}-${siswa.beasiswa}-${index}`}>
                <td>{siswa.id}</td>
                <td>{siswa.name}</td>
                <td>{siswa.kelas}</td>
                <td>{siswa.beasiswa}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          <Pagination.Item active>{currentPage}</Pagination.Item>
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      )}
    </Container>
  );
};

export default KPMonitoringBeasiswa;
