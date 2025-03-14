import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { MESSAGES } from "../../utils/messages";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "secrettoken";
const JWT_EXPIRATION = "6h";

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

export const loginUser: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({ error: MESSAGES.ERROR.INVALID_REQUEST });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ error: MESSAGES.AUTH.INVALID_CREDENTIALS });
      return;
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);

    if (!isPasswordValid) {
      res.status(401).json({ error: MESSAGES.AUTH.INVALID_CREDENTIALS });
      return;
    }

    const token = generateToken(user.id);

    await prisma.auth.upsert({
      where: { userId: user.id },
      update: { token },
      create: { userId: user.id, token },
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

    await prisma.auth.delete({
      where: { id: authRecord.id },
    });

    res.status(200).json({ message: MESSAGES.AUTH.LOGOUT_SUCCESS });
  } catch (error) {
    console.error("Erro no logout:", error);
    res
      .status(500)
      .json({ error: MESSAGES.ERROR.INTERNAL_SERVER, details: error });
  }
};
