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
    const storeId = searchParams.get('store');
    const type = searchParams.get('type');

    const query: any = {};
    
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

    // Add store filter if provided
    if (storeId) {
      query.store = storeId;
    }

    // Add type filter if provided
    if (type && (type === 'expense' || type === 'payment')) {
      query.type = type;
    }

    const expenses = await ExpenseEntry.find(query)
      .populate('user', 'name username')
      .populate('store', 'name address')
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



    const { date, description, amount, store, type } = await request.json();

    // Validate required fields
    if (!date || !description || amount === undefined || amount < 0 || !store || !type) {
      return NextResponse.json({ error: 'Date, description, amount, store, and type are required' }, { status: 400 });
    }

    // Validate type
    if (type !== 'expense' && type !== 'payment') {
      return NextResponse.json({ error: 'Type must be either expense or payment' }, { status: 400 });
    }

    // Validate date (only allow last month entries)
    const [year, month, day] = date.split('-').map(Number);
    const entryDate = new Date(year, month - 1, day); // month is 0-based
    entryDate.setHours(0, 0, 0, 0);
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    oneMonthAgo.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (entryDate < oneMonthAgo || entryDate > today) {
      return NextResponse.json({ error: 'Can only add expenses for the last month and current month' }, { status: 400 });
    }

    // Create expense entry
    const expenseEntry = new ExpenseEntry({
      user: authUser.id,
      userType: authUser.role === 'business' ? 'Business' : 'Employee',
      business: authUser.businessId,
      store: store,
      date: entryDate,
      type: type,
      description: description.trim(),
      amount: parseFloat(amount)
    });

    await expenseEntry.save();
    await expenseEntry.populate('user', 'name username');
    await expenseEntry.populate('store', 'name address');

    return NextResponse.json({ expense: expenseEntry }, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 