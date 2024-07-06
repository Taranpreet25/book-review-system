import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

interface Context {
  prisma: PrismaClient;
  user?: any;
}

export const createContext = ({ req }: any): Context => {
  const token = req.headers.authorization || '';
  let user = null;
  if (token) {
    try {
      const UpdatedToken = token.replace('Bearer ', '');

    // console.log(UpdatedToken, token, "wefjbwiebfwbif");
      const decoded = jwt.verify(UpdatedToken, JWT_SECRET);
      user = decoded;
    } catch (e) {
      console.warn(`Unable to authenticate using token: ${token}`);
    }
  }
  return { prisma, user };
};
