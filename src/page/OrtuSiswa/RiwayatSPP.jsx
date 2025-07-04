/* eslint-disable react-hooks/exhaustive-deps */
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
  Modal,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import Cookies from "js-cookie";
import linkTest from "../../srcLink";


/*  MODAL TOKEN EXPIRED*/

const SessionExpiredModal = ({ show, onClose }) => {
  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("user");
    window.location.href = "/login";
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      backdrop="static"
      keyboard={false}
      centered
    >
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


const semesterLabel = (sem) => {
  const n = Number(sem);
  const grade = 6 + Math.ceil(n / 2); 
  const semPart = n % 2 === 1 ? 1 : 2;
  return `Kelas ${grade} Semester ${semPart}`;
};


const RiwayatSPP = () => {
  const token = Cookies.get("token");

  /*  state  */
  const [data, setData] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  /*  fetche*/
  useEffect(() => {
    if (!token) {
      setSessionExpired(true);
      return;
    }

    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${linkTest}api/orang-tua/anak/spp`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
            Accept: "application/json",
          },
        });

        if (res.data.status === "success") {
          const arr = res.data.data;
          setData(arr);

          const childList = arr.map((d) => ({
            id: d.id_siswa,
            name: d.nama_siswa,
          }));
          setChildren(childList);

          if (arr.length) {
            setSelectedId(arr[0].id_siswa.toString());
            setSelectedSemester("1");
          }
        }
      } catch (err) {
        if (
          err.response &&
          err.response.status === 500 &&
          typeof err.response.data?.message === "string" &&
          err.response.data.message.toLowerCase().includes("jwt expired")
        ) {
          setSessionExpired(true);
        } else {
          console.error("Gagal mengambil data:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  
  const currentStudent = data.find((d) => d.id_siswa === Number(selectedId));
  const detailSPP = currentStudent?.detail_spp || [];
  const profile = currentStudent?.profile || null;
  const componentSPP = currentStudent?.spp_component || [];

  const currentDetail =
    detailSPP.find((d) => d.semester === Number(selectedSemester)) || null;

  const currentComponents = componentSPP.filter(
    (c) => c.semester === Number(selectedSemester)
  );

 
  const onSelectStudent = (id) => {
    setSelectedId(id);
    setSelectedSemester("1");
    setShowMore(false);
  };

  /* KONTEN*/
  return (
    <>
      {/* MODAL TOKEN EXPIRED */}
      <SessionExpiredModal
        show={sessionExpired}
        onClose={() => setSessionExpired(false)}
      />

      <Container className="mt-4 pb-5 pb-sm-0">
        <h2 className="mb-5">SELAMAT DATANG</h2>

        {/* -FORM PILIH SISWA & SEMESTER */}
        <Form className="mb-4">
          <Row className="mb-3 align-items-center">
            <Form.Label column lg={1}>
              Siswa&nbsp;:
            </Form.Label>
            <Col lg={4}>
              <Form.Select
                value={selectedId}
                onChange={(e) => onSelectStudent(e.target.value)}
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

          {profile && (
            <>
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
            </>
          )}

          <Row className="mb-3">
            <Form.Label column lg={1}>
              Semester&nbsp;:
            </Form.Label>
            <Col lg={4}>
              <Form.Select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                disabled={!detailSPP.length}
              >
                <option value="" hidden>
                  -- Pilih Semester --
                </option>
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

        {!loading && currentStudent && (
          <Row>
            {/*informasi SPP (summary + komponen) */}
            <Col md={6}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>INFORMASI SPP :</Card.Title>
                  {currentDetail ? (
                    <>
                      <p>
                        Semester&nbsp;: {semesterLabel(currentDetail.semester)}
                      </p>
                      <hr />
                      {/* Komponen SPP */}
                      <h6>Rincian Komponen :</h6>
                      {currentComponents.length > 0 ? (
                        <ul className=" list-unstyled mb-3 ps-3">
                          {currentComponents.map((c, idx) => (
                            <li key={idx} className="mb-1">
                              {c.keterangan} : Rp{" "}
                              {Number(c.nominal).toLocaleString("id-ID")}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>Tidak ada komponen untuk semester ini.</p>
                      )}

                      <hr className="my-3" />

                      <p>
                        <strong>Total SPP&nbsp;:</strong> Rp{" "}
                        {Number(currentDetail.total_biaya).toLocaleString(
                          "id-ID"
                        )}
                      </p>
                    </>
                  ) : (
                    <p>Silakan pilih siswa dan semester</p>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/*status*/}
            <Col md={6}>
              <Card className="mb-3 text-center">
                <Card.Body>
                  <Card.Title>Status SPP Semester :</Card.Title>
                  <div className="mb-3">
                    {currentDetail && (
                      <span
                        className={`px-4 py-2 rounded fw-bold d-inline-block text-white ${
                          currentDetail.status === "Lunas"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {currentDetail.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowMore(!showMore)}
                    disabled={!detailSPP.length}
                  >
                    {showMore ? "TUTUP" : "LEBIH LENGKAP"}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/*tabel riwayat semua semester*/}
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
                    <td>Rp {Number(d.total_biaya).toLocaleString("id-ID")}</td>
                    <td>
                      Rp {Number(d.total_pembayaran).toLocaleString("id-ID")}
                    </td>
                    <td>Rp {Number(d.tunggakan).toLocaleString("id-ID")}</td>
                    <td>
                      <Badge
                        bg={d.status === "Lunas" ? "success" : "danger"}
                        style={{ fontSize: "0.9rem" }}
                      >
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
    </>
  );
};

export default RiwayatSPP;
