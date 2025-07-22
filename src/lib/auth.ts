import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import Business from './models/Business';
import Employee from './models/Employee';
import { initMongoose } from './mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  id: string;
  username: string;
  role: 'business' | 'employee';
  businessId: string;
  name?: string;
}

export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    await initMongoose();

    // Verify user still exists in database
    if (decoded.role === 'business') {
      const business = await Business.findById(decoded.id);
      if (!business) return null;
    } else {
      const employee = await Employee.findById(decoded.id);
      if (!employee) return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export function createAuthResponse(user: AuthUser) {
  const token = signToken(user);
  
  return {
    user,
    token,
    headers: {
      'Set-Cookie': `auth-token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`
    }
  };
} 