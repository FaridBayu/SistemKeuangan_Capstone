import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Spinner,
  Pagination,
  Modal, // ← added
} from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import linkTest from "../../srcLink";
import Cookies from "js-cookie";

const LIMIT = 10;
const today = new Date(Date.now() + 86400000).toISOString().split("T")[0];

/*SESSION EXPIRED  */
const SessionExpiredModal = ({ show }) => {
  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("user");
    window.location.href = "/login"; // gunakan navigate jika pakai react‑router v6+
  };

  return (
    <Modal show={show} backdrop="static" keyboard={false} centered>
      <Modal.Header>
        <Modal.Title>Sesi Anda Telah Habis</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Token Anda telah kedaluwarsa. Silakan login kembali untuk melanjutkan.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleLogout}>
          Kembali ke Login
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const RiwayatEmoney = () => {
  /* ---------- STATE ---------- */
  const token = Cookies.get("token");
  const [children, setChildren] = useState([]);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [detailSiswa, setDetailSiswa] = useState({
    nisn: "",
    nama: "",
    kelas: "",
  });
  const [saldo, setSaldo] = useState(0);
  const [transaksi, setTransaksi] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [startDate, setStartDate] = useState(""); // default ""
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  /* ---------- FETCH DATA (LIST + DETAIL) ---------- */
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: LIMIT,
        tgl_awal: startDate,
        tgl_akhir: endDate,
      };

      const res = await axios.get(`${linkTest}api/orang-tua/anak/emoney`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      const list = res.data?.data || [];

      /* build child list once */
      if (children.length === 0) {
        const childList = list.map((item) => ({
          id: item.id_siswa,
          name: item.nama_siswa,
        }));
        setChildren(childList);
        if (childList.length && !selectedSiswa) setSelectedSiswa(childList[0]);
      }

      /* detail untuk siswa terpilih */
      if (selectedSiswa) {
        const childData = list.find((c) => c.id_siswa === selectedSiswa.id);

        if (childData) {
          const em = childData.emoney || {};
          setDetailSiswa({
            nisn: em.nisn || "",
            nama: em.nama_lengkap || childData.nama_siswa,
            kelas: em.kelas || "",
          });
          setSaldo(em.nominal || 0);

          const rows = childData.riwayat?.data || [];
          setTransaksi(
            rows.map((it) => ({
              tanggal: (it.tanggal || "").split("T")[0],
              jumlah: it.nominal,
              keterangan: it.keterangan,
              tipe: it.nama_tipe,
            }))
          );

          setTotalPage(childData.riwayat?.pagination?.totalPage || 1);
        }
      }
    } catch (err) {
      /* deteksi token kedaluwarsa */
      if (
        err.response &&
        err.response.status === 500 &&
        typeof err.response.data?.message === "string" &&
        err.response.data.message.toLowerCase().includes("jwt expired")
      ) {
        setSessionExpired(true);
      } else {
        console.error("Gagal mengambil data e-money:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------- EFFECTS ---------- */
  useEffect(() => {
    if (token) fetchData();
    else setSessionExpired(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSiswa, page, startDate, endDate]);

  /* ---------- EXPORT PDF ---------- */
  const handleExportPDF = () => {
    if (!selectedSiswa) return;

    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    doc.setFontSize(16);
    doc.text(`Riwayat Transaksi — ${detailSiswa.nama}`, 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["No", "Tanggal", "Jumlah", "Keterangan"]],
      body: transaksi.map((t, i) => [
        i + 1,
        t.tanggal,
        `Rp ${t.jumlah.toLocaleString("id-ID")}`,
        t.keterangan,
      ]),
    });

    doc.save(`Riwayat_${detailSiswa.nama}.pdf`);
  };

  /* ---------- HANDLER PAGINATION ---------- */
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPage, p + 1));

  /* ---------- UI ---------- */
  return (
    <>
      {/* MODAL UNTUK TOKEN EXPIRED */}
      <SessionExpiredModal show={sessionExpired} />

      <Container className="mt-4 pb-5 pb-sm-0">
        <h2 className="mb-4">Riwayat Emoney</h2>

        {/* PILIH SISWA */}
        <Row className="mb-3 align-items-center">
          <Form.Label column lg={1}>
            Siswa&nbsp;:
          </Form.Label>

          <Col xs={12} lg={4}>
            <Form.Select
              value={selectedSiswa?.id || ""}
              onChange={(e) => {
                const s = children.find((c) => c.id === Number(e.target.value));
                setSelectedSiswa(s);
                setStartDate("");
                setEndDate(today);
                setPage(1);
              }}
            >
              <option value="" hidden>
                -- Pilih Siswa --
              </option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {/* DETAIL SISWA */}
        <Row className="mb-3">
          <Col xs={12}>
            <div>
              <strong>NISN&nbsp;:</strong> {detailSiswa.nisn || "-"}
            </div>
          </Col>
          <Col xs={12}>
            <div>
              <strong>Kelas&nbsp;:</strong> {detailSiswa.kelas || "-"}
            </div>
          </Col>
        </Row>

        {/* SALDO */}
        <Row className="mb-3">
          <Col xs={12} md={6}>
            <div className="p-3 bg-light rounded shadow-sm text-center">
              <div style={{ fontWeight: 600, color: "#6c757d" }}>SALDO</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>
                Rp {saldo.toLocaleString("id-ID")}
              </div>
            </div>
          </Col>
        </Row>

        {/* FILTER & DOWNLOAD */}
        <Row className="mb-3">
          <Col md={3} xs={6}>
            <Form.Label>Dari Tanggal</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
          </Col>
          <Col md={3} xs={6}>
            <Form.Label>Sampai Tanggal</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
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

        {/* TABEL RIWAYAT */}
        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" />
          </div>
        ) : (
          <>
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
                {transaksi.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center">
                      Tidak ada transaksi
                    </td>
                  </tr>
                ) : (
                  transaksi.map((t, i) => (
                    <tr key={i}>
                      <td>{(page - 1) * LIMIT + i + 1}</td>
                      <td>{t.tanggal}</td>
                      <td
                        style={{
                          color: t.tipe === "Pemasukan" ? "green" : "red",
                          fontWeight: 600,
                        }}
                      >
                        Rp {t.jumlah.toLocaleString("id-ID")}
                      </td>
                      <td>{t.keterangan}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            {/* PAGINATION */}
            {totalPage > 1 && (
              <Pagination className="justify-content-center pt-3">
                <Pagination.Prev disabled={page === 1} onClick={handlePrev} />
                <Pagination.Item active>{page}</Pagination.Item>
                <Pagination.Next
                  disabled={page === totalPage}
                  onClick={handleNext}
                />
              </Pagination>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default RiwayatEmoney;
