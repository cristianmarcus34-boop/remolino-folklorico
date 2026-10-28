export const prerender = false;

import { db } from '@/db/index.js';
import { user } from '@/db/schema.js';
import { auth } from '@/lib/auth.js';
import { eq } from 'drizzle-orm';

const ROLES_VALIDOS = ['admin', 'editor'];

export const POST = async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return json({ error: 'No autorizado' }, 401);
    }

    // Verificamos que el que crea sea admin
    const [usuarioActual] = await db
        .select()
        .from(user)
        .where(eq(user.id, session.user.id));

    if (!usuarioActual || usuarioActual.role !== 'admin') {
        return json(
            { error: 'Solo un administrador puede crear usuarios' },
            403
        );
    }

    const body = await request.json();

    if (!body.email || !body.password || !body.name) {
        return json(
            { error: 'Faltan campos obligatorios (email, password, name)' },
            400
        );
    }

    if (body.password.length < 8) {
        return json(
            { error: 'La contraseña debe tener al menos 8 caracteres' },
            400
        );
    }

    const role = body.role || 'editor';
    if (!ROLES_VALIDOS.includes(role)) {
        return json({ error: 'Rol inválido' }, 400);
    }

    try {
        // 1. Creamos el usuario (Better Auth hashea la pass + crea user y account)
        const resultado = await auth.api.signUpEmail({
            body: {
                email: body.email,
                password: body.password,
                name: body.name,
            },
        });

        if (!resultado?.user?.id) {
            return json({ error: 'No se pudo crear el usuario' }, 500);
        }

        // 2. ⚠️ signUpEmail NO persiste el role → UPDATE manual
        await db
            .update(user)
            .set({ role })
            .where(eq(user.id, resultado.user.id));

        return json(
            {
                ok: true,
                user: {
                    id: resultado.user.id,
                    name: resultado.user.name,
                    email: resultado.user.email,
                    role,
                },
            },
            201
        );
    } catch (error) {
        console.error('[usuarios] Error al crear usuario:', error);
        return json(
            { error: error.message || 'Error al crear el usuario' },
            400
        );
    }
};

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}