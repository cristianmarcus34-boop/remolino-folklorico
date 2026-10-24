export const prerender = false;

import { db } from '../../db/index.js';
import { mensajes } from '../../db/schema.js';

export const POST = async ({ request }) => {
    const body = await request.json();

    if (!body.nombre || !body.email || !body.mensaje) {
        return new Response(
            JSON.stringify({ error: 'Faltan campos obligatorios' }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
        return new Response(
            JSON.stringify({ error: 'Email inválido' }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    const [nuevo] = await db
        .insert(mensajes)
        .values({
            nombre: body.nombre,
            email: body.email,
            telefono: body.telefono || null,
            tipoEvento: body.tipoEvento || null,
            fechaEvento: body.fechaEvento || null,
            mensaje: body.mensaje,
        })
        .returning();

    return new Response(JSON.stringify({ ok: true, id: nuevo.id }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
    });
};