import { useState, useMemo } from "react";
import { Table, Button, Container, Modal, Form, InputGroup, FormControl, Row, Col } from "react-bootstrap";
import './ManajemenPengguna.css';

const ManajemenPengguna = () => {
    const [users, setUsers] = useState([
        { id: 1, name: "Asep Bakwan", email: "haha@gmail.com", role: "admin", status: "Aktif" },
        { id: 2, name: "Budi", email: "budi@gmail.com", role: "kepala Sekolah", status: "Aktif" },
        { id: 3, name: "Andi", email: "andi@gmail.com", role: "siswa", status: "Aktif" },
        { id: 4, name: "Dewi", email: "dewi@gmail.com", role: "orang tua", status: "Aktif" },
        { id: 5, name: "Eko", email: "eko@gmail.com", role: "siswa", status: "Tidak aktif" },
        { id: 6, name: "Fajar", email: "fajar@gmail.com", role: "admin", status: "Aktif" },
        { id: 7, name: "Gita", email: "gita@gmail.com", role: "kepala Sekolah", status: "Tidak aktif" },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', role: '', status: 'Aktif' });
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('success');

    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [editUserId, setEditUserId] = useState(null);

    // Pencarian dan pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredUsers = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return users.filter(({ name, email, role }) =>
            name.toLowerCase().includes(term) ||
            email.toLowerCase().includes(term) ||
            role.toLowerCase().includes(term)
        );
    }, [users, searchTerm]);

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const handleDelete = () => {
        setUsers(users.filter(user => user.id !== confirmDeleteId));
        setShowDeleteModal(false);
        setAlertMessage("Pengguna berhasil dihapus!");
        setAlertType("danger");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 1500);
    };

    const confirmDelete = (id) => {
        setConfirmDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (showEditModal) {
            setUsers(users.map(user =>
                user.id === editUserId ? { ...user, ...formData } : user
            ));
            setAlertMessage("Pengguna berhasil diupdate!");
        } else {
            const newUser = {
                id: users.length + 1,
                ...formData,
                status: 'Aktif',
            };
            setUsers([...users, newUser]);
            setAlertMessage("Pengguna berhasil ditambahkan!");
        }

        setAlertType("success");
        setShowAlert(true);

        setTimeout(() => {
            setShowAlert(false);
            setFormData({ name: '', email: '', role: '', status: 'Aktif' });
            setShowModal(false);
            setShowEditModal(false);
            setEditUserId(null);
        }, 1500);
    };

    const confirmEdit = (id) => {
        const userToEdit = users.find(user => user.id === id);
        if (userToEdit) {
            setFormData({
                name: userToEdit.name,
                email: userToEdit.email,
                role: userToEdit.role,
                status: userToEdit.status || 'Aktif'
            });
            setEditUserId(id);
            setShowEditModal(true);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const goToPrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <Container className="manajemen-container mt-4">
            <h2>Manajemen Pengguna</h2>

            {showAlert && (
                <div className={`alert alert-${alertType} custom-alert`} role="alert">
                    {alertMessage}
                </div>
            )}

            {/* Baris atas: pencarian kiri, tombol tambah kanan */}
            <Row className="mb-3 align-items-center">
                <Col xs={6}>
                    <InputGroup>
                        <FormControl
                            placeholder="Cari pengguna..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </InputGroup>
                </Col>
                <Col xs={6} className="text-end">
                    <Button variant="secondary" onClick={() => {
                        setFormData({ name: '', email: '', role: '', status: 'Aktif' });
                        setShowModal(true);
                    }}>
                        Tambah Pengguna Baru
                    </Button>
                </Col>
            </Row>

            <Table bordered hover responsive>
                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Peran / Role</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {currentUsers.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center">Tidak ada data ditemukan</td>
                        </tr>
                    ) : (
                        currentUsers.map(({ id, name, email, role, status }) => (
                            <tr key={id}>
                                <td>{name}</td>
                                <td>{email}</td>
                                <td>{role}</td>
                                <td>{status}</td>
                                <td>
                                    <Button variant="secondary" size="sm" onClick={() => confirmEdit(id)} className="me-2">
                                        Edit
                                    </Button>
                                    <Button variant="dark" size="sm" onClick={() => confirmDelete(id)}>
                                        Hapus
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* Pagination: tombol Prev, info halaman, tombol Next berdempetan */}
            <div className="d-flex justify-content-center align-items-center mb-4 gap-2">
                <Button variant="outline-secondary" size="sm" onClick={goToPrevPage} disabled={currentPage === 1}>
                    &laquo; Prev
                </Button>
                <span>Halaman {currentPage} dari {totalPages || 1}</span>
                <Button variant="outline-secondary" size="sm" onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0}>
                    Next &raquo;
                </Button>
            </div>

            {/* Modal Tambah */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Tambah Pengguna</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nama</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Role</Form.Label>
                            <Form.Select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="" hidden>Pilih Role</option>
                                <option value="admin">Admin</option>
                                <option value="kepala Sekolah">Kepala Sekolah</option>
                                <option value="siswa">Siswa</option>
                                <option value="orang tua">Orang Tua</option>
                            </Form.Select>
                        </Form.Group>

                        {/* Status otomatis aktif saat tambah */}

                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                                Batal
                            </Button>
                            <Button type="submit" variant="primary">
                                Simpan
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal Edit */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Pengguna</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nama</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Role</Form.Label>
                            <Form.Select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="" hidden>Pilih Role</option>
                                <option value="admin">Admin</option>
                                <option value="kepala Sekolah">Kepala Sekolah</option>
                                <option value="siswa">Siswa</option>
                                <option value="orang tua">Orang Tua</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <option value="" hidden>Pilih Status</option>
                                <option value="Aktif">Aktif</option>
                                <option value="Tidak aktif">Tidak aktif</option>
                            </Form.Select>
                        </Form.Group>

                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" className="me-2" onClick={() => setShowEditModal(false)}>
                                Batal
                            </Button>
                            <Button type="submit" variant="primary">
                                Simpan
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal Hapus */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Konfirmasi Hapus</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Apakah kamu yakin ingin menghapus pengguna ini?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Batal
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Hapus
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ManajemenPengguna;