import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { AuthenticationError, UserInputError } from 'apollo-server';
import { generateToken } from './utils/auth';
import * as dotenv from 'dotenv';
import { IAddBookArgs, IAddReviewArgs, IContext, IDeleteReviewArgs, ILoginArgs, IRegisterArgs, IUpdateReviewArgs } from './interface/database-schema.interfaces';

dotenv.config();

const prisma = new PrismaClient();


export const resolvers = {
  Query: {
    getBooks: async (_: undefined, __: undefined, context: IContext) => {
      try {
        return await context.prisma.book.findMany();
      } catch (error) {
        console.error('Error fetching books:', error);
        throw new Error('Could not fetch books');
      }
    },
    getBook: async (_: undefined, args: { id: string }, context: IContext) => {
      try {
        return await context.prisma.book.findUnique({ where: { id: parseInt(args.id) } });
      } catch (error) {
        throw new Error('Could not fetch book');
      }
    },
    getReviews: async (_: undefined, args: { bookId: string }, context: IContext) => {
      try {
        return await context.prisma.review.findMany({ where: { bookId: parseInt(args.bookId) } });
      } catch (error) {
        throw new Error('Could not fetch reviews');
      }
    },
    getMyReviews: async (_: undefined, __: undefined, context: IContext) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      try {
        return await context.prisma.review.findMany({ where: { userId: context.user.id } });
      } catch (error) {
        throw new Error('Could not fetch your reviews');
      }
    },
  },
  Mutation: {
    register: async (_: undefined, args: IRegisterArgs) => {
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
    login: async (_: undefined, args: ILoginArgs) => {
      const user = await prisma.user.findUnique({ where: { email: args.email } });
      if (!user) throw new UserInputError('Invalid email or password');
      const valid = await bcrypt.compare(args.password, user.password);
      if (!valid) throw new UserInputError('Invalid email or password');
      return {
        token: generateToken(user),
        user,
      };
    },
    addBook: async (_: undefined, args: IAddBookArgs, context: IContext) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      try {
        return await context.prisma.book.create({
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
    addReview: async (_: undefined, args: IAddReviewArgs, context: IContext) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      try {
        return await context.prisma.review.create({
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
    updateReview: async (_: undefined, args: IUpdateReviewArgs, context: IContext) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      try {
        const review = await context.prisma.review.findUnique({ where: { id: parseInt(args.reviewId) } });
        if (!review || review.userId !== context.user.id) throw new AuthenticationError('Not authorized');
        return await context.prisma.review.update({
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
    deleteReview: async (_: undefined, args: IDeleteReviewArgs, context: IContext) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      try {
        const review = await context.prisma.review.findUnique({ where: { id: parseInt(args.reviewId) } });
        if (!review || review.userId !== context.user.id) throw new AuthenticationError('Not authorized');
        await context.prisma.review.delete({ where: { id: parseInt(args.reviewId) } });
        return true;
      } catch (error) {
        throw new Error('Could not delete review');
      }
    },
  },
};
