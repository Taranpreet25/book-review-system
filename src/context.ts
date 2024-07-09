import { PrismaClient } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IContext, IUser } from './interface/database-schema.interfaces';
import { IAuthenticatedRequest } from './interface/auth-request.interface';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const createContext = ({ req }: { req: IAuthenticatedRequest }): IContext => {
  const token = req.headers.authorization || '';
  let user: IUser | null = null;

  if (token) {
    try {
      const UpdatedToken = token.replace('Bearer ', '');
      const decoded = jwt.verify(UpdatedToken, JWT_SECRET) as IUser;
      user = decoded;
    } catch (e) {
      console.warn(`Unable to authenticate using token: ${token}`);
    }
  }

  return { prisma, user };
};
