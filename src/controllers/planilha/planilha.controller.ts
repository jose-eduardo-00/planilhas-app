import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPlanilha: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { nome, tipo, data, userId, linhas } = req.body;

    if (!nome || !tipo || !data || !userId || !Array.isArray(linhas)) {
      res.status(400).json({
        error:
          "Todos os campos são obrigatórios, incluindo 'linhas' como um array.",
      });
      return;
    }

    const novaPlanilha = await prisma.planilha.create({
      data: {
        nome,
        tipo,
        data: new Date(data),
        userId,
        valor: 0,
        linhas: {
          create: linhas.map((linha: { descricao: string }) => ({
            descricao: linha.descricao,
          })),
        },
      },
      include: {
        linhas: true,
      },
    });

    res.status(201).json(novaPlanilha);
  } catch (error) {
    console.error("Erro ao criar planilha:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const getPlanilhasByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const planilhas = await prisma.planilha.findMany({
      where: { userId },
      include: { linhas: true },
    });

    res.status(200).json(planilhas);
  } catch (error) {
    console.error("Erro ao buscar planilhas:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const addLinhaToPlanilha: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { planilhaId } = req.params;
    const { descricao } = req.body;

    if (!descricao) {
      res.status(400).json({ error: "O campo 'descricao' é obrigatório." });
      return;
    }

    const novaLinha = await prisma.linhaPlanilha.create({
      data: {
        descricao,
        planilhaId,
      },
    });

    res.status(201).json(novaLinha);
  } catch (error) {
    console.error("Erro ao adicionar linha:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const updatePlanilha: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, tipo, data, linhas } = req.body;

    if (!nome || !tipo || !data || !Array.isArray(linhas)) {
      res.status(400).json({
        error:
          "Todos os campos são obrigatórios, incluindo 'linhas' como um array.",
      });
      return;
    }

    const planilhaAtualizada = await prisma.planilha.update({
      where: { id },
      data: {
        nome,
        tipo,
        data: new Date(data),
        linhas: {
          deleteMany: {},
          create: linhas.map((linha: { descricao: string }) => ({
            descricao: linha.descricao,
          })),
        },
      },
      include: {
        linhas: true,
      },
    });

    res.status(200).json(planilhaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar planilha:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const deletePlanilha = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.planilha.delete({
      where: { id },
    });

    res.status(200).json({ message: "Planilha deletada com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar planilha:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};
