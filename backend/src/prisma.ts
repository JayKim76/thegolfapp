import { PrismaClient } from '@prisma/client';

// Single shared PrismaClient for the whole backend.
// (Previously every route module created its own instance.)
export const prisma = new PrismaClient();
