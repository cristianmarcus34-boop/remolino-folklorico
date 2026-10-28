import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/index.js';

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
    }),
    emailAndPassword: {
        enabled: true,
    },
    secret: import.meta.env.BETTER_AUTH_SECRET,
    baseURL: import.meta.env.BETTER_AUTH_URL,
    trustedOrigins: [
        'http://localhost:4321',
        'https://remolino-folklorico.vercel.app',
    ],
    advanced: {
        useSecureCookies: false,
    },

    // 👇 Le decimos a Better Auth que "role" existe en el user
    user: {
        additionalFields: {
            role: {
                type: 'string',
                required: false,
                defaultValue: 'editor',
                input: false, // no se puede setear desde signUpEmail público
            },
        },
    },
});