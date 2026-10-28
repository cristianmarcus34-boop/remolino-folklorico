export const prerender = false;

import { db } from '@/db/index.js';
import { videos } from '@/db/schema.js';
import { auth } from '@/lib/auth.js';
import { eq } from 'drizzle-orm';

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

// ============================
// PATCH: editar título y descripción
// ============================
export const PATCH = async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return json({ error: 'No autorizado' }, 401);

    const id = Number(params.id);
    if (!id || Number.isNaN(id)) return json({ error: 'ID inválido' }, 400);

    const body = await request.json().catch(() => null);
    if (!body) return json({ error: 'JSON inválido' }, 400);

    const updates = {};

    if (body.titulo !== undefined) {
        if (
            typeof body.titulo !== 'string' ||
            body.titulo.trim().length < 2
        ) {
            return json(
                { error: 'El título debe tener al menos 2 caracteres' },
                400
            );
        }
        updates.titulo = body.titulo.trim();
    }

    if (body.descripcion !== undefined) {
        updates.descripcion = body.descripcion?.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
        return json({ error: 'Nada para actualizar' }, 400);
    }

    try {
        const [actualizado] = await db
            .update(videos)
            .set(updates)
            .where(eq(videos.id, id))
            .returning();

        if (!actualizado) return json({ error: 'Video no encontrado' }, 404);

        return json(actualizado, 200);
    } catch (error) {
        console.error('[videos] Error al editar:', error);
        return json({ error: 'Error al editar el video' }, 500);
    }
};

// ============================
// DELETE: eliminar video
// ============================
export const DELETE = async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return json({ error: 'No autorizado' }, 401);

    await db.delete(videos).where(eq(videos.id, Number(params.id)));

    return new Response(null, { status: 204 });
};