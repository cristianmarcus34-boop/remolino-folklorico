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
// PATCH: editar alt, seccion y/o url (reemplazar imagen)
// ============================
export const PATCH = async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return json({ error: 'No autorizado' }, 401);

    const id = Number(params.id);
    if (!id || Number.isNaN(id)) return json({ error: 'ID inválido' }, 400);

    const body = await request.json().catch(() => null);
    if (!body) return json({ error: 'JSON inválido' }, 400);

    // Buscar la imagen actual (necesitamos la URL vieja para borrarla)
    const [actual] = await db.select().from(galeria).where(eq(galeria.id, id));
    if (!actual) return json({ error: 'Imagen no encontrada' }, 404);

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

    // Si viene una URL nueva, es que el usuario cambió la imagen
    let urlViejaParaBorrar = null;
    if (body.url !== undefined && typeof body.url === 'string') {
        if (body.url.length < 10) {
            return json({ error: 'URL de imagen inválida' }, 400);
        }
        // Solo actualizamos si la URL es distinta a la actual
        if (body.url !== actual.url) {
            updates.url = body.url;
            urlViejaParaBorrar = actual.url;
        }
    }

    if (Object.keys(updates).length === 0) {
        return json({ error: 'Nada para actualizar' }, 400);
    }

    try {
        const [actualizada] = await db
            .update(galeria)
            .set(updates)
            .where(eq(galeria.id, id))
            .returning();

        if (!actualizada) return json({ error: 'Imagen no encontrada' }, 404);

        // Si reemplazamos la imagen, borrar la vieja de Blob
        // (se hace después del update para no perder datos si algo falla)
        if (urlViejaParaBorrar) {
            try {
                await del(urlViejaParaBorrar);
                console.log(
                    '[galeria] Imagen vieja borrada de Blob:',
                    urlViejaParaBorrar
                );
            } catch (delError) {
                // No rompemos la respuesta si falla el borrado
                // (la fila ya se actualizó correctamente)
                console.error(
                    '[galeria] No se pudo borrar la imagen vieja de Blob:',
                    delError
                );
            }
        }

        return json(actualizada, 200);
    } catch (error) {
        console.error('[galeria] Error al actualizar:', error);
        return json({ error: 'Error al actualizar la imagen' }, 500);
    }
};

// ============================
// DELETE: eliminar imagen (borra también de Blob)
// ============================
export const DELETE = async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return json({ error: 'No autorizado' }, 401);

    const id = Number(params.id);
    if (!id || Number.isNaN(id)) return json({ error: 'ID inválido' }, 400);

    const [item] = await db.select().from(galeria).where(eq(galeria.id, id));
    if (!item) return json({ error: 'Imagen no encontrada' }, 404);

    try {
        await del(item.url);
    } catch (err) {
        console.error('[galeria] Error al borrar de Blob:', err);
        // Continuamos igual: si falla Blob, al menos borramos la fila
    }

    await db.delete(galeria).where(eq(galeria.id, id));

    return new Response(null, { status: 204 });
};