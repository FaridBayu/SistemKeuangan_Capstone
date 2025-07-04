import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Pagination,
  Modal,
} from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import linkTest from "../../srcLink";
import Cookies from "js-cookie";

const LIMIT = 10;

/* ───────── Modal sesi kedaluwarsa ───────── */
const SessionExpiredModal = ({ show }) => {
  const goLogin = () => (window.location.href = "/login");

  return (
    <Modal show={show} backdrop="static" keyboard={false} centered>
      <Modal.Header>
        <Modal.Title>Sesi Anda Telah Habis</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Token Anda kedaluwarsa. Silakan login kembali untuk melanjutkan.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={goLogin}>
          Kembali ke Login
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
/* ─────────────────────────────────────────── */

const RiwayatEmoneySiswa = () => {
  const token = Cookies.get("token");

  /* ---------- state ---------- */
  const [siswaData, setSiswaData] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  /* ---------- helper deteksi token expired ---------- */
  const isExpired = (err) =>
    err?.response?.status === 500 &&
    typeof err.response.data?.message === "string" &&
    err.response.data.message.toLowerCase().includes("jwt expired");

  /* ---------- set default endDate = hari ini ---------- */
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setEndDate(tomorrow.toISOString().split("T")[0]);
  }, []);

  /* ---------- fetch data setiap perubahan page / tanggal ---------- */
  useEffect(() => {
    if (!token) {
      setShowExpiredModal(true);
      return;
    }

    const fetchData = async () => {
      try {
        const url =
          `${linkTest}api/emoney/siswa?page=${currentPage}&limit=${LIMIT}` +
          (startDate ? `&tgl_awal=${startDate}` : "") +
          (endDate ? `&tgl_akhir=${endDate}` : "");

        const { data: res } = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
            Accept: "application/json",
          },
        });

        /* ----- perbaikan akses properti ----- */
        const studentInfo = res.data || {};
        setSiswaData(studentInfo);

        const riwObj = res.riwayat ?? studentInfo.riwayat ?? {};
        setRiwayat(riwObj.data || []);
        setTotalPages(riwObj.pagination?.totalPage || 1);
      } catch (err) {
        if (isExpired(err)) {
          Cookies.remove("token");
          setShowExpiredModal(true);
        } else {
          console.error("Gagal memuat data e‑money:", err);
        }
      }
    };

    fetchData();
  }, [currentPage, startDate, endDate, token]);

  /* ---------- helpers ---------- */
  const formatTanggal = (iso) => new Date(iso).toLocaleDateString("id-ID");

  const handleExportPDF = () => {
    if (!siswaData) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Riwayat Transaksi - ${siswaData.nama_lengkap}`, 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["No", "Tanggal", "Jumlah", "Keterangan"]],
      body: riwayat.map((t, i) => [
        (currentPage - 1) * LIMIT + i + 1, // nomor global
        formatTanggal(t.tanggal),
        `Rp ${t.nominal.toLocaleString("id-ID")}`,
        t.keterangan,
      ]),
    });

    doc.save(`Riwayat_${siswaData.nama_lengkap}.pdf`);
  };

  const paginationUi = (
    <Pagination className="justify-content-center">
      <Pagination.Prev
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
      />
      <Pagination.Item active>{currentPage}</Pagination.Item>
      <Pagination.Next
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
      />
    </Pagination>
  );

  /* ---------- render ---------- */
  if (!siswaData && !showExpiredModal) {
    return <Container className="mt-4">Memuat data…</Container>;
  }

  return (
    <Container className="mt-4">
      <SessionExpiredModal show={showExpiredModal} />

      {siswaData && (
        <>
          <h2 className="mb-5">Riwayat E‑Money</h2>

          {/* profil */}
          <Row className="mb-2">
            <Col>
              <strong>Nama Siswa:</strong> {siswaData.nama_lengkap}
            </Col>
          </Row>
          <Row className="mb-2">
            <Col>
              <strong>Kelas:</strong> {siswaData.kelas}
            </Col>
          </Row>
          <Row className="mb-4">
            <Col>
              <strong>NISN:</strong> {siswaData.nisn}
            </Col>
          </Row>

          {/* saldo */}
          <Row className="mb-3">
            <Col xs={12} md={6}>
              <div className="p-3 bg-white rounded shadow-sm text-center">
                <div className="text-secondary fw-semibold">SALDO</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>
                  Rp {siswaData.nominal.toLocaleString("id-ID")}
                </div>
              </div>
            </Col>
          </Row>

          {/* filter tanggal */}
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

          {/* tabel riwayat */}
          <h4 className="py-3">History E‑Money</h4>
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
                  <td colSpan={4} className="text-center">
                    Tidak ada transaksi
                  </td>
                </tr>
              ) : (
                riwayat.map((t, i) => (
                  <tr key={`${t.tanggal}-${i}`}>
                    <td>{(currentPage - 1) * LIMIT + i + 1}</td>
                    <td>{formatTanggal(t.tanggal)}</td>
                    <td
                      style={{
                        color: t.nama_tipe === "Pemasukan" ? "green" : "red",
                        fontWeight: 600,
                      }}
                    >
                      Rp {t.nominal.toLocaleString("id-ID")}
                    </td>
                    <td>{t.keterangan}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {totalPages > 1 && paginationUi}
        </>
      )}
    </Container>
  );
};

export default RiwayatEmoneySiswa;
