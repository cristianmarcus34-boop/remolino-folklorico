export const prerender = false;

import { db } from '../../../db/index.js';
import { galeria } from '../../../db/schema.js';
import { auth } from '../../../lib/auth.js';
import { del } from '@vercel/blob';
import { eq } from 'drizzle-orm';

export const DELETE = async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'No autorizado' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const id = Number(params.id);
    const [item] = await db.select().from(galeria).where(eq(galeria.id, id));

    if (!item) {
        return new Response(JSON.stringify({ error: 'Imagen no encontrada' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        await del(item.url);
    } catch (err) {
        console.error('Error al borrar de Blob:', err);
    }

    await db.delete(galeria).where(eq(galeria.id, id));

    return new Response(null, { status: 204 });
};