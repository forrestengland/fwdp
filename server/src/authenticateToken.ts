import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 1. Extend the Express Request type to include the user data
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export function authenticateToken(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) {
  // 2. Grab the Authorization header
  const authHeader = req.headers['authorization'];
  
  // Format is usually: "Bearer <TOKEN>"
  // This splits the string by space and grabs the second part (the token)
  const token = authHeader && authHeader.split(' ')[1];

  // 3. If there is no token, reject the request immediately
  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  // 4. Verify the token using your secret key
  const secret = process.env.JWT_SECRET as string;

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      // Token is expired, manipulated, or invalid
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // 5. Token is valid! Attach the decoded payload data to the request object
    req.user = decoded as { userId: string; email: string };
    
    // 6. Call next() to pass control to the actual route handler
    next();
  });
}
