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
    const { date, description, amount } = await request.json();

    // Find expense and verify ownership
    const expense = await ExpenseEntry.findById(id);
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (expense.user.toString() !== authUser.id) {
      return NextResponse.json({ error: 'Cannot edit other users expenses' }, { status: 403 });
    }

    // Validate date (only allow last month entries)
    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    if (entryDate < lastMonth || entryDate > currentMonthEnd) {
      return NextResponse.json({ error: 'Can only edit expenses for the last month and current month' }, { status: 400 });
    }

    // Validate required fields
    if (!description || amount === undefined || amount < 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Update expense
    expense.date = entryDate;
    expense.description = description.trim();
    expense.amount = parseInt(amount);

    await expense.save();
    await expense.populate('user', 'name username');

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

    // Check date restriction (only allow editing last month)
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    if (expense.date < lastMonth || expense.date > currentMonthEnd) {
      return NextResponse.json({ error: 'Can only delete expenses for the last month and current month' }, { status: 400 });
    }

    await ExpenseEntry.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 