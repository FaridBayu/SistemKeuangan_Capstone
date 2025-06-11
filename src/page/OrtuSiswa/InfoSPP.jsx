import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Form, Table, Badge } from "react-bootstrap";

const students = {
  siswa1: {
    nama: "siswa 1",
    nisn: "1234567890",
    spp: {
      "semester 1": {
        tahun: 2023,
        kelas: "10A",
        total: 1200000,
        status: "LUNAS"
      },
      "semester 2": {
        tahun: 2023,
        kelas: "10A",
        total: 1300000,
        status: "BELUM LUNAS"
      }
    }
  },
  siswa2: {
    nama: "Siswa 2",
    nisn: "0987654321",
    spp: {
      "semester 1": {
        tahun: 2023,
        kelas: "10B",
        total: 1050000,
        status: "LUNAS"
      },
      "semester 2": {
        tahun: 2023,
        kelas: "10B",
        total: 1240000,
        status: "LUNAS"
      }
    }
  }
};

const InfoSPP = () => {
  const location = useLocation();
  const { student } = location.state || {};

  const studentInfo = student ? students[student] : null;

  const sppData = studentInfo
    ? Object.entries(studentInfo.spp).map(([semester, info]) => ({
        semester,
        tahun: info.tahun,
        kelas: info.kelas,
        jumlah: info.total,
        status: info.status
      }))
    : [];

  const [filterSemester, setFilterSemester] = useState("");
  const [filterTahun, setFilterTahun] = useState("");

  const filteredData = sppData.filter((item) => {
    const matchSemester = filterSemester ? item.semester === filterSemester : true;
    const matchTahun = filterTahun ? item.tahun.toString() === filterTahun : true;
    return matchSemester && matchTahun;
  });

  return (
    <Container className="mt-4">
      <h5>SELAMAT DATANG ORANG TUA</h5>

      {studentInfo && (
        <div className="mb-3">
          <strong>Nama Siswa:</strong> {studentInfo.nama} <br />
          <strong>NISN:</strong> {studentInfo.nisn}
        </div>
      )}

      <Row className="my-3">
        <Col md={3}>
          <Form.Select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
          >
            <option value="">Semua SEM</option>
            {[...new Set(sppData.map((item) => item.semester))].map((sem, i) => (
              <option key={i} value={sem}>{sem}</option>
            ))}
          </Form.Select>
        </Col>

        <Col md={3}>
          <Form.Select
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
          >
            <option value="">Semua Tahun</option>
            {[...new Set(sppData.map((item) => item.tahun))].map((year, i) => (
              <option key={i} value={year}>{year}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Table bordered hover>
        <thead className="table-secondary">
          <tr>
            <th>KELAS</th>
            <th>SEMESTER</th>
            <th>TAHUN</th>
            <th>JUMLAH</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <tr key={index}>
                <td>{item.kelas}</td>
                <td>{item.semester}</td>
                <td>{item.tahun}</td>
                <td style={{ fontWeight: "bold" }}>
                  {item.jumlah.toLocaleString("id-ID")}
                </td>
                <td>
                  <Badge
                    bg={item.status === "LUNAS" ? "success" : "danger"}
                    style={{ fontSize: "0.9rem" }}
                  >
                    {item.status}
                  </Badge>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">Tidak ada data</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default InfoSPP;