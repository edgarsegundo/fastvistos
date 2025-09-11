// Real Prisma client for database connection
import { PrismaClient } from '@prisma/client';

let prisma;

try {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    log: ['query', 'info', 'warn', 'error'],
  });
  
  console.log('✅ Prisma client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Prisma client:', error);
  // Fallback mock for testing when database is not available
  prisma = {
    blogConfig: {
      findFirst: () => Promise.resolve(null)
    },
    blogArticle: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null)
    },
    blogTopic: {
      findMany: () => Promise.resolve([])
    }
  };
}

export { prisma };
