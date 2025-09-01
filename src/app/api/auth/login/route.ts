import { NextRequest, NextResponse } from 'next/server';
import { initMongoose } from '@/lib/mongoose';
import Business from '@/lib/models/Business';
import Employee from '@/lib/models/Employee';
import { createAuthResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    await initMongoose();

    // Try to find business first
    let user = await Business.findOne({ username });
    let role: 'business' | 'employee' = 'business';
    let businessId = '';

    if (!user) {
      // Try to find employee
      user = await Employee.findOne({ username }).populate('business');
      role = 'employee';
      
      if (!user) {
        return NextResponse.json(
          { error: 'Kullanıcı adı bulunamadı' },
          { status: 401 }
        );
      }
      
      businessId = user.business._id.toString();
    } else {
      businessId = user._id.toString();
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Kullanıcı adı veya şifre hatalı' },
        { status: 401 }
      );
    }

    const authUser = {
      id: user._id.toString(),
      username: user.username,
      role,
      businessId,
      name: role === 'employee' ? user.name : (user.name || user.companyName),
      companyName: role === 'business' ? user.companyName : user.business?.companyName
    };

    const authResponse = createAuthResponse(authUser);

    return NextResponse.json(
      { user: authResponse.user },
      { 
        status: 200,
        headers: authResponse.headers
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 