export const prerender = false;

import { db } from '@/db/index.js';
import { user } from '@/db/schema.js';
import { auth } from '@/lib/auth.js';
import { eq } from 'drizzle-orm';

const ROLES_VALIDOS = ['admin', 'editor'];

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

async function getAdminSession(request) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return { error: json({ error: 'No autorizado' }, 401) };

    const [usuarioActual] = await db
        .select()
        .from(user)
        .where(eq(user.id, session.user.id));

    if (!usuarioActual || usuarioActual.role !== 'admin') {
        return {
            error: json(
                { error: 'Solo un administrador puede hacer esto' },
                403
            ),
        };
    }

    return { session, usuarioActual };
}

// ============================
// PATCH: cambiar rol (o nombre)
// ============================
export const PATCH = async ({ request, params }) => {
    const authz = await getAdminSession(request);
    if (authz.error) return authz.error;

    const id = params.id;
    const body = await request.json().catch(() => null);
    if (!body) return json({ error: 'JSON inválido' }, 400);

    const updates = {};

    if (body.name) {
        if (typeof body.name !== 'string' || body.name.trim().length < 2) {
            return json({ error: 'Nombre inválido' }, 400);
        }
        updates.name = body.name.trim();
    }

    if (body.role) {
        if (!ROLES_VALIDOS.includes(body.role)) {
            return json({ error: 'Rol inválido' }, 400);
        }
        // No permitir que un admin se quite a sí mismo el rol
        if (id === authz.session.user.id && body.role !== 'admin') {
            return json(
                { error: 'No podés quitarte el rol admin a vos mismo' },
                400
            );
        }
        updates.role = body.role;
    }

    if (Object.keys(updates).length === 0) {
        return json({ error: 'Nada para actualizar' }, 400);
    }

    try {
        const [updated] = await db
            .update(user)
            .set(updates)
            .where(eq(user.id, id))
            .returning();

        if (!updated) return json({ error: 'Usuario no encontrado' }, 404);

        return json({ ok: true, user: updated });
    } catch (error) {
        console.error('[usuarios] Error al editar:', error);
        return json({ error: 'Error al editar el usuario' }, 500);
    }
};

// ============================
// DELETE: eliminar usuario
// ============================
export const DELETE = async ({ request, params }) => {
    const authz = await getAdminSession(request);
    if (authz.error) return authz.error;

    const id = params.id;

    if (authz.session.user.id === id) {
        return json({ error: 'No podés eliminar tu propio usuario' }, 400);
    }

    // No permitir quedarse sin admins
    const admins = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.role, 'admin'));

    const [target] = await db.select().from(user).where(eq(user.id, id));
    if (!target) return json({ error: 'Usuario no encontrado' }, 404);

    if (target.role === 'admin' && admins.length <= 1) {
        return json({ error: 'No podés eliminar al último admin' }, 400);
    }

    try {
        await db.delete(user).where(eq(user.id, id));
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('[usuarios] Error al eliminar usuario:', error);
        return json({ error: 'Error al eliminar el usuario' }, 500);
    }
};