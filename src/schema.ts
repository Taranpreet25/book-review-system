import { gql } from 'apollo-server';

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    reviews: [Review!]!
  }

  type Book {
    id: ID!
    title: String!
    author: String!
    publishedYear: Int!
    reviews: [Review!]!
  }

  type Review {
    id: ID!
    rating: Int!
    comment: String!
    createdAt: String!
    user: User!
    book: Book!
  }

  type Query {
    getBooks: [Book!]!
    getBook(id: ID!): Book
    getReviews(bookId: ID!): [Review!]!
    getMyReviews: [Review!]!
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    addBook(title: String!, author: String!, publishedYear: Int!): Book!
    addReview(bookId: ID!, rating: Int!, comment: String!): Review!
    updateReview(reviewId: ID!, rating: Int, comment: String): Review!
    deleteReview(reviewId: ID!): Boolean!
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;
