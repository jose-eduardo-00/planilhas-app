import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// CREATE PLANILHA
export const createPlanilha: RequestHandler = async (req, res) => {
  try {
    const { nome, userId } = req.body;

    if (!nome || !userId) {
      res.status(400).json({
        error: "Todos os campos são obrigatórios.",
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({
        error: "Usuário não encontrado.",
      });
      return;
    }

    const novaPlanilha = await prisma.planilha.create({
      data: {
        nome,
        userId,
        renda_mensal: user?.renda_mensal,
      },
    });

    res.status(201).json(novaPlanilha);
  } catch (error) {
    console.error("Erro ao criar planilha:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// GET PLANILHAS POR ID
export const getPlanilhaById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const planilha = await prisma.planilha.findUnique({
      where: { id },
      include: { linhas: true },
    });

    if (!planilha) {
      res.status(400).json({
        error: "Planilha não encontrada.",
      });
      return;
    }

    let valorTotal = 0;

    planilha.linhas.forEach((item) => {
      valorTotal += item.valor.toNumber();
    });

    const valorTotalFormatado = Number(valorTotal.toFixed(2));

    await prisma.planilha.update({
      where: { id },
      data: { nome: planilha.nome },
    });

    res.status(200).json({ planilha, valorTotalFormatado });
  } catch (error) {
    console.error("Erro ao buscar planilha:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// GET PLANILHAS
export const getPlanilhas: RequestHandler = async (req, res) => {
  try {
    const planilha = await prisma.planilha.findMany({
      include: { linhas: true },
    });

    res.status(200).json(planilha);
  } catch (error) {
    console.error("Erro ao buscar planilha:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// GET PLANILHAS POR USUÁRIO
export const getPlanilhasByUser: RequestHandler = async (req, res) => {
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

// ADICIONAR LINHA À PLANILHA
export const addLinhaToPlanilha: RequestHandler = async (req, res) => {
  try {
    const { planilhaId } = req.params;
    const { nome, tipo, data, valor } = req.body;

    if (!nome || !tipo || !data || valor === undefined) {
      res.status(400).json({
        error: "Os campos 'nome', 'tipo', 'data' e 'valor' são obrigatórios.",
      });
      return;
    }

    const novaLinha = await prisma.linhaPlanilha.create({
      data: {
        nome,
        tipo,
        data: new Date(data),
        valor,
        planilhaId,
        color: "#ffffff",
      },
    });

    res.status(201).json(novaLinha);
  } catch (error) {
    console.error("Erro ao adicionar linha:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// UPDATE PLANILHA (com substituição de linhas)
export const updatePlanilha: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;

    if (!id) {
      res.status(400).json({
        error: "O campo 'id' é obrigatório.",
      });
      return;
    }

    const planilhaAtualizada = await prisma.planilha.update({
      where: { id },
      data: {
        nome,
        descricao,
      },
      include: { linhas: true },
    });

    res.status(200).json(planilhaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar planilha:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// DELETE PLANILHA
export const deletePlanilha: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const planilha = await prisma.planilha.findUnique({ where: { id } });

    if (!planilha) {
      res.status(404).json({ error: "Planilha não encontrada." });
      return;
    }

    await prisma.$transaction([
      prisma.linhaPlanilha.deleteMany({ where: { planilhaId: id } }),
      prisma.planilha.delete({ where: { id } }),
    ]);

    res.status(200).json({ message: "Planilha deletada com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar planilha:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// UPDATE LINHAS DA PLANILHa
export const updateLinhaPlanilha: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, tipo, nome, valor, color } = req.body;

    const linhaPlanilhaAtualizada = await prisma.linhaPlanilha.update({
      where: { id },
      data: {
        nome,
        tipo,
        data: new Date(data),
        valor,
        color,
      },
    });

    res.status(200).json(linhaPlanilhaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar planilha:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// DELETE LINHA PLANILHA
export const deleteLinhaPlanilha: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.linhaPlanilha.delete({
      where: { id },
    });

    res
      .status(200)
      .json({ message: "Linha da Planilha deletada com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar planilha:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};
