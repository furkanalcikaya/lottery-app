import { NextRequest, NextResponse } from 'next/server';
import { initMongoose } from '@/lib/mongoose';
import Business from '@/lib/models/Business';
import { createAuthResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, companyName, username, password } = await request.json();

    if (!name || !companyName || !username || !password) {
      return NextResponse.json(
        { error: 'Ad, şirket adı, kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    await initMongoose();

    // Check if username already exists (both business and employee)
    const existingBusiness = await Business.findOne({ username });
    if (existingBusiness) {
      return NextResponse.json(
        { error: 'Kullanıcı adı zaten mevcut' },
        { status: 409 }
      );
    }

    // Create new business
    const business = new Business({
      name,
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
      name: business.name || business.companyName,
      companyName: business.companyName
    };

    const authResponse = createAuthResponse(authUser);

    return NextResponse.json(
      { user: authResponse.user },
      { 
        status: 201,
        headers: authResponse.headers
      }
    );
  } catch (error: unknown) {
    console.error('Registration error:', error);
    
    if (error && typeof error === 'object' && 'code' in error && (error as any).code === 11000) {
      return NextResponse.json(
        { error: 'Kullanıcı adı zaten mevcut' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 