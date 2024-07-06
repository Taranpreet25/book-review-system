import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { AuthenticationError, UserInputError } from 'apollo-server';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const generateToken = (user: { id: number }) => {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
};

const getUserId = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch (e) {
    throw new Error('Invalid token');
  }
};

export const resolvers = {
  Query: {
    getBooks: async () => {
      try {
        return await prisma.book.findMany();
      } catch (error) {
        throw new Error('Could not fetch books');
      }
    },
    getBook: async (_: any, args: { id: string }) => {
      try {
        return await prisma.book.findUnique({ where: { id: parseInt(args.id) } });
      } catch (error) {
        throw new Error('Could not fetch book');
      }
    },
    getReviews: async (_: any, args: { bookId: string }) => {
      try {
        return await prisma.review.findMany({ where: { bookId: parseInt(args.bookId) } });
      } catch (error) {
        throw new Error('Could not fetch reviews');
      }
    },
    getMyReviews: async (_: any, __: any, context: any) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      try {
        return await prisma.review.findMany({ where: { userId: context.user.id } });
      } catch (error) {
        throw new Error('Could not fetch your reviews');
      }
    },
  },
  Mutation: {
    register: async (_: any, args: { username: string; email: string; password: string }) => {
      try {
        const hashedPassword = await bcrypt.hash(args.password, 10);
        const user = await prisma.user.create({
          data: {
            username: args.username,
            email: args.email,
            password: hashedPassword,
          },
        });
        return {
          token: generateToken(user),
          user,
        };
      } catch (error) {
        throw new Error('Could not register user');
      }
    },
    login: async (_: any, args: { email: string; password: string }) => {
      const user = await prisma.user.findUnique({ where: { email: args.email } });
      if (!user) throw new UserInputError('Invalid email or password');
      const valid = await bcrypt.compare(args.password, user.password);
      if (!valid) throw new UserInputError('Invalid email or password');
      return {
        token: generateToken(user),
        user,
      };
    },
    addBook: async (_: any, args: { title: string; author: string; publishedYear: number }, context: any) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      try {
        return await prisma.book.create({
          data: {
            title: args.title,
            author: args.author,
            publishedYear: args.publishedYear,
          },
        });
      } catch (error) {
        throw new Error('Could not add book');
      }
    },
    addReview: async (_: any, args: { bookId: string; rating: number; comment: string }, context: any) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      try {
        return await prisma.review.create({
          data: {
            userId: context.user.id,
            bookId: parseInt(args.bookId),
            rating: args.rating,
            comment: args.comment,
          },
        });
      } catch (error) {
        throw new Error('Could not add review');
      }
    },
    updateReview: async (_: any, args: { reviewId: string; rating?: number; comment?: string }, context: any) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      try {
        const review = await prisma.review.findUnique({ where: { id: parseInt(args.reviewId) } });
        if (!review || review.userId !== context.user.id) throw new AuthenticationError('Not authorized');
        return await prisma.review.update({
          where: { id: parseInt(args.reviewId) },
          data: {
            rating: args.rating,
            comment: args.comment,
          },
        });
      } catch (error) {
        throw new Error('Could not update review');
      }
    },
    deleteReview: async (_: any, args: { reviewId: string }, context: any) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      try {
        const review = await prisma.review.findUnique({ where: { id: parseInt(args.reviewId) } });
        if (!review || review.userId !== context.user.id) throw new AuthenticationError('Not authorized');
        await prisma.review.delete({ where: { id: parseInt(args.reviewId) } });
        return true;
      } catch (error) {
        throw new Error('Could not delete review');
      }
    },
  },
};
