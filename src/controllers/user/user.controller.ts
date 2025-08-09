import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generateCode } from "../../services/code/code.service";
import { sendResetEmail } from "../../services/email/email.service";
import bcrypt from "bcryptjs";
import { MESSAGES } from "../../utils/messages";
import { enviarEmail } from "../../helpers/emailHelper";
import { generateVerificationCode } from "../../helpers/generateCodeHelper";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "secrettoken";
const JWT_EXPIRATION = "6h";

const generateToken = (user: any): string => {
  return jwt.sign({ user }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

export const createUser: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, senha, renda_mensal, expoToken, nivel } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: MESSAGES.USER.EMAIL_EXISTS });
      return;
    }

    console.log("Arquivo recebido:", req.file);

    const hashedPassword = await bcrypt.hash(senha, 10);
    const avatarPath = req.file ? `avatar/${req.file.filename}` : "";

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        senha: hashedPassword,
        avatar: avatarPath,
        renda_mensal: renda_mensal
          ? parseFloat(parseFloat(renda_mensal).toFixed(2))
          : 0.0,
        salario: 0.0,
        outras_fontes: 0.0,
        verify: false,
        expoToken: expoToken,
        nivel: nivel,
      },
    });

    const verificationCode = generateVerificationCode();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const newCode = await prisma.code.create({
      data: {
        userId: newUser.id,
        code: verificationCode,
        expiresAt: expiresAt,
      },
    });

    await enviarEmail(email, "Código de Confirmação", newCode.code, name);

    const { senha: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: MESSAGES.USER.CREATED,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({
      error: MESSAGES.USER.ERROR,
      details: error instanceof Error ? error.message : error,
    });
  }
};

export const updateData: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { salario, outras_fontes } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      res.status(404).json({ error: "Usuário não encontrado." });
      return;
    }

    const salarioFinal =
      salario !== undefined
        ? parseFloat(parseFloat(salario).toFixed(2))
        : existingUser.salario?.toNumber() || 0;

    const outrasFontesFinal =
      outras_fontes !== undefined
        ? parseFloat(parseFloat(outras_fontes).toFixed(2))
        : existingUser.outras_fontes?.toNumber() || 0;

    const renda = parseFloat((salarioFinal + outrasFontesFinal).toFixed(2));

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        salario: salario !== undefined ? salarioFinal : undefined,
        outras_fontes:
          outras_fontes !== undefined ? outrasFontesFinal : undefined,
        renda_mensal: renda,
      },
    });

    const user = await prisma.user.findUnique({ where: { id } });

    const token = generateToken(user);

    await prisma.auth.update({
      where: { userId: updatedUser.id },
      data: { token },
    });

    res.status(200).json({
      message: MESSAGES.USER.UPDATED,
      user: updatedUser,
      token: token,
    });
  } catch (error) {
    res.status(500).json({
      error: MESSAGES.USER.ERROR,
      details: error instanceof Error ? error.message : error,
    });
  }
};

export const getUsers: RequestHandler = async (_req, res) => {
  try {
    const users = await prisma.user.findMany({});

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
    const { name, email } = req.body;

    const avatarPath = req.file ? `avatar/${req.file.filename}` : undefined;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        avatar: avatarPath,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

    const user = await prisma.user.findUnique({ where: { id } });

    const token = generateToken(user);

    await prisma.auth.update({
      where: { userId: updatedUser.id },
      data: { token },
    });

    res.status(200).json({
      message: MESSAGES.USER.UPDATED,
      user: user,
      token: token,
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({
      error: MESSAGES.USER.ERROR,
      details: error instanceof Error ? error.message : error,
    });
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

    // const code = await generateCode(user.id);
    // await sendResetEmail(user.email, code);
    const verificationCode = generateVerificationCode();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const newCode = await prisma.code.create({
      data: {
        userId: user.id,
        code: verificationCode,
        expiresAt: expiresAt,
      },
    });

    await enviarEmail(email, "Código de Confirmação", user.name, newCode.code);

    res.status(200).json({ message: MESSAGES.AUTH.PASSWORD_RESET_SENT, user });
  } catch (error) {
    console.error("Erro no resendPassword:", error);
    res
      .status(500)
      .json({ error: MESSAGES.ERROR.INTERNAL_SERVER, details: error });
  }
};

export const updatePassword: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { senha } = req.body;

    if (!senha) {
      res.status(400).json({ error: MESSAGES.ERROR.INVALID_REQUEST });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      res.status(404).json({ error: MESSAGES.USER.NOT_FOUND });
      return;
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    await prisma.user.update({
      where: { id },
      data: { senha: hashedPassword },
      select: {
        id: true,
        senha: true,
      },
    });

    res.status(200).json({ message: MESSAGES.USER.RESET_PASSWORD });
  } catch (error) {
    console.error("Erro ao atualizar salário e outras fontes:", error);
    res.status(500).json({
      error: MESSAGES.USER.ERROR,
      details: error instanceof Error ? error.message : error,
    });
  }
};
