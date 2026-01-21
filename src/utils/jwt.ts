import jwt from 'jsonwebtoken';
import { config } from '../config/env';

const SECRETS = config.jwtSecret;

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, SECRETS, { expiresIn: '7d' });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, SECRETS);
};
