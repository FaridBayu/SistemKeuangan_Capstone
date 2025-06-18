import { useState, useEffect } from "react";
import axios from "axios";
import linkTest from "../../srcLink";
import {
  Container,
  Table,
  Button,
  Row,
  Col,
  Form,
  Pagination,
  Modal,
  Toast,
  ToastContainer,
} from "react-bootstrap";

const StatusSiswa = () => {
  // ──────────────────────── state utama ────────────────────────
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ───────────── state modal “Tambah Beasiswa” ─────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedBeasiswa, setSelectedBeasiswa] = useState("");

  // ──────────────────────── modal lain ────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteData, setDeleteData] = useState(null);

  // ───────────────────────── toast ──────────────────────────
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastBg, setToastBg] = useState("success");

  // ────────────── modal konfirmasi umum ──────────────
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState(() => () => {});

  // ───────────────────── helper display ─────────────────────
  const semesterToText = (s) =>
    ({
      1: "Kelas 7 Semester 1",
      2: "Kelas 7 Semester 2",
      3: "Kelas 8 Semester 1",
      4: "Kelas 8 Semester 2",
      5: "Kelas 9 Semester 1",
      6: "Kelas 9 Semester 2",
    }[s] || `Semester ${s}`);

  const beasiswaText = (id) =>
    ({
      1: "Beasiswa Prestasi",
      2: "Beasiswa Kurang Mampu",
      3: "Beasiswa Yatim Piatu",
      4: "Beasiswa Tahfidz",
    }[id] || `ID ${id}`);

  // ───────────────────── fetch data ─────────────────────
  const fetchBeasiswa = async (page = currentPage) => {
    try {
      const res = await axios.get(
        `${linkTest}beasiswa?input=${encodeURIComponent(
          searchTerm
        )}&filter=${selectedFilter}&page=${page}`,
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );
      if (res.data.status === "success") {
        const arr = res.data.data.map((item) => ({
          id_beasiswa: item.id_beasiswa,
          id_siswa: item.id_siswa,
          nisn: item.id_siswa.toString(),
          name: item.nama_lengkap,
          kelas: item.kelas,
          semester: item.semester,
          id_beasiswaComponent: item.id_beasiswaComponent,
          beasiswa: item.keterangan,
          masa: semesterToText(item.semester),
        }));
        setStudents(arr);
        setTotalPages(res.data.totalPages || 1);
      } else setStudents([]);
    } catch (e) {
      console.error(e);
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchBeasiswa(currentPage);
  }, [currentPage, searchTerm, selectedFilter]);

  const handlePage = (p) => setCurrentPage(p);

  // ───────────── fungsi pencarian siswa ─────────────
  const searchSiswa = async (v) => {
    setSearchInput(v);
    setSelectedSiswa(null);
    if (!v.trim()) return setSearchResults([]);
    try {
      const res = await axios.get(`${linkTest}beasiswa/search?input=${v}`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      if (res.data.status === "success") setSearchResults(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  // ───────────── helper: reset form tambah ─────────────
  const resetAddForm = () => {
    setSelectedSiswa(null);
    setSearchInput("");
    setSelectedSemester("");
    setSelectedBeasiswa("");
    setSearchResults([]);
  };

  // ───────────── buka & tutup modal tambah ─────────────
  const addBeasiswa = () => {
    resetAddForm();
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    resetAddForm();
    setShowAddModal(false);
  };

  // ───────────── konfirmasi tambah ─────────────
  const confirmAdd = async () => {
    try {
      const res = await axios.post(
        `${linkTest}beasiswa/insert`,
        {
          id_siswa: selectedSiswa.id_siswa,
          semester: selectedSemester,
          id_beasiswaComponent: selectedBeasiswa,
        },
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );
      if (res.data.status === "success") {
        setToastBg("success");
        setToastMessage("Beasiswa berhasil ditambahkan!");
        setShowToast(true);
        fetchBeasiswa(currentPage);
        handleCloseAddModal(); // tutup + reset
      } else throw 1;
    } catch {
      setToastBg("danger");
      setToastMessage("Gagal menambahkan beasiswa.");
      setShowToast(true);
    }
  };

  // ───────────── edit ─────────────
  const triggerEdit = (d) => {
    setEditData({ ...d });
    setShowEditModal(true);
  };
  const confirmEdit = async () => {
    try {
      const res = await axios.put(
        `${linkTest}beasiswa/update/${editData.id_beasiswa}`,
        { id_beasiswaComponent: editData.id_beasiswaComponent },
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );
      if (res.data.status === "success") {
        setToastBg("success");
        setToastMessage("Data beasiswa berhasil diubah!");
        setShowToast(true);
        setShowEditModal(false);
        fetchBeasiswa(currentPage);
      } else throw 1;
    } catch {
      setToastBg("danger");
      setToastMessage("Gagal mengubah beasiswa.");
      setShowToast(true);
    }
  };

  // ───────────── delete ─────────────
  const triggerDelete = (d) => {
    setDeleteData(d);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    try {
      const res = await axios.delete(
        `${linkTest}beasiswa/delete/${deleteData.id_beasiswa}`,
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );
      if (res.data.status === "success") {
        setToastBg("success");
        setToastMessage("Beasiswa berhasil dihapus!");
        setShowToast(true);
        setShowDeleteModal(false);
        fetchBeasiswa(currentPage);
      } else throw 1;
    } catch {
      setToastBg("danger");
      setToastMessage("Gagal hapus beasiswa.");
      setShowToast(true);
    }
  };

  // ───────────── modal konfirmasi umum ─────────────
  const showConfirmation = (message, onConfirmAction) => {
    setConfirmMessage(message);
    setOnConfirm(() => () => {
      onConfirmAction();
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  // ───────────────────── UI ─────────────────────
  return (
    <Container className="mt-4">
      <h2 className="py-3">Status Beasiswa Siswa</h2>

      {/* filter & tombol tambah */}
      <Row className="mb-3">
        <Col md={3}>
          <Form.Control
            placeholder="Cari NISN atau Nama"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </Col>
        <Col md={3}>
          <Form.Select
            value={selectedFilter}
            onChange={(e) => {
              setSelectedFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Semua Jenis Beasiswa</option>
            {[1, 2, 3, 4].map((i) => (
              <option key={i} value={i}>
                {beasiswaText(i)}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md="auto" className="ms-auto text-end">
          <Button onClick={addBeasiswa}>Tambah Siswa</Button>
        </Col>
      </Row>

      {/* tabel */}
      <Table hover bordered responsive>
        <thead>
          <tr>
            <th>NISN</th>
            <th>Nama</th>
            <th>Kelas</th>
            <th>Jenis</th>
            <th>Masa</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {students.length ? (
            students.map((d) => (
              <tr key={d.id_beasiswa}>
                <td>{d.nisn}</td>
                <td>{d.name}</td>
                <td>{d.kelas}</td>
                <td>{d.beasiswa}</td>
                <td>{d.masa}</td>
                <td>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => triggerEdit(d)}
                  >
                    Ubah
                  </Button>{" "}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => triggerDelete(d)}
                  >
                    Hapus
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                Tidak ada data
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* pagination */}
      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.Prev
            onClick={() => currentPage > 1 && handlePage(currentPage - 1)}
            disabled={currentPage === 1}
          />
          <Pagination.Item active>{currentPage}</Pagination.Item>
          <Pagination.Next
            onClick={() =>
              currentPage < totalPages && handlePage(currentPage + 1)
            }
            disabled={currentPage === totalPages}
          />
        </Pagination>
      )}

      {/* ───────────── MODAL TAMBAH ───────────── */}
      <Modal show={showAddModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Beasiswa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* cari nama */}
          <Form.Group className="mb-3">
            <Form.Label>Cari Nama</Form.Label>
            <Form.Control
              value={searchInput}
              onChange={(e) => searchSiswa(e.target.value)}
              placeholder="Ketik nama"
            />
            {searchResults.length > 0 && (
              <div
                className="border mt-1"
                style={{ maxHeight: 144, overflowY: "auto" }}
              >
                {searchResults.map((s) => (
                  <div
                    key={s.id_siswa}
                    className={
                      "p-1 " +
                      (selectedSiswa?.id_siswa === s.id_siswa ? "bg-light" : "")
                    }
                    onClick={() => {
                      setSelectedSiswa(s);
                      setSearchInput(`${s.nama_lengkap} (${s.kelas})`);
                      setSearchResults([]);
                    }}
                  >
                    {s.nama_lengkap} — {s.kelas}
                  </div>
                ))}
              </div>
            )}
          </Form.Group>

          {/* semester */}
          <Form.Group className="mb-3">
            <Form.Label>Semester</Form.Label>
            <Form.Select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="">Pilih semester</option>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <option key={i} value={i}>
                  {semesterToText(i)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* jenis beasiswa */}
          <Form.Group className="mb-3">
            <Form.Label>Jenis Beasiswa</Form.Label>
            <Form.Select
              value={selectedBeasiswa}
              onChange={(e) => setSelectedBeasiswa(e.target.value)}
            >
              <option value="">Pilih beasiswa</option>
              {[1, 2, 3, 4].map((i) => (
                <option key={i} value={i}>
                  {beasiswaText(i)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal}>
            Batal
          </Button>
          <Button
            variant="success"
            onClick={() =>
              showConfirmation(
                "Yakin ingin menambahkan beasiswa ini?",
                confirmAdd
              )
            }
            disabled={
              !selectedSiswa || !selectedSemester || !selectedBeasiswa
            }
          >
            Tambahkan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ───────────── MODAL EDIT ───────────── */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ubah Jenis</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select
            value={editData?.id_beasiswaComponent}
            onChange={(e) =>
              setEditData({
                ...editData,
                id_beasiswaComponent: e.target.value,
              })
            }
          >
            {[1, 2, 3, 4].map((i) => (
              <option key={i} value={i}>
                {beasiswaText(i)}
              </option>
            ))}
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              showConfirmation(
                "Yakin ingin mengubah jenis beasiswa?",
                confirmEdit
              )
            }
          >
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ───────────── MODAL DELETE ───────────── */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Hapus Beasiswa?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Yakin hapus beasiswa untuk <strong>{deleteData?.name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={() =>
              showConfirmation(
                `Yakin ingin menghapus beasiswa ${deleteData?.name}?`,
                confirmDelete
              )
            }
          >
            Hapus
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ───────────── MODAL KONFIRMASI UMUM ───────────── */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi</Modal.Title>
        </Modal.Header>
        <Modal.Body>{confirmMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Ya, Lanjutkan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ───────────── TOAST ───────────── */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toastBg}
          show={showToast}
          autohide
          delay={3000}
          onClose={() => setShowToast(false)}
        >
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default StatusSiswa;
