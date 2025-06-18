import { useState, useEffect } from "react";
import axios from "axios";
import linkTest from "../../srcLink"; // pastikan ini sesuai
import {
  Table,
  Container,
  Form,
  Pagination,
  Row,
  Col,
} from "react-bootstrap";

const KPMonitoringEmoney = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
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
    setCurrentPage(1); // Reset ke page 1 saat filter/search berubah
  }, [searchTerm, filterKelas]);

  const filteredUsers = users.filter(
    ({ kelas }) => !filterKelas || kelas.startsWith(filterKelas.toString())
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

  return (
    <Container className="mt-4">
      <h2>Monitoring E-Money Siswa</h2>

      <Row className="my-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Cari NISN atau Nama"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={6}>
          <Form.Select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            <option value="7">Kelas 7</option>
            <option value="8">Kelas 8</option>
            <option value="9">Kelas 9</option>
          </Form.Select>
        </Col>
      </Row>

      <h4 className="py-3">Tabel Siswa</h4>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>NISN</th>
            <th>Nama</th>
            <th>Kelas</th>
            <th>Saldo E-Money</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                Tidak ada data siswa
              </td>
            </tr>
          ) : (
            filteredUsers.map(({ nisn, name, kelas, saldo }) => (
              <tr key={nisn}>
                <td>{nisn}</td>
                <td>{name}</td>
                <td>{kelas}</td>
                <td>Rp{saldo.toLocaleString("id-ID")}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {totalPages > 1 && renderPagination()}
    </Container>
  );
};

export default KPMonitoringEmoney;
