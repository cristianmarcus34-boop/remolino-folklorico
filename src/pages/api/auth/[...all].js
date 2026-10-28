export const prerender = false;

import { auth } from '@/lib/auth.js';

export const ALL = async (ctx) => {
    return auth.handler(ctx.request);
};