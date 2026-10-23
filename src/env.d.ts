/// <reference types="astro/client" />

type AuthSession = {
    user: {
        id: string;
        email: string;
        name: string;
    };
    session: {
        id: string;
        token: string;
        expiresAt: Date;
    };
};

declare namespace App {
    interface Locals {
        session: AuthSession | null;
    }
}