import { request, response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
    sub: string;
}

export const authMiddleware = (
    req = request,
    res = response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token nao encontrado." });
    }

    const [, token] = authHeader.split(" ");

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: "JWT_SECRET nao definido." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);


        req.userId = (decoded as TokenPayload).sub;

        return next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalido ou expirado." });
    }
};