export const prerender = false;

import { db } from '../../../db/index.js';
import { videos } from '../../../db/schema.js';
import { auth } from '../../../lib/auth.js';
import { eq } from 'drizzle-orm';

export const DELETE = async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'No autorizado' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    await db.delete(videos).where(eq(videos.id, Number(params.id)));

    return new Response(null, { status: 204 });
};