// src/page/Unauthorized.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';

const Unauthorized = () => {
const navigate = useNavigate();

return (
    <Container className="text-center mt-5">
        <h1 className="text-danger">403 - Akses Ditolak</h1>
        <p className="lead">Anda tidak memiliki akses untuk halaman ini.</p>
        <Button variant="warning " onClick={() => navigate(-1)}>
            Kembali ke Halaman Sebelumnya
        </Button>
    </Container>
);
};

export default Unauthorized;
