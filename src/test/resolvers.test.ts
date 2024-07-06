import { resolvers } from '../resolvers';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    book: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    review: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mPrisma),
  };
});

const mockContext = {
  user: {
    id: 1,
  },
};

let books = [
    { id: 1, title: 'New Book', author: 'Author Name', publishedYear: 2023 },
  ];

let book = { id: 1, title: 'New Book', author: 'Author Name', publishedYear: 2023 };

let reviews = [
    { id: 1, userId: 1, bookId: 1, rating: 5, comment: 'Great book!', createdAt: new Date() },
    { id: 2, userId: 2, bookId: 1, rating: 4, comment: 'Good read.', createdAt: new Date() },
  ];

describe('Resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query', () => {
    it('getBooks should return a list of books', async () => {
      (prisma.book.findMany as jest.Mock).mockResolvedValue(books);
      const result = await resolvers.Query.getBooks();
      expect(result).toEqual(books);
    });

    it('getBook should return a specific book by ID', async () => {
      (prisma.book.findUnique as jest.Mock).mockResolvedValue(book);
      const result = await resolvers.Query.getBook({}, { id: '1' });
      expect(result).toEqual(book);
    });

    it('getReviews should return a list of reviews for a specific book', async () => {
      (prisma.review.findMany as jest.Mock).mockResolvedValue(reviews);
      const result = await resolvers.Query.getReviews({}, { bookId: '1' });
      expect(result).toEqual(reviews);
    });

    it('getMyReviews should return a list of reviews by the authenticated user', async () => {
      (prisma.review.findMany as jest.Mock).mockResolvedValue(reviews);
      const result = await resolvers.Query.getMyReviews({}, {}, mockContext);
      expect(result).toEqual(reviews);
    });
  });

  describe('Mutation', () => {
    it('register should create a new user and return a token', async () => {
        const user = { id: 1, username: 'testuser', email: 'test@example.com', password: 'password' };
        (prisma.user.create as jest.Mock).mockResolvedValue(user);
        jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'password');
        const signMock = jest.spyOn(jwt, 'sign').mockImplementation(() => 'token' as any);
        const result = await resolvers.Mutation.register({}, { username: 'testuser', email: 'test@example.com', password: 'password' });
        expect(result.token).toEqual('token');
        expect(signMock).toHaveBeenCalled();
      });

      it('login should return a token for a valid user', async () => {
        const user = { id: 1, username: 'testuser', email: 'test@example.com', password: 'password' };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
        jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
        const signMock = jest.spyOn(jwt, 'sign').mockImplementation(() => 'token' as any);
        const result = await resolvers.Mutation.login({}, { email: 'test@example.com', password: 'password' });
        expect(result.token).toEqual('token');
        expect(signMock).toHaveBeenCalled();
      });

    it('addBook should create a new book', async () => {
      const book = { id: 1, title: 'New Book', author: 'Author Name', publishedYear: 2023 };
      (prisma.book.create as jest.Mock).mockResolvedValue(book);
      const result = await resolvers.Mutation.addBook({}, { title: 'New Book', author: 'Author Name', publishedYear: 2023 }, mockContext);
      expect(result).toEqual(book);
    });

    it('addReview should create a new review for a book', async () => {
      const review = { id: 1, userId: 1, bookId: 1, rating: 5, comment: 'Great book!', createdAt: new Date() };
      (prisma.review.create as jest.Mock).mockResolvedValue(review);
      const result = await resolvers.Mutation.addReview({}, { bookId: '1', rating: 5, comment: 'Great book!' }, mockContext);
      expect(result).toEqual(review);
    });

    it('updateReview should update the user\'s own review', async () => {
      const review = { id: 1, userId: 1, bookId: 1, rating: 5, comment: 'Great book!', createdAt: new Date() };
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(review);
      (prisma.review.update as jest.Mock).mockResolvedValue(review);

      const result = await resolvers.Mutation.updateReview({}, { reviewId: '1', rating: 4, comment: 'Updated comment' }, mockContext);
      expect(result).toEqual(review);
    });

    it('deleteReview should delete the user\'s own review', async () => {
      const review = { id: 1, userId: 1, bookId: 1, rating: 5, comment: 'Great book!', createdAt: new Date() };
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(review);
      (prisma.review.delete as jest.Mock).mockResolvedValue(review);

      const result = await resolvers.Mutation.deleteReview({}, { reviewId: '1' }, mockContext);
      expect(result).toEqual(true);
    });
  });
});
