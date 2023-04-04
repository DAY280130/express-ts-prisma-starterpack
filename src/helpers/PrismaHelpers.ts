import { PrismaClient, Prisma } from '@prisma/client';

export const prisma = new PrismaClient();

export const isPeculiarPrismaError = (error: unknown) => {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientValidationError
  );
};
