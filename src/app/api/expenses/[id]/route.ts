import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { initMongoose } from '@/lib/mongoose';
import { ExpenseEntry } from '@/lib/models/ExpenseEntry';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initMongoose();
    
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }



    const { id } = await params;
    const { date, description, amount, store, type } = await request.json();

    // Find expense and verify ownership
    const expense = await ExpenseEntry.findById(id);
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (expense.user.toString() !== authUser.id) {
      return NextResponse.json({ error: 'Cannot edit other users expenses' }, { status: 403 });
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
    
    if (entryDateUTC < fifteenDaysAgoUTC || entryDateUTC > todayUTC) {
      return NextResponse.json({ error: 'Can only edit expenses for the last 15 days' }, { status: 400 });
    }

    // Validate required fields
    if (!description || amount === undefined || amount < 0 || !store || !type) {
      return NextResponse.json({ error: 'Description, amount, store, and type are required' }, { status: 400 });
    }

    // Validate type
    if (type !== 'expense' && type !== 'payment') {
      return NextResponse.json({ error: 'Type must be either expense or payment' }, { status: 400 });
    }

    // Update expense
    expense.date = entryDateUTC;
    expense.description = description.trim();
    expense.amount = parseFloat(amount);
    expense.store = store;
    expense.type = type;

    await expense.save();
    await expense.populate('user', 'name username');
    await expense.populate('store', 'name address');

    return NextResponse.json({ expense });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initMongoose();
    
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }



    const { id } = await params;

    // Find expense and verify ownership
    const expense = await ExpenseEntry.findById(id);
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (expense.user.toString() !== authUser.id) {
      return NextResponse.json({ error: 'Cannot delete other users expenses' }, { status: 403 });
    }

    // Check date restriction (only allow deleting last 15 days entries)
    const expenseDate = new Date(expense.date);
    expenseDate.setHours(0, 0, 0, 0);
    
    const serverNow = new Date();
    const serverToday = new Date(serverNow.getFullYear(), serverNow.getMonth(), serverNow.getDate());
    
    // Allow entries for tomorrow too (to handle timezone differences)
    const allowedEndDate = new Date(serverToday);
    allowedEndDate.setDate(allowedEndDate.getDate() + 1);
    
    const fifteenDaysAgoLocal = new Date(serverToday);
    fifteenDaysAgoLocal.setDate(fifteenDaysAgoLocal.getDate() - 15);
    
    if (expenseDate < fifteenDaysAgoLocal || expenseDate > allowedEndDate) {
      return NextResponse.json({ error: 'Can only delete expenses for the last 15 days' }, { status: 400 });
    }

    await ExpenseEntry.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 