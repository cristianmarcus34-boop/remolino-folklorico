export const prerender = false;

import { db } from '@/db/index.js';
import { galeria } from '@/db/schema.js';
import { auth } from '@/lib/auth.js';
import { eq } from 'drizzle-orm';

export const POST = async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return json({ error: 'No autorizado' }, 401);
    }

    const body = await request.json().catch(() => null);
    if (!body) return json({ error: 'JSON inválido' }, 400);

    if (!Array.isArray(body.orden)) {
        return json({ error: 'El campo "orden" debe ser un array' }, 400);
    }

    if (body.orden.length === 0) {
        return json({ error: 'El array de orden está vacío' }, 400);
    }

    // Validar que todos sean números válidos
    const idsValidos = body.orden.every(
        (id) => typeof id === 'number' && !Number.isNaN(id) && id > 0
    );
    if (!idsValidos) {
        return json({ error: 'Los IDs deben ser números válidos' }, 400);
    }

    try {
        // Actualizar el orden de cada imagen en una transacción
        await db.transaction(async (tx) => {
            for (let i = 0; i < body.orden.length; i++) {
                await tx
                    .update(galeria)
                    .set({ orden: i })
                    .where(eq(galeria.id, body.orden[i]));
            }
        });

        return json({ ok: true, count: body.orden.length }, 200);
    } catch (error) {
        console.error('[galeria/reorder] Error:', error);
        return json({ error: 'Error al guardar el orden' }, 500);
    }
};

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}