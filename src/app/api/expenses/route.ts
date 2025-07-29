import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { initMongoose } from '@/lib/mongoose';
import { ExpenseEntry } from '@/lib/models/ExpenseEntry';

export async function GET(request: NextRequest) {
  try {
    await initMongoose();
    
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query: any = {};
    
    if (authUser.role === 'employee') {
      // Employees can only see their own expenses
      query.user = authUser.id;
    } else {
      // Business users can see all expenses for their business
      query.business = authUser.businessId;
    }

    // Add date range filter if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: start,
        $lte: end
      };
    }

    const expenses = await ExpenseEntry.find(query)
      .populate('user', 'name username')
      .sort({ date: -1, createdAt: -1 });

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initMongoose();
    
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, description, amount } = await request.json();

    // Validate required fields
    if (!date || !description || amount === undefined || amount < 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Validate date (only allow last month entries)
    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    if (entryDate < lastMonth || entryDate > currentMonthEnd) {
      return NextResponse.json({ error: 'Can only add expenses for the last month and current month' }, { status: 400 });
    }

    // Create expense entry
    const expenseEntry = new ExpenseEntry({
      user: authUser.id,
      userType: authUser.role === 'business' ? 'Business' : 'Employee',
      business: authUser.businessId,
      date: entryDate,
      description: description.trim(),
      amount: parseInt(amount)
    });

    await expenseEntry.save();
    await expenseEntry.populate('user', 'name username');

    return NextResponse.json({ expense: expenseEntry }, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 