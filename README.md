# Book Review System

This is a GraphQL API for a Book Review System built using Node.js, TypeScript, Apollo Server, and Prisma. The API allows authenticated users to perform various operations such as registering, logging in, adding books, and reviewing books.

## Features

- User authentication with JSON Web Tokens (JWT)
- CRUD operations for books and reviews
- Public and authenticated queries and mutations
- Input validation and error handling
- Unit tests for resolvers

## Prerequisites

- Node.js (v14.x or higher)
- npm or yarn
- PostgreSQL

## Setup

### 1. Clone the repository

git clone https://github.com/your-username/book-review-system.git
cd book-review-system 

### 2. Install dependencies

npm install

### 3. Set up environment variables

DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<database>?schema=public"
JWT_SECRET="your_jwt_secret"


### 4. Set up the database

npx prisma migrate dev --name init
npx prisma generate
 

### 5. Run the server

npm run dev

### 6. Testing

npm test
