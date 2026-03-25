import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

// Use LibSQL adapter: on Bun this uses bun:sqlite (no query-engine binary);
// on Node.js it uses the native libsql library installed via npm.
const libsql = createClient({ url: dbUrl });
const adapter = new PrismaLibSQL(libsql);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient({ adapter } as any);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
