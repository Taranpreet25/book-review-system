import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const generateToken = (user: { id: number }) => {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
};

export const getUserId = (token: string) => {
  try {
    const UpdatedToken = token.replace('Bearer ', '');

    // console.log(UpdatedToken, token, "wefjbwiebfwbif");
    
    
    const decoded = jwt.verify(UpdatedToken, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch (e) {
    throw new Error('Invalid token');
  }
};
