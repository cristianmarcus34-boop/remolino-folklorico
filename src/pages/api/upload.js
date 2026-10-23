export const prerender = false;

import { put } from '@vercel/blob';
import { auth } from '../../lib/auth.js';

export const POST = async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'No autorizado' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
        return new Response(JSON.stringify({ error: 'No se recibió archivo' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (!file.type.startsWith('image/')) {
        return new Response(JSON.stringify({ error: 'El archivo debe ser una imagen' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (file.size > 4.5 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: 'La imagen supera los 4.5 MB' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const blob = await put(file.name, file, {
            access: 'public',
            addRandomSuffix: true,
            token: import.meta.env.BLOB_READ_WRITE_TOKEN,
        });

        return new Response(JSON.stringify({ url: blob.url }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('Error al subir a Vercel Blob:', err);
        return new Response(
            JSON.stringify({
                error: err instanceof Error ? err.message : 'Error al subir la imagen',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};