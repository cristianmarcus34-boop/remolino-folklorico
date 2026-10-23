import { auth } from '../../../lib/auth.js';

export const prerender = false;

export const ALL = async (ctx) => {
    return auth.handler(ctx.request);
};