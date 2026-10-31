import { PrismaClient } from '@prisma/client';

// APP_DATABASE_URL wins over DATABASE_URL when set. Rationale: the
// Supabase-Vercel integration owns DATABASE_URL on the deployment project
// (its value is a direct-connection string Vercel functions cannot reach,
// and it cannot be edited through the API), so the working pooled URL is
// provided under our own key instead.
const appDatabaseUrl = process.env.APP_DATABASE_URL;

// Single shared PrismaClient for the whole backend.
// (Previously every route module created its own instance.)
export const prisma = appDatabaseUrl
    ? new PrismaClient({ datasources: { db: { url: appDatabaseUrl } } })
    : new PrismaClient();
