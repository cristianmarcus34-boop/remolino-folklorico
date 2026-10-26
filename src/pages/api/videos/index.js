export const prerender = false;

import { db } from '../../../db/index.js';
import { videos } from '../../../db/schema.js';
import { auth } from '../../../lib/auth.js';

export const POST = async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'No autorizado' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const body = await request.json();

    if (!body.titulo || !body.url) {
        return new Response(
            JSON.stringify({ error: 'Faltan campos obligatorios' }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    const [nuevo] = await db
        .insert(videos)
        .values({
            titulo: body.titulo,
            url: body.url,
            descripcion: body.descripcion || null,
        })
        .returning();

    return new Response(JSON.stringify(nuevo), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
    });
};