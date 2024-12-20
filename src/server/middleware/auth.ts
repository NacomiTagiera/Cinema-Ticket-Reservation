import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		res.status(401).json({ error: 'Authentication required' });
		return;
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!);
		req.user = decoded;
		next();
	} catch {
		res.status(403).json({ error: 'Invalid token' });
	}
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
	const user = req.user as JwtPayload;

	if (user.role !== 'ADMIN') {
		res.status(403).json({ error: 'Admin access required' });
		return;
	}

	next();
};
