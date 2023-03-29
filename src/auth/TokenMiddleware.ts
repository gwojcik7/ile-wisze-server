import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
export default function verifyToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const bearerHeader = req.headers["authorization"];

    if (!bearerHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const bearerToken = bearerHeader.split(" ")[1];

    try {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            return res.status(500).json({ message: "JWT SECRET not defined" });
        }

        jwt.verify(bearerToken, secret);

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
}
