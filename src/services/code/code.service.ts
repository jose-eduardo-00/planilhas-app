import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export const generateCode = async (userId: string): Promise<string> => {
  const code = crypto.randomInt(100000, 999999).toString();

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.code.deleteMany({
    where: { userId },
  });

  await prisma.code.create({
    data: {
      userId,
      code,
      expiresAt,
    },
  });

  return code;
};

export const verifyCode = async (
  userId: string,
  code: string
): Promise<boolean> => {
  const codeRecord = await prisma.code.findUnique({
    where: { userId },
  });

  if (
    !codeRecord ||
    codeRecord.code !== code ||
    codeRecord.expiresAt < new Date()
  ) {
    return false;
  }

  await prisma.code.delete({
    where: { userId },
  });

  return true;
};

export const cleanExpiredCodes = async (): Promise<void> => {
  await prisma.code.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};
