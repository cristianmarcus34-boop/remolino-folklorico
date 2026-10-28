export const prerender = false;

import { db } from '@/db/index.js';
import { galeria } from '@/db/schema.js';
import { auth } from '@/lib/auth.js';
import { sql } from 'drizzle-orm';

export const POST = async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'No autorizado' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const body = await request.json();

    if (!body.alt || !body.url) {
        return new Response(
            JSON.stringify({ error: 'Faltan campos obligatorios' }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    try {
        // Calcular el siguiente orden (max + 1)
        const [{ maxOrden }] = await db
            .select({
                maxOrden: sql`COALESCE(MAX(${galeria.orden}), 0)`.mapWith(
                    Number
                ),
            })
            .from(galeria);

        const [nueva] = await db
            .insert(galeria)
            .values({
                alt: body.alt,
                url: body.url,
                seccion: body.seccion || null,
                orden: (maxOrden || 0) + 1,
            })
            .returning();

        return new Response(JSON.stringify(nueva), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('[galeria] Error al crear:', error);
        return new Response(
            JSON.stringify({ error: 'Error al guardar la imagen' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};