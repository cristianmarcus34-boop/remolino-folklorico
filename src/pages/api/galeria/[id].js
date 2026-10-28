export const prerender = false;

import { db } from '@/db/index.js';
import { galeria } from '@/db/schema.js';
import { auth } from '@/lib/auth.js';
import { del } from '@vercel/blob';
import { eq } from 'drizzle-orm';

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

// ============================
// PATCH: editar alt y/o seccion
// ============================
export const PATCH = async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return json({ error: 'No autorizado' }, 401);

    const id = Number(params.id);
    if (!id || Number.isNaN(id)) return json({ error: 'ID inválido' }, 400);

    const body = await request.json().catch(() => null);
    if (!body) return json({ error: 'JSON inválido' }, 400);

    const updates = {};

    if (body.alt !== undefined) {
        if (typeof body.alt !== 'string' || body.alt.trim().length < 2) {
            return json(
                { error: 'La descripción debe tener al menos 2 caracteres' },
                400
            );
        }
        updates.alt = body.alt.trim();
    }

    if (body.seccion !== undefined) {
        updates.seccion = body.seccion || null;
    }

    if (Object.keys(updates).length === 0) {
        return json({ error: 'Nada para actualizar' }, 400);
    }

    const [actualizada] = await db
        .update(galeria)
        .set(updates)
        .where(eq(galeria.id, id))
        .returning();

    if (!actualizada) return json({ error: 'Imagen no encontrada' }, 404);

    return json(actualizada, 200);
};

// ============================
// DELETE: eliminar imagen
// ============================
export const DELETE = async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return json({ error: 'No autorizado' }, 401);

    const id = Number(params.id);
    const [item] = await db.select().from(galeria).where(eq(galeria.id, id));

    if (!item) return json({ error: 'Imagen no encontrada' }, 404);

    try {
        await del(item.url);
    } catch (err) {
        console.error('Error al borrar de Blob:', err);
    }

    await db.delete(galeria).where(eq(galeria.id, id));

    return new Response(null, { status: 204 });
};