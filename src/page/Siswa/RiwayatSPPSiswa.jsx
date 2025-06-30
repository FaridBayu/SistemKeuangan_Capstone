import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
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
import linkTest from "../../srcLink";

const RiwayatSPPSiswa = () => {
  const [data, setData] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const didMountRef = useRef(false); // ← mencegah fetch dobel
  const id_siswa = 14;

  const getSemesterLabel = (sem) => {
    if (!sem) return "-";
    const grade = 6 + Math.ceil(Number(sem) / 2);
    const semPart = Number(sem) % 2 === 1 ? 1 : 2;
    return `Kelas ${grade} Semester ${semPart}`.toLowerCase();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${linkTest}api/spp/${id_siswa}`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
            Accept: "application/json",
          },
        });
        setData(res.data.data);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      } finally {
        setLoading(false);
      }
    };

    // Hanya jalankan fetch setelah initial render (StrictMode Safe)
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!data) {
    return (
      <Container className="text-center mt-5">
        <p>Data tidak ditemukan.</p>
      </Container>
    );
  }

  const { profile, spp_component, detail_spp } = data;

  const semesterDipilih = selectedSemester || detail_spp[0]?.semester;
  const komponenSemester = spp_component.filter(
    (item) => item.semester === Number(semesterDipilih)
  );
  const detailSemester = detail_spp.find(
    (d) => d.semester === Number(semesterDipilih)
  );

  return (
    <Container className="mt-4">
      <h2 className="mb-5">SELAMAT DATANG</h2>

      <Row className="mb-2">
        <Col>
          <strong>Nama Siswa:</strong> {profile.nama_lengkap}
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <strong>NISN:</strong> {profile.nisn}
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <strong>Kelas:</strong> {profile.kelas}
        </Col>
      </Row>

      {/* Filter Semester */}
      <Form className="mb-4">
        <Row className="mb-3">
          <Form.Label column lg={1}>
            Semester:
          </Form.Label>
          <Col lg={4}>
            <Form.Select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="">-- Pilih Semester --</option>
              <option value="1">kelas 7 semester 1</option>
              <option value="2">kelas 7 semester 2</option>
              <option value="3">kelas 8 semester 1</option>
              <option value="4">kelas 8 semester 2</option>
              <option value="5">kelas 9 semester 1</option>
              <option value="6">kelas 9 semester 2</option>
            </Form.Select>
          </Col>
        </Row>
      </Form>

      <Row>
        {/* Informasi Komponen */}
        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>INFORMASI SPP :</Card.Title>
              {komponenSemester.length > 0 ? (
                <>
                  <p>Semester: {getSemesterLabel(semesterDipilih)}</p>
                  {komponenSemester.map((komp, i) => (
                    <p key={i}>
                      {komp.keterangan}: Rp.{" "}
                      {Number(komp.nominal).toLocaleString("id-ID")}
                    </p>
                  ))}
                  <hr />
                  <strong>
                    Total SPP : Rp.{" "}
                    {Number(detailSemester?.total_biaya || 0).toLocaleString(
                      "id-ID"
                    )}
                  </strong>
                </>
              ) : (
                <p>Silakan pilih semester</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Status Pembayaran */}
        <Col md={6}>
          <Card className="mb-3">
            <Card.Body className="text-center">
              <Card.Title>Status SPP Semester:</Card.Title>
              {detailSemester && (
                <div className="mb-3">
                  <span
                    className={`px-4 py-2 rounded fw-bold d-inline-block text-white ${
                      detailSemester.status === "Lunas"
                        ? "bg-success"
                        : "bg-danger"
                    }`}
                  >
                    {detailSemester.status}
                  </span>
                </div>
              )}
              <Button
                variant="outline-secondary"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "TUTUP" : "LEBIH LENGKAP"}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabel Riwayat */}
      {showMore && (
        <div className="mt-4">
          <h5>Riwayat Pembayaran SPP</h5>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>SEMESTER</th>
                <th>Total SPP</th>
                <th>Sudah Dibayar</th>
                <th>Tunggakan</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {detail_spp.map((item, index) => (
                <tr key={index}>
                  <td>{getSemesterLabel(item.semester)}</td>
                  <td>Rp. {Number(item.total_biaya).toLocaleString("id-ID")}</td>
                  <td>
                    Rp. {Number(item.total_pembayaran).toLocaleString("id-ID")}
                  </td>
                  <td>Rp. {Number(item.tunggakan).toLocaleString("id-ID")}</td>
                  <td>
                    <Badge
                      bg={item.status === "Lunas" ? "success" : "danger"}
                      style={{ fontSize: "0.9rem" }}
                    >
                      {item.status}
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

export default RiwayatSPPSiswa;
