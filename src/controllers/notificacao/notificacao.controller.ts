import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createNotificacao: RequestHandler = async (req, res) => {
  try {
    const { nome, texto, userId, validade } = req.body;

    if (!nome || !texto || !userId) {
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

    const novaNotificacao = await prisma.notificacao.create({
      data: {
        nome,
        texto,
        userId,
        validade,
      },
    });

    res.status(201).json(novaNotificacao);
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const getAllNotificacao: RequestHandler = async (req, res) => {
  try {
    const notificacoes = await prisma.notificacao.findMany({
      include: { notificacoesUsuarios: true },
    });

    res.status(200).json(notificacoes);
  } catch (error) {
    console.error("Erro ao buscar as notificações:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const visualizarNotificacao: RequestHandler = async (req, res) => {
  try {
    const { userId, notificacaoId } = req.params;

    if (!userId || !notificacaoId) {
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

    const notificacao = await prisma.notificacao.findUnique({
      where: { id: notificacaoId },
    });

    if (!notificacao) {
      res.status(404).json({
        error: "Notificação não encontrado.",
      });
      return;
    }

    const novaVisualizarNotificacao = await prisma.notificacaoUser.create({
      data: {
        notificacaoId,
        userId,
        visualizado: true,
      },
    });

    res.status(201).json(novaVisualizarNotificacao);
  } catch (error) {
    console.error("Erro ao visualizar a notificação:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const getNumberUserNotificacao: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        error: "Campo de id não informado.",
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

    const notificacoesValidas = await prisma.notificacao.findMany({
      where: {
        userId,
        OR: [{ validade: null }, { validade: { gt: new Date() } }],
      },
      select: { id: true },
    });

    const idsNotificacoesValidas = notificacoesValidas.map((n) => n.id);

    const notificacoesVisualizadas = await prisma.notificacaoUser.findMany({
      where: {
        userId,
        notificacaoId: { in: idsNotificacoesValidas },
        visualizado: true,
      },
      select: { notificacaoId: true },
    });

    const idsVisualizadas = new Set(
      notificacoesVisualizadas.map((n) => n.notificacaoId)
    );

    const naoVisualizadas = idsNotificacoesValidas.filter(
      (id) => !idsVisualizadas.has(id)
    );

    res.status(200).json({ quantidade: naoVisualizadas.length });
  } catch (error) {
    console.error("Erro ao buscar as notificações:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};
