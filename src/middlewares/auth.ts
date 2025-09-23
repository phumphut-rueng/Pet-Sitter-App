import jwt from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";

const JWT_SECRET = process.env.SECRET_KEY || process.env.JWT_SECRET || "your-secret-key";

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: number;
    name: string;
    email: string;
    profile_image?: string;
    roles: string[];
  };
}

export function verifyToken(req: AuthenticatedRequest): { user: any } | { error: string } {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return { error: "Authorization header missing" };
    }

    if (!authHeader.startsWith("Bearer ")) {
      return { error: "Invalid authorization format. Use Bearer <token>" };
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      return { error: "Token missing" };
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    return { user: decoded };

  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return { error: "Token expired" };
    }
    if (error.name === "JsonWebTokenError") {
      return { error: "Invalid token" };
    }
    return { error: "Token verification failed" };
  }
}

export function requireAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const authResult = verifyToken(req);

    if ("error" in authResult) {
      return res.status(401).json({ message: authResult.error });
    }

    req.user = authResult.user;
    return handler(req, res);
  };
}