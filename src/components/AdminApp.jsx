// src/components/AdminApp.jsx
import { useState } from 'react';

export default function AdminApp() {
    const [logueado, setLogueado] = useState(false);

    if (!logueado) {
        return (
            <div style={{ padding: '2rem' }}>
                <h1>Login del Panel</h1>
                <button onClick={() => setLogueado(true)}>Entrar (simulado)</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Panel de Administración</h1>
            <p>Acá irá el CRUD de eventos, galería y textos.</p>
            <button onClick={() => setLogueado(false)}>Cerrar sesión</button>
        </div>
    );
}