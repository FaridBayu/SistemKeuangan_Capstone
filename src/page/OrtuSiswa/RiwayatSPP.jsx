import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Table,
  Badge,
  Spinner,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import linkTest from "../../srcLink"; // ← BASE URL backend

/* ---------- HELPERS ---------- */
const semesterLabel = (sem) => {
  switch (Number(sem)) {
    case 1:
      return "Kelas 7 Semester 1";
    case 2:
      return "Kelas 7 Semester 2";
    case 3:
      return "Kelas 8 Semester 1";
    case 4:
      return "Kelas 8 Semester 2";
    case 5:
      return "Kelas 9 Semester 1";
    case 6:
      return "Kelas 9 Semester 2";
    default:
      return `Semester ${sem}`;
  }
};

const RiwayatSPP = () => {
  const [children, setChildren] = useState([]); // [{id, name}]
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailSPP, setDetailSPP] = useState([]);
  const [profile, setProfile] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ---------- FETCH LIST ANAK ORTU ID = 1 ---------- */
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await axios.get(`${linkTest}api/orang-tua/anak/1`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });

        const ids = res.data.data.map((d) => d.id_siswa);
        const infos = await Promise.all(
          ids.map((id) =>
            axios.get(`${linkTest}api/spp/${id}`, {
              headers: { "ngrok-skip-browser-warning": "true" },
            })
          )
        );

        const list = infos.map((r, idx) => ({
          id: ids[idx],
          name: r.data.data.profile.nama_lengkap,
        }));

        setChildren(list);

        if (list.length > 0) {
          const firstStudent = list[0];
          setSelectedStudent(firstStudent);
          fetchSPP(firstStudent.id);
        }
      } catch (e) {
        console.error("Gagal mengambil daftar anak:", e);
      }
    };

    fetchChildren();
  }, []);

  /* ---------- FETCH SPP PER SISWA ---------- */
  const fetchSPP = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`${linkTest}api/spp/${id}`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });

      setProfile(res.data.data.profile);
      setDetailSPP(res.data.data.detail_spp);
      setSelectedSemester("1"); // ← Default ke semester 1
      setShowMore(false);
    } catch (e) {
      console.error("Gagal mengambil data SPP:", e);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- DERIVED DATA ---------- */
  const currentDetail =
    selectedSemester && detailSPP.length
      ? detailSPP.find((d) => d.semester === Number(selectedSemester))
      : null;

  /* ---------- HANDLERS ---------- */
  const handleSelectStudent = (id) => {
    const obj = children.find((c) => c.id === Number(id));
    setSelectedStudent(obj);
    if (obj) fetchSPP(obj.id);
  };

  /* ---------- RENDER ---------- */
  return (
    <Container className="mt-4">
      <h2 className="mb-5">SELAMAT DATANG</h2>

      {/* ---------- FORM PILIH SISWA & SEMESTER ---------- */}
      <Form className="mb-4">
        <Row className="mb-3 align-items-center">
          <Form.Label column lg={1}>Siswa&nbsp;:</Form.Label>
          <Col lg={4}>
            <Form.Select
              value={selectedStudent?.id || ""}
              onChange={(e) => handleSelectStudent(e.target.value)}
            >
              <option value="" hidden>-- Pilih Siswa --</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {profile && (
          <>
            <Row className="mb-2">
              <Col><strong>NISN:</strong> {profile.nisn}</Col>
            </Row>
            <Row className="mb-4">
              <Col><strong>Kelas:</strong> {profile.kelas}</Col>
            </Row>
          </>
        )}

        <Row className="mb-3">
          <Form.Label column lg={1}>Semester&nbsp;:</Form.Label>
          <Col lg={4}>
            <Form.Select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              disabled={detailSPP.length === 0}
            >
              <option value="" hidden>-- Pilih Semester --</option>
              {detailSPP.map((d) => (
                <option key={d.semester} value={d.semester}>
                  {semesterLabel(d.semester)}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
      </Form>

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      )}

      {!loading && (
        <Row>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>INFORMASI SPP :</Card.Title>
                {currentDetail ? (
                  <>
                    <p>Semester: {semesterLabel(currentDetail.semester)}</p>
                    <hr />
                    <p>Total Biaya&nbsp;: Rp. {Number(currentDetail.total_biaya).toLocaleString("id-ID")}</p>
                    <p>Sudah Dibayar&nbsp;: Rp. {Number(currentDetail.total_pembayaran).toLocaleString("id-ID")}</p>
                    <p>Tunggakan&nbsp;: Rp. {Number(currentDetail.tunggakan).toLocaleString("id-ID")}</p>
                    <p>Tanggal Terakhir Bayar&nbsp;: {currentDetail.tanggal_terakhir_bayar}</p>
                  </>
                ) : (
                  <p>Silakan pilih siswa dan semester</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="mb-3 text-center">
              <Card.Body>
                <Card.Title>Status SPP Semester :</Card.Title>
                <div className="mb-3">
                  {currentDetail && (
                    <span className={`px-4 py-2 rounded fw-bold d-inline-block text-white ${
                      currentDetail.status === "Lunas" ? "bg-success" : "bg-danger"
                    }`}>
                      {currentDetail.status.toUpperCase()}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowMore(!showMore)}
                  disabled={detailSPP.length === 0}
                >
                  {showMore ? "TUTUP" : "LEBIH LENGKAP"}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {showMore && detailSPP.length > 0 && (
        <div className="mt-4">
          <h5>Riwayat Pembayaran SPP</h5>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Semester</th>
                <th>Total SPP</th>
                <th>Sudah Dibayar</th>
                <th>Tunggakan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {detailSPP.map((d, idx) => (
                <tr key={idx}>
                  <td>{semesterLabel(d.semester)}</td>
                  <td>Rp. {Number(d.total_biaya).toLocaleString("id-ID")}</td>
                  <td>Rp. {Number(d.total_pembayaran).toLocaleString("id-ID")}</td>
                  <td>Rp. {Number(d.tunggakan).toLocaleString("id-ID")}</td>
                  <td>
                    <Badge bg={d.status === "Lunas" ? "success" : "danger"} style={{ fontSize: "0.9rem" }}>
                      {d.status.toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default RiwayatSPP;
