import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";


export function verifyToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const bearerToken = getTokenFromRequest(req);

    if (!bearerToken) {
        return res.status(401).json({ message: "Missing token" });
    }

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

export function getTokenFromRequest(req: Request) {
    const bearerHeader = req.headers["authorization"];

    if (!bearerHeader) {
        return false;
    }

    return bearerHeader.split(" ")[1];
}

export function getUserId(req: Request): number | false {   
    const token = getTokenFromRequest(req);
    
    if (!token) {
        return false;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        return false;
    }

    const decoded = jwt.verify(token, secret);
    
    if (!decoded) {
        return false;
    }

    return Number(decoded);
}
