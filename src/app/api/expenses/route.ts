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

    // Validate date (only allow last 15 days entries)
    // Use UTC dates to avoid timezone issues between client and server
    const [year, month, day] = date.split('-').map(Number);
    
    // Create dates in UTC to ensure consistency across timezones
    const entryDateUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    
    const nowUTC = new Date();
    const todayUTC = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate(), 23, 59, 59, 999));
    
    const fifteenDaysAgoUTC = new Date(todayUTC);
    fifteenDaysAgoUTC.setUTCDate(fifteenDaysAgoUTC.getUTCDate() - 15);
    fifteenDaysAgoUTC.setUTCHours(0, 0, 0, 0);

    // Debug logging to help with timezone issues
    console.log('=== EXPENSE DATE VALIDATION DEBUG (UTC) ===');
    console.log('Original date string:', date);
    console.log('Entry date (UTC):', entryDateUTC.toISOString());
    console.log('Fifteen days ago (UTC):', fifteenDaysAgoUTC.toISOString());
    console.log('Today end (UTC):', todayUTC.toISOString());
    
    if (entryDateUTC < fifteenDaysAgoUTC || entryDateUTC > todayUTC) {
      console.log('Expense date validation failed - rejecting entry');
      return NextResponse.json({ error: 'Can only add expenses for the last 15 days' }, { status: 400 });
    }

    // Create expense entry
    const expenseEntry = new ExpenseEntry({
      user: authUser.id,
      userType: authUser.role === 'business' ? 'Business' : 'Employee',
      business: authUser.businessId,
      store: store,
      date: entryDateUTC,
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