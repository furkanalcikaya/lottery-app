import { NextRequest, NextResponse } from 'next/server';
import { initMongoose } from '@/lib/mongoose';
import Business from '@/lib/models/Business';
import Employee from '@/lib/models/Employee';
import { getAuthUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
        { error: 'Ad ve kullanıcı adı gereklidir' },
        { status: 400 }
      );
    }

    await initMongoose();

    const { id } = await params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return NextResponse.json(
        { error: 'Çalışan bulunamadı' },
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
      _id: { $ne: id } 
    });
    
    if (existingBusiness || existingEmployee) {
      return NextResponse.json(
        { error: 'Kullanıcı adı zaten mevcut' },
        { status: 400 }
      );
    }

    // Update employee data
    employee.name = name;
    employee.username = username;
    
    if (password && password.trim()) {
      employee.password = password;
    }
    
    await employee.save();

    const employeeResponse = {
      _id: employee._id,
      name: employee.name,
      username: employee.username,
      business: employee.business,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    };

    return NextResponse.json({ employee: employeeResponse });
  } catch (error: unknown) {
    console.error('Update employee error:', error);
    
    if (error && typeof error === 'object' && 'code' in error && (error as any).code === 11000) {
      return NextResponse.json(
        { error: 'Kullanıcı adı zaten mevcut' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Çalışan güncellenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return NextResponse.json(
        { error: 'Çalışan bulunamadı' },
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
      { $pull: { employees: id } }
    );

    // Delete the employee
    await Employee.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Çalışan başarıyla silindi' });
  } catch {
    return NextResponse.json(
      { error: 'Çalışan silinemedi' },
      { status: 500 }
    );
  }
} 