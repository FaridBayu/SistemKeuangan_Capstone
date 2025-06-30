import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import linkTest from "../../srcLink";
import {
  Container,
  Row,
  Col,
  Form,
  Table,
  Pagination,
} from "react-bootstrap";
import { debounce } from "lodash";

const LIMIT = 10;

const KPMonitoringEmoney = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const didMountRef = useRef(false);

  // Debounce input pencarian
  const debounceSearch = useMemo(() => {
    return debounce((val) => {
      setDebouncedSearchTerm(val);
    }, 1250); // 1 detik debounce
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setCurrentPage(1);
    debounceSearch(val);
  };

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return; // skip fetch pertama akibat StrictMode
    }

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${linkTest}api/emoney`, {
          params: {
            input: debouncedSearchTerm,
            kelas: filterKelas,
            page: currentPage,
            limit: LIMIT,
          },
          headers: { "ngrok-skip-browser-warning": "true" },
          signal: controller.signal,
        });

        if (data.status === "success") {
          const transformed = (data.data || []).map((it) => ({
            nisn: it.nisn,
            name: it.nama_lengkap,
            kelas: it.kelas,
            saldo: it.nominal,
          }));
          setUsers(transformed);
          setTotalPages(data.pagination?.totalPage || 1);
        } else {
          setUsers([]);
          setTotalPages(1);
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Gagal fetch data:", err);
          setUsers([]);
          setTotalPages(1);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
      debounceSearch.cancel(); // bersihkan debounce
    };
  }, [debouncedSearchTerm, filterKelas, currentPage]);

  const rupiah = (v) =>
    !v || isNaN(v)
      ? "-"
      : new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(v);

  const renderPagination = () =>
    totalPages > 1 && (
      <Pagination className="justify-content-center">
        <Pagination.Prev
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        />
        <Pagination.Item active>{currentPage}</Pagination.Item>
        <Pagination.Next
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );

  return (
    <Container className="mt-4">
      <h2 className="py-3">Monitoring E‑Money Siswa</h2>

      <Row className="g-2 mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Cari NISN atau Nama"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Col>
        <Col md={6}>
          <Form.Select
            value={filterKelas}
            onChange={(e) => {
              setCurrentPage(1);
              setFilterKelas(e.target.value);
            }}
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
            <th>Saldo E‑Money</th>
          </tr>
        </thead>
        <tbody>
          {users.length ? (
            users.map(({ nisn, name, kelas, saldo }) => (
              <tr key={nisn}>
                <td>{nisn}</td>
                <td>{name}</td>
                <td>{kelas}</td>
                <td>{rupiah(saldo)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                Tidak ada data.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {renderPagination()}
    </Container>
  );
};

export default KPMonitoringEmoney;
