import jwt from 'jsonwebtoken';
import { IDecodedToken } from '../interface/user-token.interface';

import * as dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables'); 
}

export const generateToken = (user: { id: number }) => {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
};

export const getUserId = (token: string) => {
  try {
    const UpdatedToken = token.replace('Bearer ', '');    
    
    const decoded = jwt.verify(UpdatedToken, JWT_SECRET) as IDecodedToken;
    return decoded.userId;
  } catch (e) {
    throw new Error('Invalid token');
  }
};
