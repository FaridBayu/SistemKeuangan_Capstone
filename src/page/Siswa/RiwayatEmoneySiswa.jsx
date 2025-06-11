import { useState } from "react";
import { Container, Row, Col, Form, Button, Table } from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";

const RiwayatEmoneySiswa = () => {
    // Simulasi data siswa login
    const siswaLogin = { id: 2, nama: "Budi" , nisn :1234567890, kelas : '8A'};

    const saldoSiswa = {
        1: 2500000,
        2: 1800000,
        3: 3200000,
    };

    const transaksiPerSiswa = {
        1: [
            { tanggal: "2025-05-01", jumlah: 50000, keterangan: "Pembayaran kantin" },
            { tanggal: "2025-05-10", jumlah: -20000, keterangan: "Penarikan tunai" },
        ],
        2: [
            { tanggal: "2025-04-15", jumlah: 100000, keterangan: "Top up saldo" },
            { tanggal: "2025-04-20", jumlah: -50000, keterangan: "Belanja buku" },
        ],
        3: [
            { tanggal: "2025-03-01", jumlah: 75000, keterangan: "Bayar les" },
            { tanggal: "2025-03-10", jumlah: -25000, keterangan: "Snack" },
            { tanggal: "2025-03-12", jumlah: 50000, keterangan: "Top up saldo" },
        ],
    };

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const allTransaksi = transaksiPerSiswa[siswaLogin.id] || [];

    const transaksiFiltered = allTransaksi.filter((trx) => {
        const trxDate = new Date(trx.tanggal);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && trxDate < start) return false;
        if (end && trxDate > end) return false;
        return true;
    });

    const saldo = saldoSiswa[siswaLogin.id] || 0;

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const title = `Riwayat Transaksi - ${siswaLogin.nama}`;
        doc.setFontSize(16);
        doc.text(title, 14, 15);

        let dataToExport = transaksiFiltered;

        if (!startDate && !endDate) {
            const now = new Date();
            const lastMonth = new Date();
            lastMonth.setMonth(now.getMonth() - 1);

            dataToExport = allTransaksi.filter((trx) => {
                const trxDate = new Date(trx.tanggal);
                return trxDate >= lastMonth && trxDate <= now;
            });
        }

        const rows = dataToExport.map((trx, idx) => [
            idx + 1,
            trx.tanggal,
            `Rp ${trx.jumlah.toLocaleString("id-ID")}`,
            trx.keterangan,
        ]);

        doc.autoTable({
            startY: 25,
            head: [["No", "Tanggal", "Jumlah", "Keterangan"]],
            body: rows,
        });

        doc.save(`Riwayat_${siswaLogin.nama}.pdf`);
    };

    return (
        <Container className="mt-4">
            <h2 className="mb-5">Riwayat E-Money</h2>
            <Row className="mb-2">
                <Col>
                    <strong>Nama Siswa:</strong> {siswaLogin.nama}
                </Col>
            </Row>
            <Row className="mb-2">
                <Col>
                    <strong>NISN:</strong> {siswaLogin.nisn}
                </Col>
            </Row>
            <Row className="mb-5">
                <Col>
                    <strong>Kelas:</strong> {siswaLogin.kelas}
                </Col>
            </Row>


            <Row className="mb-3">
                <Col xs={12} md={6}>
                    <div className="p-3 bg-light rounded shadow-sm text-center">
                        <div style={{ fontWeight: "600", color: "#6c757d" }}>SALDO</div>
                        <div style={{ fontSize: "1.8rem", fontWeight: "700" }}>
                            Rp {saldo.toLocaleString("id-ID")}
                        </div>
                    </div>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={3} xs={6}>
                    <Form.Label>Dari Tanggal</Form.Label>
                    <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </Col>
                <Col md={3} xs={6}>
                    <Form.Label>Sampai Tanggal</Form.Label>
                    <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </Col>
                <Col md={{ span: 3, offset: 3 }} xs={12} className="d-flex align-items-end justify-content-md-end mt-3 mt-md-0">
                    <Button variant="secondary" onClick={handleExportPDF}>
                        Download
                    </Button>
                </Col>
            </Row>

            <Table bordered hover responsive>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Tanggal</th>
                        <th>Jumlah</th>
                        <th>Keterangan</th>
                    </tr>
                </thead>
                <tbody>
                    {transaksiFiltered.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center">Tidak ada transaksi</td>
                        </tr>
                    ) : (
                        transaksiFiltered.map((trx, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{trx.tanggal}</td>
                                <td
                                    style={{
                                        color: trx.jumlah > 0 ? "green" : "red",
                                        fontWeight: "600",
                                    }}
                                >
                                    Rp {trx.jumlah.toLocaleString("id-ID")}
                                </td>
                                <td>{trx.keterangan}</td>
                            </tr>
                        ))
                    )}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="4" className="text-end fw-semibold bg-light">
                            TOTAL: Rp{" "}
                            {transaksiFiltered
                                .reduce((acc, trx) => acc + trx.jumlah, 0)
                                .toLocaleString("id-ID")}
                        </td>
                    </tr>
                </tfoot>
            </Table>
        </Container>
    );
};

export default RiwayatEmoneySiswa;
