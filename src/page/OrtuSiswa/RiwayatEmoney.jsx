import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Spinner,
  Pagination,          // ← NEW
} from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import linkTest from "../../srcLink";

const LIMIT = 10;

const RiwayatEmoney = () => {
  /* ---------- STATE ---------- */
  const [children, setChildren] = useState([]);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [saldo, setSaldo] = useState(0);
  const [transaksi, setTransaksi] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);     // ← NEW
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------- FETCH LIST ANAK ---------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${linkTest}api/orang-tua/anak/1`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        const ids = res.data.data.map((d) => d.id_siswa);

        const detail = await Promise.all(
          ids.map((id) =>
            axios.get(`${linkTest}api/emoney/${id}`, {
              headers: { "ngrok-skip-browser-warning": "true" },
              params: { page: 1, limit: 1 },
            })
          )
        );

        const childList = detail.map((r, idx) => ({
          id: ids[idx],
          name: r.data.data.nama_lengkap || `Siswa ${ids[idx]}`,
        }));

        setChildren(childList);
        if (childList.length) setSelectedSiswa(childList[0]);
      } catch (e) {
        console.error("Gagal mengambil daftar anak:", e);
      }
    })();
  }, []);

  /* ---------- FETCH DATA E-MONEY ---------- */
  useEffect(() => {
    const fetchEmoney = async () => {
      if (!selectedSiswa) return;
      setLoading(true);
      try {
        const params = {
          page,
          limit: LIMIT,
          tgl_awal: startDate || "",
          tgl_akhir: endDate || "",
        };

        const res = await axios.get(
          `${linkTest}api/emoney/${selectedSiswa.id}`,
          { headers: { "ngrok-skip-browser-warning": "true" }, params }
        );

        setSaldo(res.data.data.nominal || 0);

        const rows = res.data.riwayat?.data || [];
        setTransaksi(
          rows.map((it) => ({
            tanggal: it.tanggal.split("T")[0],
            jumlah: it.nominal,
            keterangan: it.keterangan,
            tipe: it.nama_tipe,
          }))
        );

        /* Ambil totalPage dari backend */
        const tp = res.data.riwayat?.pagination?.totalPage || 1;
        setTotalPage(tp);
      } catch (e) {
        console.error("Gagal mengambil data e-money:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchEmoney();
  }, [selectedSiswa, startDate, endDate, page]);

  /* ---------- EXPORT PDF ---------- */
  const handleExportPDF = () => {
    if (!selectedSiswa) return;

    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    doc.setFontSize(16);
    doc.text(`Riwayat Transaksi — ${selectedSiswa.name}`, 14, 15);

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

    doc.save(`Riwayat_${selectedSiswa.name}.pdf`);
  };

  /* ---------- HANDLER PAGINATION ---------- */
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPage, p + 1));

  /* ---------- UI ---------- */
  return (
    <Container className="mt-4">
      <h2 className="mb-4">Riwayat Emoney</h2>

      {/* PILIH SISWA */}
      <Row className="mb-3">
        <Col xs={12} md={6}>
          <Form.Group controlId="selectSiswa">
            <Form.Label><strong>SISWA :</strong></Form.Label>
            <Form.Select
              value={selectedSiswa?.id || ""}
              onChange={(e) => {
                const s = children.find((c) => c.id === Number(e.target.value));
                setSelectedSiswa(s);
                setStartDate("");
                setEndDate("");
                setPage(1);               // reset page
              }}
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* SALDO */}
      <Row className="mb-2">
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
              setPage(1);                 // reset page
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
              setPage(1);                 // reset page
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
                        color: t.tipe === "pemasukan" ? "green" : "red",
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
            <Pagination className="justify-content-center">
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
  );
};

export default RiwayatEmoney;
