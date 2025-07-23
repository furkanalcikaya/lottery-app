import { NextRequest, NextResponse } from 'next/server';
import { initMongoose } from '@/lib/mongoose';
import Business from '@/lib/models/Business';
import { getAuthUser } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'business') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await initMongoose();

    // Find the business owner
    const business = await Business.findById(user.businessId);
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await business.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Update to new password
    business.password = newPassword;
    await business.save();

    return NextResponse.json(
      { message: 'Password changed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 