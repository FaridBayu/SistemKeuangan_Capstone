/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useMemo } from "react";
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
import Cookies from "js-cookie";

/* ───────── Modal Sesi Kedaluwarsa ───────── */
const SessionExpiredModal = ({ show }) => {
  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("user");
    window.location.href = "/login";
  };

  return (
    <Modal show={show} backdrop="static" keyboard={false} centered>
      <Modal.Header>
        <Modal.Title>Sesi Anda Telah Habis</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Token Anda kedaluwarsa. Silakan login kembali untuk melanjutkan.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleLogout}>
          Kembali ke Login
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
/* ─────────────────────────────────────────── */

const StatusSiswa = () => {
  const token = Cookies.get("token");

  /* ---------- STATE UTAMA ---------- */
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /* filter beasiswa */
  const [selectedFilter, setSelectedFilter] = useState("");
  const [customFilter, setCustomFilter] = useState("");
  const [debouncedCustomFilter, setDebouncedCustomFilter] = useState("");

  /* paging */
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* modal tambah */
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchAdd, setDebouncedSearchAdd] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [inputNominal, setInputNominal] = useState("");
  const [selectedBeasiswa, setSelectedBeasiswa] = useState("");
  const [customBeasiswa, setCustomBeasiswa] = useState("");

  /* modal edit / delete / toast */
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteData, setDeleteData] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastBg, setToastBg] = useState("success");

  /* modal konfirmasi umum */
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState(() => () => {});

  /* modal session expired */
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  /* ---------- UTIL ---------- */
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

  /* fungsi deteksi token expired (HTTP 500 + pesan) */
  const isExpired = (err) =>
    err.response &&
    err.response.status === 500 &&
    typeof err.response.data?.message === "string" &&
    err.response.data.message.toLowerCase().includes("jwt expired");

  /* ---------- DEBOUNCE ---------- */
  const debounceSearch = useMemo(
    () => debounce((val) => setDebouncedSearch(val), 1250),
    []
  );
  useEffect(() => () => debounceSearch.cancel(), [debounceSearch]);
  useEffect(() => debounceSearch(searchTerm), [searchTerm]);

  const debounceCustom = useMemo(
    () => debounce((val) => setDebouncedCustomFilter(val), 800),
    []
  );
  useEffect(() => () => debounceCustom.cancel(), [debounceCustom]);

  const debounceSearchAddFn = useMemo(
    () => debounce((val) => setDebouncedSearchAdd(val), 1250),
    []
  );
  useEffect(() => () => debounceSearchAddFn.cancel(), [debounceSearchAddFn]);

  /* ---------- FETCH LIST ---------- */
  const fetchBeasiswa = useCallback(async () => {
    const filterParam =
      selectedFilter === "__OTHER__"
        ? debouncedCustomFilter.trim()
        : selectedFilter;

    try {
      const res = await axios.get(
        `${linkTest}api/beasiswa?input=${encodeURIComponent(
          debouncedSearch
        )}&filter=${encodeURIComponent(
          filterParam
        )}&page=${currentPage}&limit=10`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.status === "success") {
        const arr = res.data.data.map((item) => ({
          id_beasiswa: item.id_beasiswa,
          id_siswa: item.id_siswa,
          nisn: item.nisn,
          name: item.nama_lengkap,
          kelas: item.kelas,
          semester: item.semester ?? null,
          keterangan: item.keterangan,
          masa: semesterToText(item.semester),
          nominal: item.nominal,
        }));
        setStudents(arr);
        setTotalPages(res.data.pagination?.totalPage || 1);
      } else setStudents([]);
    } catch (err) {
      if (isExpired(err)) {
        setShowExpiredModal(true);
        return;
      }
      setStudents([]);
    }
  }, [
    debouncedSearch,
    selectedFilter,
    debouncedCustomFilter,
    currentPage,
    token,
  ]);

  useEffect(() => {
    fetchBeasiswa();
  }, [fetchBeasiswa]);

  /* ---------- SEARCH SISWA (modal tambah) ---------- */
  const searchSiswa = (v) => {
    setSearchInput(v);
    setSelectedSiswa(null);
    debounceSearchAddFn(v);
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
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data.status === "success") setSearchResults(res.data.data);
      } catch (err) {
        if (isExpired(err)) {
          setShowExpiredModal(true);
          return;
        }
        setSearchResults([]);
      }
    };
    fetch();
  }, [debouncedSearchAdd, token]);

  /* ---------- RESET FORM TAMBAH ---------- */
  const resetAddForm = () => {
    setSelectedSiswa(null);
    setSearchInput("");
    setInputNominal("");
    setSelectedBeasiswa("");
    setCustomBeasiswa("");
    setSearchResults([]);
  };

  /* ---------- CONFIRM ADD ---------- */
  const confirmAdd = async () => {
    const keterangan =
      selectedBeasiswa === "__OTHER__"
        ? customBeasiswa.trim()
        : selectedBeasiswa;

    try {
      const res = await axios.post(
        `${linkTest}api/beasiswa/add-beasiswa`,
        {
          id_siswa: selectedSiswa.id_siswa,
          nominal: parseInt(inputNominal, 10),
          keterangan,
        },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.status === "success") {
        setToastBg("success");
        setToastMessage("Beasiswa berhasil ditambahkan!");
        setShowToast(true);
        fetchBeasiswa(currentPage);
        setShowAddModal(false);
      } else throw new Error();
    } catch (err) {
      if (isExpired(err)) {
        setShowAddModal(false);
        setShowExpiredModal(true);
        return;
      }
      setToastBg("danger");
      setToastMessage("Gagal menambahkan beasiswa.");
      setShowToast(true);
    }
  };

  /* ---------- EDIT / DELETE ---------- */
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
          keterangan: editData.keterangan.trim(),
        },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.status === "success") {
        setToastBg("success");
        setToastMessage("Data beasiswa berhasil diubah!");
        setShowToast(true);
        setShowEditModal(false);
        fetchBeasiswa(currentPage);
      } else throw new Error();
    } catch (err) {
      if (isExpired(err)) {
        setShowEditModal(false);
        setShowExpiredModal(true);
        return;
      }
      setToastBg("danger");
      setToastMessage("Gagal mengubah beasiswa.");
      setShowToast(true);
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
          headers: {
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.status === "success") {
        setToastBg("success");
        setToastMessage("Beasiswa berhasil dihapus!");
        setShowToast(true);
        setShowDeleteModal(false);
        fetchBeasiswa(currentPage);
      } else throw new Error();
    } catch (err) {
      if (isExpired(err)) {
        setShowDeleteModal(false);
        setShowExpiredModal(true);
        return;
      }
      setToastBg("danger");
      setToastMessage("Gagal hapus beasiswa.");
      setShowToast(true);
    }
  };

  /* ---------- GENERIC CONFIRM MODAL ---------- */
  const showConfirmation = (msg, action) => {
    setConfirmMessage(msg);
    setOnConfirm(() => () => {
      action();
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  /* ---------- RENDER ---------- */
  return (
    <Container className="mt-4">
      {/* modal sesi expired */}
      <SessionExpiredModal show={showExpiredModal} />

      <h2 className="py-3">Status Beasiswa Siswa</h2>

      {/* filter */}
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

        {/* filter jenis beasiswa */}
        <Col md={3}>
          <Form.Select
            value={selectedFilter}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedFilter(v);
              if (v !== "__OTHER__") {
                setCustomFilter("");
                setDebouncedCustomFilter("");
              }
              setCurrentPage(1);
            }}
          >
            <option value="">Semua Jenis Beasiswa</option>
            {[1, 2, 3, 4].map((i) => (
              <option key={i} value={beasiswaText(i)}>
                {beasiswaText(i)}
              </option>
            ))}
            <option value="__OTHER__">Lainnya…</option>
          </Form.Select>

          {selectedFilter === "__OTHER__" && (
            <Form.Control
              className="mt-2"
              placeholder="Masukkan jenis beasiswa"
              value={customFilter}
              onChange={(e) => {
                const v = e.target.value;
                setCustomFilter(v);
                debounceCustom(v);
                setCurrentPage(1);
              }}
            />
          )}
        </Col>

        <Col md="auto" className="ms-auto text-end mt-2 mt-md-0">
          <Button
            onClick={() => {
              resetAddForm();
              setShowAddModal(true);
            }}
          >
            Tambah Siswa
          </Button>
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
                <td>{d.keterangan}</td>
                <td>Rp {parseInt(d.nominal || 0, 10).toLocaleString("id-ID")}</td>
                <td>
                  <Button size="sm" onClick={() => triggerEdit(d)}>
                    Ubah
                  </Button>{" "}
                  <Button size="sm" variant="danger" onClick={() => triggerDelete(d)}>
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
            onClick={() => currentPage > 1 && setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          />
          <Pagination.Item active>{currentPage}</Pagination.Item>
          <Pagination.Next
            onClick={() => currentPage < totalPages && setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      )}

      {/* ===== MODAL TAMBAH ===== */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Beasiswa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* cari siswa */}
          <Form.Group className="mb-3">
            <Form.Label>Cari NISN atau Nama</Form.Label>
            <Form.Control
              placeholder="Cari NISN atau Nama"
              value={searchInput}
              onChange={(e) => searchSiswa(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="border mt-1" style={{ maxHeight: 144, overflowY: "auto" }}>
                {searchResults.map((s) => (
                  <div
                    key={s.id_siswa}
                    className={`p-1 ${
                      selectedSiswa?.id_siswa === s.id_siswa ? "bg-light" : ""
                    }`}
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
              placeholder="Masukkan nominal"
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
              onChange={(e) => {
                const v = e.target.value;
                setSelectedBeasiswa(v);
                if (v !== "__OTHER__") setCustomBeasiswa("");
              }}
            >
              <option value="">Pilih beasiswa</option>
              {[1, 2, 3, 4].map((i) => (
                <option key={i} value={beasiswaText(i)}>
                  {beasiswaText(i)}
                </option>
              ))}
              <option value="__OTHER__">Lainnya…</option>
            </Form.Select>

            {selectedBeasiswa === "__OTHER__" && (
              <Form.Control
                className="mt-2"
                placeholder="Masukkan jenis beasiswa"
                value={customBeasiswa}
                onChange={(e) => setCustomBeasiswa(e.target.value)}
              />
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Batal
          </Button>
          <Button
            variant="success"
            disabled={
              !selectedSiswa ||
              !inputNominal ||
              (selectedBeasiswa !== "__OTHER__"
                ? !selectedBeasiswa
                : !customBeasiswa.trim())
            }
            onClick={() =>
              showConfirmation("Yakin ingin menambahkan beasiswa ini?", confirmAdd)
            }
          >
            Tambahkan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== MODAL EDIT ===== */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ubah Beasiswa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Jenis Beasiswa</Form.Label>
            <Form.Select
              value={editData?.keterangan ?? ""}
              onChange={(e) =>
                setEditData({ ...editData, keterangan: e.target.value })
              }
            >
              <option value="">Pilih beasiswa</option>
              {[1, 2, 3, 4].map((i) => (
                <option key={i} value={beasiswaText(i)}>
                  {beasiswaText(i)}
                </option>
              ))}
              <option value="__OTHER__">Lainnya…</option>
            </Form.Select>
            {editData?.keterangan === "__OTHER__" && (
              <Form.Control
                className="mt-2"
                placeholder="Masukkan jenis beasiswa"
                value={editData.custom || ""}
                onChange={(e) =>
                  setEditData({ ...editData, custom: e.target.value })
                }
              />
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nominal Beasiswa</Form.Label>
            <Form.Control
              type="number"
              placeholder="Masukkan nominal"
              value={editData?.nominal ?? ""}
              onChange={(e) =>
                setEditData({ ...editData, nominal: e.target.value })
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
            disabled={
              !editData?.keterangan ||
              !editData?.nominal ||
              parseInt(editData.nominal, 10) <= 0
            }
            onClick={() =>
              showConfirmation("Yakin ingin mengubah data beasiswa?", confirmEdit)
            }
          >
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== MODAL DELETE ===== */}
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

      {/* ===== MODAL KONFIRMASI UMUM ===== */}
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
