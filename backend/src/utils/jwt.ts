import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  const secret: string = process.env.JWT_SECRET || 'secret';
  const expiresIn: any = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

export const verifyToken = (token: string): any => {
  const secret: string = process.env.JWT_SECRET || 'secret';
  return jwt.verify(token, secret);
};