import { auth } from './lib/auth.js';

export async function onRequest({ request, locals, redirect }, next) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/admin')) {
        console.log('Middleware /admin - Cookies:', request.headers.get('cookie'));

        const session = await auth.api.getSession({ headers: request.headers });
        console.log('Middleware /admin - Session:', session);

        if (!session) {
            console.log('Middleware /admin - Sin sesión, redirigiendo a /login');
            return redirect('/login');
        }

        locals.session = session;
    }

    return next();
}