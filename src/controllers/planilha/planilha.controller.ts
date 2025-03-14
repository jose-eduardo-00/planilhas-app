import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPlanilha: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, tipo, data, valor, userId } = req.body;

    if (!nome || !tipo || !data || !valor || !userId) {
      res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios." });
      return;
    }

    const novaPlanilha = await prisma.planilha.create({
      data: { nome, tipo, data: new Date(data), valor, userId },
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
    });

    res.status(200).json(planilhas);
  } catch (error) {
    console.error("Erro ao buscar planilhas:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const updatePlanilha = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, tipo, data, valor } = req.body;

    const planilhaAtualizada = await prisma.planilha.update({
      where: { id },
      data: { nome, tipo, data: new Date(data), valor },
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
