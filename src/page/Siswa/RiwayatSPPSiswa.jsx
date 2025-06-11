import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const RiwayatSPPSiswa = () => {
  const navigate = useNavigate();
  const [selectedSemester, setSelectedSemester] = useState("");

  const siswaLogin = {
    nama: "Budi",
    nisn: "1234567890",
    kelas: "8A",
    spp: {
      "semester 1": {
        buku: 400000,
        asuransi: 100000,
        seragam: 0,
        operasional: 700000,
        total: 1200000,
        status: "LUNAS"
      },
      "semester 2": {
        buku: 500000,
        asuransi: 100000,
        seragam: 0,
        operasional: 700000,
        total: 1300000,
        status: "BELUM LUNAS"
      }
    }
  };

  const semesterToUse = selectedSemester || Object.keys(siswaLogin.spp)[0];
  const sppInfo = siswaLogin.spp[semesterToUse];

  const handleNavigate = () => {
    navigate("/infoSPPSiswa", {
      state: {
        student: {
          nama: siswaLogin.nama,
          nisn: siswaLogin.nisn,
          kelas: siswaLogin.kelas
        },
        data: siswaLogin.spp
      }
    });
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-5">SELAMAT DATANG</h2>

      <Row className="mb-2">
        <Col><strong>Nama Siswa:</strong> {siswaLogin.nama}</Col>
      </Row>
      <Row className="mb-2">
        <Col><strong>NISN:</strong> {siswaLogin.nisn}</Col>
      </Row>
      <Row className="mb-4">
        <Col><strong>Kelas:</strong> {siswaLogin.kelas}</Col>
      </Row>

      <Form className="mb-4">
        <Row className="mb-3">
          <Form.Label column lg={1}>Semester :</Form.Label>
          <Col lg={4}>
            <Form.Select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="" hidden>-- Pilih Semester --</option>
              {Object.keys(siswaLogin.spp).map((sem, idx) => (
                <option key={idx} value={sem}>{sem}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>
      </Form>

      <Row>
        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>INFORMASI SPP :</Card.Title>
              {sppInfo ? (
                <>
                  <p>Semester: {semesterToUse}</p>
                  <p>Biaya Buku : Rp.{sppInfo.buku.toLocaleString("id-ID")}</p>
                  <p>Biaya Asuransi : Rp.{sppInfo.asuransi.toLocaleString("id-ID")}</p>
                  <p>Biaya Seragam : Rp.{sppInfo.seragam.toLocaleString("id-ID")}</p>
                  <p>Biaya Operasional : Rp.{sppInfo.operasional.toLocaleString("id-ID")}</p>
                  <hr />
                  <strong>Total SPP : Rp.{sppInfo.total.toLocaleString("id-ID")}</strong>
                </>
              ) : (
                <p>Silakan pilih semester</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-3">
            <Card.Body className="text-center">
              <Card.Title>Status SPP Semester :</Card.Title>
              <div className="mb-3">
                {sppInfo && (
                  <span
                    className={`px-4 py-2 rounded fw-bold d-inline-block text-white ${
                      sppInfo.status === "LUNAS" ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {sppInfo.status}
                  </span>
                )}
              </div>
              <Button 
                variant="outline-secondary"
                onClick={handleNavigate}
                disabled={!sppInfo}
              >
                LEBIH LENGKAP
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RiwayatSPPSiswa;
