import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const client = new PrismaClient({
    log: [
      { level: 'warn', emit: 'event' },
      { level: 'info', emit: 'event' },
      { level: 'error', emit: 'event' },
    ],
  });

  // Add Prisma Client event listeners
  client.$on('error', (e) => {
    console.error('Prisma Client error:', e);
  });

  client.$on('warn', (e) => {
    console.warn('Prisma Client warning:', e);
  });

  client.$on('info', (e) => {
    console.info('Prisma Client info:', e);
  });

  // Test the connection
  client.$connect()
    .then(() => {
      console.log('Successfully connected to the database');
    })
    .catch((error) => {
      console.error('Failed to connect to the database:', error);
    });

  return client;
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
