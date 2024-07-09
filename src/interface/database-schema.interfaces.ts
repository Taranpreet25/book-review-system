import { PrismaClient } from "@prisma/client";

export interface IContext {
  prisma: PrismaClient;
  user: IUser | null;
}

export interface IRegisterArgs {
  username: string;
  email: string;
  password: string;
}

export interface ILoginArgs {
  email: string;
  password: string;
}

export interface IAddBookArgs {
  title: string;
  author: string;
  publishedYear: number;
}

export interface IAddReviewArgs {
  bookId: string;
  rating: number;
  comment: string;
}

export interface IUpdateReviewArgs {
  reviewId: string;
  rating?: number;
  comment?: string;
}

export interface IDeleteReviewArgs {
  reviewId: string;
}

export interface IUser {
  id: number;
  // Add other user properties if needed
}
