export const prerender = false;

import { handleUpload } from '@vercel/blob/client';
import { auth } from '@/lib/auth.js';

export const POST = async ({ request }) => {
    // 👇 Leer el token de donde sea (import.meta.env en dev, process.env en prod)
    const blobToken =
        import.meta.env.BLOB_READ_WRITE_TOKEN ||
        process.env.BLOB_READ_WRITE_TOKEN;

    console.log(
        '[upload-token] Token:',
        blobToken ? `PRESENTE (${blobToken.length} chars)` : 'AUSENTE'
    );

    if (!blobToken || blobToken.trim() === '') {
        console.error(
            '[upload-token] ERROR: BLOB_READ_WRITE_TOKEN no está definido o está vacío.'
        );
        return new Response(
            JSON.stringify({
                error: 'Configuración incompleta: falta BLOB_READ_WRITE_TOKEN',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        console.warn('[upload-token] Intento de subida sin sesión válida.');
        return new Response(JSON.stringify({ error: 'No autorizado' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let body;
    try {
        body = await request.json();
    } catch (parseError) {
        console.error('[upload-token] Error al parsear el body:', parseError);
        return new Response(JSON.stringify({ error: 'Petición inválida' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            token: blobToken, // 👈 FORZAR el token explícito
            onBeforeGenerateToken: async (pathname) => {
                return {
                    allowedContentTypes: [
                        'image/jpeg',
                        'image/png',
                        'image/webp',
                        'image/gif',
                        'image/svg+xml',
                    ],
                    maximumSizeInBytes: 10 * 1024 * 1024, // 10 MB
                    validUntil: Date.now() + 5 * 60 * 1000, // 5 min
                    tokenPayload: JSON.stringify({
                        userId: session.user.id,
                    }),
                };
            },
            onUploadCompleted: async ({ blob }) => {
                console.log('[upload-token] Imagen subida:', blob.url);
            },
        });

        return new Response(JSON.stringify(jsonResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('[upload-token] Error en handleUpload:', error);
        return new Response(
            JSON.stringify({
                error:
                    error instanceof Error
                        ? error.message
                        : 'Error interno al generar el token',
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
};