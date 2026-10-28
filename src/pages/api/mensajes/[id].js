export const prerender = false;

import { db } from '@/db/index.js';
import { mensajes } from '@/db/schema.js';
import { auth } from '@/lib/auth.js';
import { eq } from 'drizzle-orm';

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

// ============================
// PATCH: marcar como leído/no leído
// ============================
export const PATCH = async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return json({ error: 'No autorizado' }, 401);

    const id = Number(params.id);
    if (!id || Number.isNaN(id) || id <= 0) {
        return json({ error: 'ID inválido' }, 400);
    }

    const body = await request.json().catch(() => null);
    if (!body) return json({ error: 'JSON inválido' }, 400);

    // Solo aceptar booleanos en `leido`
    let leido = true; // default: marcar como leído
    if (body.leido !== undefined) {
        if (typeof body.leido !== 'boolean') {
            return json(
                { error: 'El campo "leido" debe ser true o false' },
                400
            );
        }
        leido = body.leido;
    }

    try {
        const [actualizado] = await db
            .update(mensajes)
            .set({ leido })
            .where(eq(mensajes.id, id))
            .returning();

        if (!actualizado) {
            return json({ error: 'Mensaje no encontrado' }, 404);
        }

        return json(actualizado, 200);
    } catch (error) {
        console.error('[mensajes] Error al actualizar:', error);
        return json({ error: 'Error al actualizar el mensaje' }, 500);
    }
};

// ============================
// DELETE: eliminar mensaje
// ============================
export const DELETE = async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return json({ error: 'No autorizado' }, 401);

    const id = Number(params.id);
    if (!id || Number.isNaN(id) || id <= 0) {
        return json({ error: 'ID inválido' }, 400);
    }

    try {
        // Verificar que exista antes de borrar (para devolver 404 correcto)
        const [existente] = await db
            .select()
            .from(mensajes)
            .where(eq(mensajes.id, id));

        if (!existente) {
            return json({ error: 'Mensaje no encontrado' }, 404);
        }

        await db.delete(mensajes).where(eq(mensajes.id, id));

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('[mensajes] Error al eliminar:', error);
        return json({ error: 'Error al eliminar el mensaje' }, 500);
    }
};