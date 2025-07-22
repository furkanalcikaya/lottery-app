import { NextRequest, NextResponse } from 'next/server';
import { initMongoose } from '@/lib/mongoose';
import Business from '@/lib/models/Business';
import { createAuthResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { companyName, username, password } = await request.json();

    if (!companyName || !username || !password) {
      return NextResponse.json(
        { error: 'Company name, username and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await initMongoose();

    // Check if username already exists (both business and employee)
    const existingBusiness = await Business.findOne({ username });
    if (existingBusiness) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Create new business
    const business = new Business({
      companyName,
      username,
      password
    });

    await business.save();

    const authUser = {
      id: business._id.toString(),
      username: business.username,
      role: 'business' as const,
      businessId: business._id.toString(),
      name: business.companyName
    };

    const authResponse = createAuthResponse(authUser);

    return NextResponse.json(
      { user: authResponse.user },
      { 
        status: 201,
        headers: authResponse.headers
      }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 