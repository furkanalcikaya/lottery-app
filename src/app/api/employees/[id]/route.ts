import { NextRequest, NextResponse } from 'next/server';
import { initMongoose } from '@/lib/mongoose';
import Business from '@/lib/models/Business';
import Employee from '@/lib/models/Employee';
import { getAuthUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'business') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, username, password } = await request.json();

    if (!name || !username) {
      return NextResponse.json(
        { error: 'Name and username are required' },
        { status: 400 }
      );
    }

    await initMongoose();

    const employee = await Employee.findById(params.id);
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if employee belongs to this business
    if (employee.business.toString() !== user.businessId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if username already exists (excluding current employee)
    const existingBusiness = await Business.findOne({ username });
    const existingEmployee = await Employee.findOne({ 
      username, 
      _id: { $ne: params.id } 
    });
    
    if (existingBusiness || existingEmployee) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Update employee fields
    employee.name = name;
    employee.username = username;
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 400 }
        );
      }
      employee.password = password;
    }

    await employee.save();

    const employeeResponse = employee.toObject();
    delete employeeResponse.password;

    return NextResponse.json({ employee: employeeResponse });
  } catch (error: unknown) {
    console.error('Update employee error:', error);
    
    if (error && typeof error === 'object' && 'code' in error && (error as any).code === 11000) {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'business') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await initMongoose();

    const employee = await Employee.findById(params.id);
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if employee belongs to this business
    if (employee.business.toString() !== user.businessId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Remove employee from business employees array
    await Business.findByIdAndUpdate(
      user.businessId,
      { $pull: { employees: params.id } }
    );

    // Delete the employee
    await Employee.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 