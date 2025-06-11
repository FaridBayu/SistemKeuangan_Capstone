import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const RiwayatSPP = () => {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const students = {
    siswa1: {
      nisn: "1234567890",
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
    },
    siswa2: {
      nisn: "0987654321",
      spp: {
        "semester 1": {
          buku: 300000,
          asuransi: 100000,
          seragam: 50000,
          operasional: 600000,
          total: 1050000,
          status: "LUNAS"
        },
        "semester 2": {
          buku: 450000,
          asuransi: 90000,
          seragam: 50000,
          operasional: 650000,
          total: 1240000,
          status: "LUNAS"
        }
      }
    }
  };

  const currentStudent = students[selectedStudent];

  // Ambil semester pertama jika tidak ada semester dipilih
  const semesterToUse = selectedSemester || (
    currentStudent ? Object.keys(currentStudent.spp)[0] : ""
  );

  const sppInfo =
    currentStudent && semesterToUse
      ? currentStudent.spp[semesterToUse]
      : null;

  const handleNavigate = () => {
    if (currentStudent && sppInfo) {
      navigate("/infoSPP", {
        state: {
          student: selectedStudent,
          semester: semesterToUse,
          data: sppInfo
        }
      });
    }
  };

  return (
    <Container className="mt-4">
      <h4 className="mb-4">SELAMAT DATANG</h4>

      <Form>
        <Row className="mb-3">
          <Form.Label column lg={1}>SISWA :</Form.Label>
          <Col lg={4}>
            <Form.Select
              value={selectedStudent}
              onChange={(e) => {
                setSelectedStudent(e.target.value);
                setSelectedSemester(""); // reset semester saat siswa berubah
              }}
            >
              <option value="" hidden>-- Pilih Siswa --</option>
              <option value="siswa1">Siswa 1</option>
              <option value="siswa2">Siswa 2</option>
            </Form.Select>
          </Col>
        </Row>

        <Row className="mb-3">
          <Form.Label column lg={1}>NISN :</Form.Label>
          <Col lg={4}>
            <Form.Control plaintext readOnly value={currentStudent ? currentStudent.nisn : ""} />
          </Col>
        </Row>

        <Row className="mb-4">
          <Form.Label column lg={1}>Semester :</Form.Label>
          <Col lg={4}>
            <Form.Select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              disabled={!selectedStudent}
            >
              <option value="" hidden>-- Pilih Semester --</option>
              <option value="semester 1">Semester 1</option>
              <option value="semester 2">Semester 2</option>
              <option value="semester 3">Semester 3</option>
              <option value="semester 4">Semester 4</option>
              <option value="semester 5">Semester 5</option>
              <option value="semester 6">Semester 6</option>
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
                  <p>Biaya Operasional sekolah : Rp.{sppInfo.operasional.toLocaleString("id-ID")}</p>
                  <hr />
                  <strong>Total SPP : Rp.{sppInfo.total.toLocaleString("id-ID")}</strong>
                </>
              ) : (
                <p>Silakan pilih siswa</p>
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
                disabled={!currentStudent}
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

export default RiwayatSPP;