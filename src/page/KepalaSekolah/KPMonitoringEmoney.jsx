import { useState, useEffect } from "react";
import {
  Table,
  Container,
  Form,
  Pagination,
  Row,
  Col,
} from "react-bootstrap";

const KPMonitoringEmoney = () => {
  const [users] = useState([
    { nisn: "12345", name: "Agus", kelas: "8A", saldo: 50000 },
    { nisn: "23456", name: "Budi", kelas: "6B", saldo: 70000 },
    { nisn: "34567", name: "Citra", kelas: "7B", saldo: 30000 },
    { nisn: "45678", name: "Dewi", kelas: "8A", saldo: 25000 },
    { nisn: "56789", name: "Eko", kelas: "6A", saldo: 60000 },
    { nisn: "67890", name: "Fajar", kelas: "7B", saldo: 40000 },
    { nisn: "78901", name: "Gita", kelas: "8B", saldo: 80000 },
    { nisn: "89012", name: "Hani", kelas: "7A", saldo: 20000 },
    { nisn: "90123", name: "Ivan", kelas: "6A", saldo: 100000 },
    { nisn: "01234", name: "Joko", kelas: "8B", saldo: 55000 },
    { nisn: "11223", name: "Kiki", kelas: "7D", saldo: 45000 },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Ambil semua kelas unik
  const uniqueKelas = [...new Set(users.map((user) => user.kelas))].sort();

  const filteredUsers = users.filter(
    ({ nisn, name, kelas }) =>
      (nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kelas.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterKelas === "" || kelas === filterKelas)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterKelas]);

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
      <p className="text-muted fst-italic">
        "Kejujuran membawa kepada kebaikan, dan kebaikan membawa ke surga." <br />
        <small>— HR. Bukhari dan Muslim</small>
      </p>

      <Row className="my-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Cari NISN, Nama, atau Kelas"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={6}>
          <Form.Select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
          >
            <option value="">Filter Kelas</option>
            {uniqueKelas.map((kelas) => (
              <option key={kelas} value={kelas}>
                {kelas}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      
      <h4 className="py-3">Tabel Siswa </h4>
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
          {currentItems.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                Tidak ada data siswa
              </td>
            </tr>
          ) : (
            currentItems.map(({ nisn, name, kelas, saldo }) => (
              <tr key={nisn}>
                <td>{nisn}</td>
                <td>{name}</td>
                <td>{kelas}</td>
                <td>Rp{saldo.toLocaleString()}</td>
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
