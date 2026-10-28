export const prerender = false;

import { db } from '@/db/index.js';
import { mensajes } from '@/db/schema.js';
import { auth } from '@/lib/auth.js';
import { eq } from 'drizzle-orm';

export const PATCH = async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'No autorizado' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const body = await request.json();
    const id = Number(params.id);

    const [actualizado] = await db
        .update(mensajes)
        .set({ leido: body.leido ?? true })
        .where(eq(mensajes.id, id))
        .returning();

    if (!actualizado) {
        return new Response(JSON.stringify({ error: 'Mensaje no encontrado' }), {
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

    await db.delete(mensajes).where(eq(mensajes.id, Number(params.id)));

    return new Response(null, { status: 204 });
};