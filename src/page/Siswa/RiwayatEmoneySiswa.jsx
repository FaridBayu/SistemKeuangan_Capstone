import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Pagination,
} from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // perbaikan penting di sini
import axios from "axios";
import linkTest from "../../srcLink";

const RiwayatEmoneySiswa = () => {
  const id_siswa = 1;
  const [siswaData, setSiswaData] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (page = 1, start = "", end = "") => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const tglAkhir = end || today;

      const response = await axios.get(
        `${linkTest}emoney/${id_siswa}?page=${page}&tgl_awal=${start}&tgl_akhir=${tglAkhir}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            Accept: "application/json",
          },
        }
      );

      const { data, riwayat, totalPages } = response.data;
      setSiswaData(data);
      setRiwayat(riwayat);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Gagal memuat data e-money:", error);
    }
  };

  useEffect(() => {
    fetchData(currentPage, startDate, endDate);
  }, [currentPage, startDate, endDate]);

  const formatTanggal = (isoDate) => {
    const d = new Date(isoDate);
    return d.toLocaleDateString("id-ID");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const title = `Riwayat Transaksi - ${siswaData?.nama_lengkap}`;
    doc.setFontSize(16);
    doc.text(title, 14, 15);

    const rows = riwayat.map((trx, idx) => [
      idx + 1,
      formatTanggal(trx.tanggal),
      `Rp ${trx.nominal.toLocaleString("id-ID")}`,
      trx.keterangan,
    ]);

    autoTable(doc, {
      startY: 25,
      head: [["No", "Tanggal", "Jumlah", "Keterangan"]],
      body: rows,
    });

    doc.save(`Riwayat_${siswaData?.nama_lengkap}.pdf`);
  };

  const renderPagination = () => (
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

  if (!siswaData) {
    return <Container className="mt-4">Memuat data...</Container>;
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-5">Riwayat E-Money</h2>

      <Row className="mb-2">
        <Col><strong>Nama Siswa:</strong> {siswaData.nama_lengkap}</Col>
      </Row>
      <Row className="mb-2">
        <Col><strong>Kelas:</strong> {siswaData.kelas}</Col>
      </Row>
      <Row className="mb-4">
        <Col><strong>NISN:</strong> {siswaData.id_siswa}</Col>
      </Row>

      <Row className="mb-3">
        <Col xs={12} md={6}>
          <div className="p-3 bg-white rounded shadow-sm text-center">
            <div style={{ fontWeight: "600", color: "#6c757d" }}>SALDO</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "700" }}>
              Rp {siswaData.nominal.toLocaleString("id-ID")}
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3} xs={6}>
          <Form.Label>Dari Tanggal</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => {
              setCurrentPage(1);
              setStartDate(e.target.value);
            }}
          />
        </Col>
        <Col md={3} xs={6}>
          <Form.Label>Sampai Tanggal</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => {
              setCurrentPage(1);
              setEndDate(e.target.value);
            }}
          />
        </Col>
        <Col
          md={{ span: 3, offset: 3 }}
          xs={12}
          className="d-flex align-items-end justify-content-md-end mt-3 mt-md-0"
        >
          <Button variant="secondary" onClick={handleExportPDF}>
            Download
          </Button>
        </Col>
      </Row>

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>No</th>
            <th>Tanggal</th>
            <th>Jumlah</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {riwayat.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center">Tidak ada transaksi</td>
            </tr>
          ) : (
            riwayat.map((trx, index) => (
              <tr key={trx.id_riwayatemoney}>
                <td>{index + 1}</td>
                <td>{formatTanggal(trx.tanggal)}</td>
                <td
                  style={{
                    color: trx.tipe === "pemasukan" ? "green" : "red",
                    fontWeight: "600",
                  }}
                >
                  Rp {trx.nominal.toLocaleString("id-ID")}
                </td>
                <td>{trx.keterangan}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {totalPages > 1 && renderPagination()}
    </Container>
  );
};

export default RiwayatEmoneySiswa;
