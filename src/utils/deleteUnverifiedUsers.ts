import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const deleteOldUnverifiedUsers = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    const result = await prisma.user.deleteMany({
      where: {
        verify: false,
        createdAt: {
          lt: sevenDaysAgo,
        },
      },
    });

    console.log(`Usuários não verificados excluídos: ${result.count}`);
  } catch (error) {
    console.error("Erro ao excluir usuários não verificados:", error);
  }
};
