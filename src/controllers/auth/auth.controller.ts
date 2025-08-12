import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { MESSAGES } from "../../utils/messages";
import { generateVerificationCode } from "../../helpers/generateCodeHelper";
import { enviarEmail } from "../../helpers/emailHelper";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "secrettoken";
const JWT_EXPIRATION = "6h";

const generateToken = (user: any): string => {
  return jwt.sign({ user }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

export const loginUser: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, senha, last_access } = req.body;

    if (!email || !senha || !last_access) {
      res.status(400).json({ error: MESSAGES.ERROR.INVALID_REQUEST });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ error: MESSAGES.AUTH.INVALID_CREDENTIALS });
      return;
    }

    if (!user.status) {
      res.status(403).json({ error: MESSAGES.AUTH.INVALID_CREDENTIALS });
      return;
    }

    const token = generateToken(user);

    if (!user.verify) {
      res.status(405).json({ error: MESSAGES.AUTH.INVALID_CREDENTIALS, token });
      return;
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);

    if (!isPasswordValid) {
      res.status(402).json({ error: MESSAGES.AUTH.INVALID_CREDENTIALS });
      return;
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await prisma.auth.upsert({
      where: { userId: user.id },
      update: { token, expiresAt, last_access },
      create: {
        userId: user.id,
        token,
        expiresAt,
        last_access,
      },
    });

    const { senha: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res
      .status(500)
      .json({ error: MESSAGES.ERROR.INTERNAL_SERVER, details: error });
  }
};

export const logoutUser: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { token, userId } = req.body;

    if (!token || !userId) {
      res.status(400).json({ error: MESSAGES.ERROR.INVALID_REQUEST });
      return;
    }

    const authRecord = await prisma.auth.findUnique({
      where: { userId },
    });

    if (!authRecord) {
      res.status(404).json({ error: MESSAGES.AUTH.TOKEN_NOT_FOUND });
      return;
    }

    await prisma.auth.update({
      where: { id: authRecord.id },
      data: {
        token: null,
      },
    });

    res.status(200).json({ message: MESSAGES.AUTH.LOGOUT_SUCCESS });
  } catch (error) {
    console.error("Erro no logout:", error);
    res
      .status(500)
      .json({ error: MESSAGES.ERROR.INTERNAL_SERVER, details: error });
  }
};

export const verifyCode: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { code } = req.body;
    const { id } = req.params;

    if (!code) {
      res.status(400).json({ error: MESSAGES.ERROR.INVALID_REQUEST });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      res.status(401).json({ error: MESSAGES.AUTH.INVALID_CREDENTIALS });
      return;
    }

    await prisma.user.update({
      where: { id },
      data: { verify: true },
    });

    const existingCode = await prisma.code.findFirst({
      where: { code, userId: id },
    });

    if (!existingCode) {
      res.status(400).json({ error: "Código inválido ou expirado." });
      return;
    }

    await prisma.code.delete({
      where: { id: existingCode.id },
    });

    res.status(200).json({
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res
      .status(500)
      .json({ error: MESSAGES.ERROR.INTERNAL_SERVER, details: error });
  }
};

export const checkToken: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { token, last_access } = req.body;

    if (!token || !last_access) {
      res.status(400).json({ error: MESSAGES.AUTH.TOKEN_NOT_FOUND });
      return;
    }

    const authProfile = await prisma.auth.findFirst({ where: { token } });

    if (!authProfile) {
      res.status(404).json({ error: MESSAGES.AUTH.TOKEN_NOT_FOUND });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: authProfile.userId },
    });

    if (!user) {
      res.status(404).json({ error: MESSAGES.USER.NOT_FOUND });
      return;
    }

    if (!user.status) {
      res.status(403).json({ error: MESSAGES.USER.ERROR });
      return;
    }

    if (authProfile.expiresAt < new Date()) {
      await prisma.auth.update({
        where: { id: authProfile.id },
        data: { token: null },
      });

      res.status(401).json({ error: "Token expirado. Faça login novamente." });
      return;
    }

    await prisma.auth.update({
      where: { id: authProfile.id },
      data: { last_access: last_access },
    });

    res.status(200).json({
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res
      .status(500)
      .json({ error: MESSAGES.ERROR.INTERNAL_SERVER, details: error });
  }
};

export const sendEmail: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: MESSAGES.ERROR.INVALID_REQUEST });
      return;
    }

    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      res.status(401).json({ error: MESSAGES.AUTH.INVALID_CREDENTIALS });
      return;
    }

    const existingCode = await prisma.code.findUnique({
      where: { userId: user.id },
    });

    if (existingCode) {
      const now = new Date();
      const createdAt = existingCode.expiresAt.getTime() - 5 * 60 * 1000;
      const secondsSinceCreation = (now.getTime() - createdAt) / 1000;

      if (secondsSinceCreation < 30) {
        res.status(429).json({
          error:
            "Aguarde ao menos 30 segundos antes de solicitar um novo código.",
        });
        return;
      }

      await prisma.code.delete({
        where: { userId: user.id },
      });
    }

    const verificationCode = generateVerificationCode();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const newCode = await prisma.code.create({
      data: {
        userId: user.id,
        code: verificationCode,
        expiresAt: expiresAt,
      },
    });

    await enviarEmail(email, "Código de Confirmação", newCode.code, user.name);

    res.status(200).json({
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      userId: user.id,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res
      .status(500)
      .json({ error: MESSAGES.ERROR.INTERNAL_SERVER, details: error });
  }
};
