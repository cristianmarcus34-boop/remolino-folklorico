export const prerender = false;

import { db } from '../../../db/index.js';
import { eventos } from '../../../db/schema.js';
import { auth } from '../../../lib/auth.js';
import { eq } from 'drizzle-orm';

export const PUT = async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'No autorizado' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const body = await request.json();

    const [actualizado] = await db
        .update(eventos)
        .set({
            titulo: body.titulo,
            lugar: body.lugar,
            fecha: new Date(body.fecha),
            hora: body.hora || null,
            imagenUrl: body.imagenUrl || null,
        })
        .where(eq(eventos.id, Number(params.id)))
        .returning();

    if (!actualizado) {
        return new Response(JSON.stringify({ error: 'Evento no encontrado' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(actualizado), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};

export const DELETE = async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'No autorizado' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    await db.delete(eventos).where(eq(eventos.id, Number(params.id)));

    return new Response(null, { status: 204 });
};