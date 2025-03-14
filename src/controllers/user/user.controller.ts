import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generateCode } from "../../services/code/code.service";
import { sendResetEmail } from "../../services/email/email.service";
import bcrypt from "bcryptjs";
import { MESSAGES } from "../../utils/messages";

const prisma = new PrismaClient();

export const createUser: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, senha, avatar, renda_mensal } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: MESSAGES.USER.EMAIL_EXISTS });
      return;
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        senha: hashedPassword,
        avatar: avatar || "",
        renda_mensal: renda_mensal ? parseFloat(renda_mensal.toFixed(2)) : 0.0,
      },
    });

    const { senha: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: MESSAGES.USER.CREATED,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ error: MESSAGES.USER.ERROR, details: error });
  }
};

export const getUsers: RequestHandler = async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        renda_mensal: true,
      },
    });

    res.status(200).json({
      message: MESSAGES.USER.FETCHED,
      users,
    });
  } catch (error) {
    res.status(500).json({
      error: MESSAGES.USER.ERROR,
      details: error,
    });
  }
};

export const getUserById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        renda_mensal: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: MESSAGES.USER.NOT_FOUND });
      return;
    }

    res.status(200).json({ message: MESSAGES.USER.FETCHED, user });
  } catch (error) {
    res.status(500).json({ error: MESSAGES.USER.ERROR, details: error });
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, avatar, renda_mensal } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        avatar,
        renda_mensal: renda_mensal ? parseFloat(renda_mensal.toFixed(2)) : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        renda_mensal: true,
      },
    });

    res.status(200).json({ message: MESSAGES.USER.UPDATED, user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: MESSAGES.USER.ERROR, details: error });
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: MESSAGES.USER.NOT_FOUND });
      return;
    }

    await prisma.user.delete({ where: { id } });

    res.status(200).json({ message: MESSAGES.USER.DELETED });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ error: MESSAGES.USER.ERROR, details: error });
  }
};

export const resendPassword: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: MESSAGES.ERROR.INVALID_REQUEST });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ error: MESSAGES.USER.NOT_FOUND });
      return;
    }

    const code = await generateCode(user.id);
    await sendResetEmail(user.email, code);

    res.status(200).json({ message: MESSAGES.AUTH.PASSWORD_RESET_SENT });
  } catch (error) {
    console.error("Erro no resendPassword:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_SERVER, details: error });
  }
};
