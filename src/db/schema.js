import { relations } from 'drizzle-orm';
import {
    pgTable,
    text,
    timestamp,
    boolean,
    index,
    serial,
    varchar,
} from 'drizzle-orm/pg-core';

// ============================
// Tablas de Better Auth
// ============================

export const user = pgTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const session = pgTable(
    'session',
    {
        id: text('id').primaryKey(),
        expiresAt: timestamp('expires_at').notNull(),
        token: text('token').notNull().unique(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .$onUpdate(() => new Date())
            .notNull(),
        ipAddress: text('ip_address'),
        userAgent: text('user_agent'),
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
    },
    (table) => [index('session_userId_idx').on(table.userId)]
);

export const account = pgTable(
    'account',
    {
        id: text('id').primaryKey(),
        accountId: text('account_id').notNull(),
        providerId: text('provider_id').notNull(),
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        accessToken: text('access_token'),
        refreshToken: text('refresh_token'),
        idToken: text('id_token'),
        accessTokenExpiresAt: timestamp('access_token_expires_at'),
        refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
        scope: text('scope'),
        password: text('password'),
        issuer: text('issuer'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [index('account_userId_idx').on(table.userId)]
);

export const verification = pgTable(
    'verification',
    {
        id: text('id').primaryKey(),
        identifier: text('identifier').notNull(),
        value: text('value').notNull(),
        expiresAt: timestamp('expires_at').notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [index('verification_identifier_idx').on(table.identifier)]
);

// ============================
// Tablas propias del sitio
// ============================

export const eventos = pgTable('eventos', {
    id: serial('id').primaryKey(),
    titulo: varchar('titulo', { length: 255 }).notNull(),
    lugar: varchar('lugar', { length: 255 }).notNull(),
    fecha: timestamp('fecha', { withTimezone: true }).notNull(),
    hora: varchar('hora', { length: 50 }),
    imagenUrl: text('imagen_url'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const galeria = pgTable('galeria', {
    id: serial('id').primaryKey(),
    alt: varchar('alt', { length: 255 }).notNull(),
    url: text('url').notNull(),
    seccion: varchar('seccion', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow(),
});

export const mensajes = pgTable('mensajes', {
    id: serial('id').primaryKey(),
    nombre: varchar('nombre', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    telefono: varchar('telefono', { length: 50 }),
    tipoEvento: varchar('tipo_evento', { length: 100 }),
    fechaEvento: varchar('fecha_evento', { length: 50 }),
    mensaje: text('mensaje').notNull(),
    leido: boolean('leido').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const videos = pgTable('videos', {
    id: serial('id').primaryKey(),
    titulo: varchar('titulo', { length: 255 }).notNull(),
    url: text('url').notNull(),
    descripcion: text('descripcion'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================
// Relaciones de Better Auth
// ============================

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));