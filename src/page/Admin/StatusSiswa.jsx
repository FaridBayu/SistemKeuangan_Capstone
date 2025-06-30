import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { debounce } from "lodash";
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
  /* ---------- STATE UTAMA ---------- */
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const didMountRef = useRef(false);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* ---------- STATE MODAL TAMBAH ---------- */
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchAdd, setDebouncedSearchAdd] = useState(""); // <—
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [inputNominal, setInputNominal] = useState("");
  const [selectedBeasiswa, setSelectedBeasiswa] = useState("");

  /* ---------- STATE MODAL EDIT / DELETE / TOAST ---------- */
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteData, setDeleteData] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastBg, setToastBg] = useState("success");

  /* ---------- STATE MODAL KONFIRMASI UMUM ---------- */
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState(() => () => {});

  /* ---------- HELPER ---------- */
  const semesterToText = (s) =>
    (
      {
        1: "Kelas 7 Semester 1",
        2: "Kelas 7 Semester 2",
        3: "Kelas 8 Semester 1",
        4: "Kelas 8 Semester 2",
        5: "Kelas 9 Semester 1",
        6: "Kelas 9 Semester 2",
      }[s] || "-"
    );

  const beasiswaText = (id) =>
    (
      {
        1: "Beasiswa Prestasi",
        2: "Beasiswa Kurang Mampu",
        3: "Beasiswa Yatim Piatu",
        4: "Beasiswa Tahfidz",
      }[id] || `ID ${id}`
    );

  /* ---------- DEBOUNCE FORM UTAMA ---------- */
  const debounceSearch = useMemo(
    () => debounce((val) => setDebouncedSearch(val), 1250),
    []
  );
  useEffect(() => () => debounceSearch.cancel(), [debounceSearch]);
  useEffect(() => {
    debounceSearch(searchTerm);
  }, [searchTerm, debounceSearch]);

  /* ---------- DEBOUNCE FORM TAMBAH SISWA ---------- */
  const debounceSearchAdd = useMemo(
    () => debounce((val) => setDebouncedSearchAdd(val), 1250),
    []
  );
  useEffect(() => () => debounceSearchAdd.cancel(), [debounceSearchAdd]);

  /* ---------- FETCH LIST BEASISWA (TABEL) ---------- */
  const fetchBeasiswa = useCallback(async () => {
    try {
      const res = await axios.get(
        `${linkTest}api/beasiswa?input=${encodeURIComponent(
          debouncedSearch
        )}&filter=${selectedFilter}&page=${currentPage}&limit=10`,
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );

      if (res.data.status === "success") {
        const arr = res.data.data.map((item) => ({
          id_beasiswa: item.id_beasiswa,
          id_siswa: item.id_siswa,
          nisn: item.nisn,
          name: item.nama_lengkap,
          kelas: item.kelas,
          semester: item.semester ?? null,
          id_beasiswaComponent: item.id_beasiswaComponent ?? null,
          beasiswa: item.keterangan,
          masa: semesterToText(item.semester),
          nominal: item.nominal,
        }));
        setStudents(arr);
        setTotalPages(res.data.pagination?.totalPage || 1);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error(err);
      setStudents([]);
    }
  }, [debouncedSearch, selectedFilter, currentPage]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return; // skip first fetch caused by React.StrictMode
    }
    fetchBeasiswa();
  }, [fetchBeasiswa]);

  /* ---------- PAGINATION ---------- */
  const handlePage = (p) => setCurrentPage(p);

  /* ---------- SEARCH SISWA UNTUK MODAL TAMBAH ---------- */
  const searchSiswa = (v) => {
    setSearchInput(v);
    setSelectedSiswa(null);
    debounceSearchAdd(v); 
  };

  useEffect(() => {
    if (!debouncedSearchAdd.trim()) {
      setSearchResults([]);
      return;
    }
    const fetch = async () => {
      try {
        const res = await axios.get(
          `${linkTest}api/beasiswa/search?input=${debouncedSearchAdd}`,
          { headers: { "ngrok-skip-browser-warning": "true" } }
        );
        if (res.data.status === "success") setSearchResults(res.data.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetch();
  }, [debouncedSearchAdd]);

  /* ---------- RESET & OPEN / CLOSE MODAL TAMBAH ---------- */
  const resetAddForm = () => {
    setSelectedSiswa(null);
    setSearchInput("");
    setInputNominal("");
    setSelectedBeasiswa("");
    setSearchResults([]);
  };
  const addBeasiswa = () => {
    resetAddForm();
    setShowAddModal(true);
  };
  const handleCloseAddModal = () => {
    resetAddForm();
    setShowAddModal(false);
  };

  /* ---------- CONFIRM ADD ---------- */
  const confirmAdd = async () => {
    try {
      const res = await axios.post(
        `${linkTest}api/beasiswa/add-beasiswa`,
        {
          id_siswa: selectedSiswa.id_siswa,
          nominal: parseInt(inputNominal, 10),
          id_beasiswa_component: selectedBeasiswa,
        },
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );
      if (res.data.status === "success") {
        setToastBg("success");
        setToastMessage("Beasiswa berhasil ditambahkan!");
        setShowToast(true);
        fetchBeasiswa(currentPage);
        handleCloseAddModal();
      } else throw new Error();
    } catch {
      setToastBg("danger");
      setToastMessage("Gagal menambahkan beasiswa.");
      setShowToast(true);
    }
  };

  /* ---------- EDIT / DELETE / KONFIRMASI ---------- */
  const triggerEdit = (d) => {
    setEditData({ ...d });
    setShowEditModal(true);
  };
  const confirmEdit = async () => {
    try {
      const res = await axios.put(
        `${linkTest}api/beasiswa/update-beasiswa`,
        {
          id_siswa: editData.id_siswa,
          id_beasiswa: editData.id_beasiswa,
          nominal: parseInt(editData.nominal, 10),
          id_beasiswa_component: parseInt(editData.id_beasiswaComponent, 10),
        },
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );
      if (res.data) {
        setToastBg("success");
        setToastMessage("Data beasiswa berhasil diubah!");
        setShowToast(true);
        setShowEditModal(false);
        fetchBeasiswa(currentPage);
      } else throw new Error();
    } catch (err) {
      setToastBg("danger");
      setToastMessage("Gagal mengubah beasiswa.");
      setShowToast(true);
      console.error(err);
    }
  };
  const triggerDelete = (d) => {
    setDeleteData(d);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    try {
      const res = await axios.delete(
        `${linkTest}api/beasiswa/delete-beasiswa`,
        {
          data: {
            id_siswa: deleteData.id_siswa,
            id_beasiswa: deleteData.id_beasiswa,
          },
          headers: { "ngrok-skip-browser-warning": "true" },
        }
      );
      if (res.data.status === "success") {
        setToastBg("success");
        setToastMessage("Beasiswa berhasil dihapus!");
        setShowToast(true);
        setShowDeleteModal(false);
        fetchBeasiswa(currentPage);
      } else throw new Error();
    } catch {
      setToastBg("danger");
      setToastMessage("Gagal hapus beasiswa.");
      setShowToast(true);
    }
  };

  /* ---------- GENERIC CONFIRM MODAL ---------- */
  const showConfirmation = (message, onConfirmAction) => {
    setConfirmMessage(message);
    setOnConfirm(() => () => {
      onConfirmAction();
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  /* ---------- RENDER ---------- */
  return (
    <Container className="mt-4">
      <h2 className="py-3">Status Beasiswa Siswa</h2>

      {/* Pencarian dan filter */}
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
        <Col md="auto" className="ms-auto text-end mt-2 mt-md-0">
          <Button onClick={addBeasiswa}>Tambah Siswa</Button>
        </Col>
      </Row>

      {/* tabel */}
      <h4 className="py-3">Tabel Siswa</h4>
      <Table hover bordered responsive>
        <thead>
          <tr>
            <th>NISN</th>
            <th>Nama</th>
            <th>Kelas</th>
            <th>Jenis</th>
            <th>Nominal</th>
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
                <td>
                  Rp&nbsp;
                  {parseInt(d.nominal || 0, 10).toLocaleString("id-ID")}
                </td>
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
              <td colSpan="7" className="text-center">
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

      {/* --- MODAL TAMBAH --- */}
      <Modal show={showAddModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Beasiswa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* cari nama */}
          <Form.Group className="mb-3">
            <Form.Label>Cari NISN atau Nama</Form.Label>
            <Form.Control
              placeholder="Cari NISN atau Nama"
              value={searchInput}
              onChange={(e) => searchSiswa(e.target.value)}
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
                      (selectedSiswa?.id_siswa === s.id_siswa
                        ? "bg-light"
                        : "")
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

          {/* nominal */}
          <Form.Group className="mb-3">
            <Form.Label>Nominal Beasiswa :</Form.Label>
            <Form.Control
              type="number"
              placeholder="Masukkan nominal"
              value={inputNominal}
              onChange={(e) => setInputNominal(e.target.value)}
              min="0"
            />
          </Form.Group>

          {/* jenis */}
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
                "Yakin ingin menambahkan beasiswa ini?",
                confirmAdd
              )
            }
            disabled={!selectedSiswa || !inputNominal || !selectedBeasiswa}
          >
            Tambahkan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL EDIT --- */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ubah Beasiswa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Jenis Beasiswa</Form.Label>
            <Form.Select
              value={editData?.id_beasiswaComponent ?? ""}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  id_beasiswaComponent: parseInt(e.target.value, 10),
                })
              }
            >
              <option value="">Pilih beasiswa</option>
              {[1, 2, 3, 4].map((i) => (
                <option key={i} value={i}>
                  {beasiswaText(i)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nominal Beasiswa</Form.Label>
            <Form.Control
              type="number"
              placeholder="Masukkan nominal"
              value={editData?.nominal ?? ""}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  nominal: e.target.value,
                })
              }
              min="0"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              showConfirmation(
                "Yakin ingin mengubah data beasiswa?",
                confirmEdit
              )
            }
            disabled={
              !editData?.id_beasiswaComponent ||
              !editData?.nominal ||
              parseInt(editData.nominal, 10) <= 0
            }
          >
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL DELETE --- */}
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

      {/* --- MODAL KONFIRMASI UMUM --- */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi</Modal.Title>
        </Modal.Header>
        <Modal.Body>{confirmMessage}</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Batal
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Ya, Lanjutkan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* toast */}
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
