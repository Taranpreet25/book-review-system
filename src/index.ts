// import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

// import { AuthenticationError, UserInputError } from 'apollo-server';

// const prisma = new PrismaClient();

// const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// export const resolvers = {
//   Query: {
//     getBooks: async () => {
//       return await prisma.book.findMany();
//     },
//     getBook: async (_: any, args: { id: string }) => {
//       return await prisma.book.findUnique({ where: { id: parseInt(args.id) } });
//     },
//     getReviews: async (_: any, args: { bookId: string }) => {
//       return await prisma.review.findMany({ where: { bookId: parseInt(args.bookId) } });
//     },
//     getMyReviews: async (_: any, __: any, context: any) => {
//       if (!context.user) throw new AuthenticationError('Not authenticated');
//       return await prisma.review.findMany({ where: { userId: context.user.id } });
//     },
//   },
//   Mutation: {
//     register: async (_: any, args: { username: string; email: string; password: string }) => {
//       const hashedPassword = await bcrypt.hash(args.password, 10);
//       const user = await prisma.user.create({
//         data: {
//           username: args.username,
//           email: args.email,
//           password: hashedPassword,
//         },
//       });
//       return jwt.sign({ userId: user.id }, JWT_SECRET);
//     },
//     login: async (_: any, args: { email: string; password: string }) => {
//       const user = await prisma.user.findUnique({ where: { email: args.email } });
//       if (!user) throw new UserInputError('Invalid email or password');
//       const valid = await bcrypt.compare(args.password, user.password);
//       if (!valid) throw new UserInputError('Invalid email or password');
//       return jwt.sign({ userId: user.id }, JWT_SECRET);
//     },
//     addBook: async (_: any, args: { title: string; author: string; publishedYear: number }, context: any) => {
//       if (!context.user) throw new AuthenticationError('Not authenticated');
//       return await prisma.book.create({
//         data: {
//           title: args.title,
//           author: args.author,
//           publishedYear: args.publishedYear,
//         },
//       });
//     },
//     addReview: async (_: any, args: { bookId: string; rating: number; comment: string }, context: any) => {
//       if (!context.user) throw new AuthenticationError('Not authenticated');
//       return await prisma.review.create({
//         data: {
//           userId: context.user.id,
//           bookId: parseInt(args.bookId),
//           rating: args.rating,
//           comment: args.comment,
//         },
//       });
//     },
//     updateReview: async (_: any, args: { reviewId: string; rating?: number; comment?: string }, context: any) => {
//       if (!context.user) throw new AuthenticationError('Not authenticated');
//       const review = await prisma.review.findUnique({ where: { id: parseInt(args.reviewId) } });
//       if (!review || review.userId !== context.user.id) throw new AuthenticationError('Not authorized');
//       return await prisma.review.update({
//         where: { id: parseInt(args.reviewId) },
//         data: {
//           rating: args.rating,
//           comment: args.comment,
//         },
//       });
//     },
//     deleteReview: async (_: any, args: { reviewId: string }, context: any) => {
//       if (!context.user) throw new AuthenticationError('Not authenticated');
//       const review = await prisma.review.findUnique({ where: { id: parseInt(args.reviewId) } });
//       if (!review || review.userId !== context.user.id) throw new AuthenticationError('Not authorized');
//       return await prisma.review.delete({ where: { id: parseInt(args.reviewId) } });
//     },
//   },
// };

import { ApolloServer, AuthenticationError, UserInputError } from 'apollo-server';
import { typeDefs } from './schema';
import { resolvers } from './resolvers'
import { createContext } from './context';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: createContext,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});



