import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    (req as any).userId = decoded.userId;
    (req as any).role = decoded.role;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
