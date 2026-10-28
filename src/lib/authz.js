import { auth } from './auth.js';

/**
 * Valida que el request tenga una sesión activa.
 * Devuelve { ok: true, session } o { ok: false, response }.
 */
export async function requireSession(request) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return {
            ok: false,
            response: new Response(JSON.stringify({ error: 'No autenticado' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            }),
        };
    }
    return { ok: true, session };
}

/**
 * Valida que el request tenga sesión Y sea admin.
 */
export async function requireAdmin(request) {
    const result = await requireSession(request);
    if (!result.ok) return result;

    if (result.session.user.role !== 'admin') {
        return {
            ok: false,
            response: new Response(
                JSON.stringify({ error: 'Se requiere rol admin' }),
                {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' },
                }
            ),
        };
    }
    return result;
}