import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import debounce from "lodash/debounce";
import linkTest from "../../srcLink";
import { Container, Row, Col, Form, Table, Pagination } from "react-bootstrap";

const LIMIT = 10;

const KPMonitoringBeasiswa = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const didMountRef = useRef(false);

  // debounce pencarian
  const debounced = useMemo(
    () => debounce((val) => setDebouncedSearchTerm(val), 1250),
    []
  );

  useEffect(() => {
    return () => {
      debounced.cancel();
    };
  }, [debounced]);

  // callback untuk fetch data
  const fetchBeasiswaData = useCallback(async () => {
    try {
      const res = await axios.get(
        `${linkTest}api/beasiswa?input=${encodeURIComponent(
          debouncedSearchTerm
        )}&filter=${selectedFilter}&page=${currentPage}&limit=${LIMIT}`,
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
          nisn: item.nisn,
          name: item.nama_lengkap,
          kelas: item.kelas,
          beasiswa: item.keterangan,
        }));

        setStudents(arr);
        setTotalPages(res.data.pagination?.totalPage || 1);
      } else {
        setStudents([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Gagal mengambil data beasiswa:", error);
      setStudents([]);
      setTotalPages(1);
    }
  }, [debouncedSearchTerm, selectedFilter, selectedClass, currentPage]);

  // fetch data ketika perubahan filter, pencarian, dll
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return; // skip fetch pertama akibat StrictMode
    }
    fetchBeasiswaData();
  }, [fetchBeasiswaData]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

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
              const val = e.target.value;
              setSearchTerm(val);
              debounced(val);
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
              <tr key={`${siswa.nisn}-${index}`}>
                <td>{siswa.nisn}</td>
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
