export const prerender = false;

import { db } from '@/db/index.js';
import { galeria } from '@/db/schema.js';
import { auth } from '@/lib/auth.js';

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
        return new Response(JSON.stringify({ error: 'Faltan campos obligatorios' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const [nueva] = await db
        .insert(galeria)
        .values({
            alt: body.alt,
            url: body.url,
            seccion: body.seccion || null,
        })
        .returning();

    return new Response(JSON.stringify(nueva), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
    });
};