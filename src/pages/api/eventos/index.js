export const prerender = false;

import { db } from '../../../db/index.js';
import { eventos } from '../../../db/schema.js';
import { auth } from '../../../lib/auth.js';

export const POST = async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
    }

    const body = await request.json();
    const [nuevo] = await db.insert(eventos).values({
        titulo: body.titulo,
        lugar: body.lugar,
        fecha: new Date(body.fecha),
        hora: body.hora,
    }).returning();

    return new Response(JSON.stringify(nuevo), { status: 201 });
};