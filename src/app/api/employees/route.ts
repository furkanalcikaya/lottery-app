import { NextRequest, NextResponse } from 'next/server';
import { initMongoose } from '@/lib/mongoose';
import Business from '@/lib/models/Business';
import Employee from '@/lib/models/Employee';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'business') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await initMongoose();

    const employees = await Employee.find({ business: user.businessId })
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json({ employees });
  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'business') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, username, password } = await request.json();

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: 'Name, username and password are required' },
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

    // Check if username already exists
    const existingBusiness = await Business.findOne({ username });
    const existingEmployee = await Employee.findOne({ username });
    
    if (existingBusiness || existingEmployee) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Create new employee
    const employee = new Employee({
      name,
      username,
      password,
      business: user.businessId
    });

    await employee.save();

    // Add employee to business
    await Business.findByIdAndUpdate(
      user.businessId,
      { $push: { employees: employee._id } }
    );

    const employeeResponse = employee.toObject();
    delete employeeResponse.password;

    return NextResponse.json(
      { employee: employeeResponse },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create employee error:', error);
    
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