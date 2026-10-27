export const prerender = false;

import { handleUpload } from '@vercel/blob/client';
import { auth } from '../../../lib/auth.js';

export const POST = async ({ request }) => {
    // 1. Verificación crítica: ¿el token de Blob existe en el entorno?
    if (!import.meta.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('[upload-token] ERROR: BLOB_READ_WRITE_TOKEN no está definido en el entorno.');
        return new Response(
            JSON.stringify({ error: 'Configuración del servidor incompleta (falta token de Blob)' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // 2. Verificación de sesión
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        console.warn('[upload-token] Intento de subida sin sesión válida.');
        return new Response(
            JSON.stringify({ error: 'No autorizado' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // 3. Parseo del body (con manejo de errores)
    let body;
    try {
        body = await request.json();
    } catch (parseError) {
        console.error('[upload-token] Error al parsear el body de la petición:', parseError);
        return new Response(
            JSON.stringify({ error: 'Petición inválida' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // 4. Generación del token con try/catch detallado
    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            token: import.meta.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN,
            onBeforeGenerateToken: async (pathname) => {
                return {
                    allowedContentTypes: ['video/mp4', 'video/webm', 'video/ogg'],
                    maximumSizeInBytes: 500 * 1024 * 1024,
                    validUntil: Date.now() + 5 * 60 * 1000,
                };
            },
            onUploadCompleted: async ({ blob }) => {
                console.log('[upload-token] Subida completada:', blob.url);
            },

        });

        return new Response(JSON.stringify(jsonResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        // Loguear el error completo para diagnóstico
        console.error('[upload-token] Error en handleUpload:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Error interno al generar el token' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
};