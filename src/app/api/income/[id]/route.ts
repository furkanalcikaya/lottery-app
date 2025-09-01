import { NextRequest, NextResponse } from 'next/server';
import { initMongoose } from '@/lib/mongoose';
import IncomeEntry from '@/lib/models/IncomeEntry';
import { getAuthUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { 
      cashIncome, 
      posIncome, 
      lotteryTicketIncome, 
      lotteryScratchIncome, 
      lotteryNumericalIncome,
      store 
    } = await request.json();

    await initMongoose();

    const { id } = await params;
    const entry = await IncomeEntry.findById(id);
    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const entryUserId = typeof entry.user === 'string' ? entry.user : entry.user?.toString();
    if (entryUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate date (only allow editing last month's data)
    const entryDate = new Date(entry.date);
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    if (entryDate < lastMonth) {
      return NextResponse.json(
        { error: 'Cannot edit entries older than last month' },
        { status: 400 }
      );
    }

    // Update entry
    entry.cashIncome = Number(cashIncome) || 0;
    entry.posIncome = Number(posIncome) || 0;
    entry.lotteryTicketIncome = Number(lotteryTicketIncome) || 0;
    entry.lotteryScratchIncome = Number(lotteryScratchIncome) || 0;
    entry.lotteryNumericalIncome = Number(lotteryNumericalIncome) || 0;
    
    // Update store if provided
    if (store) {
      entry.store = store;
    }

    await entry.save();

    return NextResponse.json({ entry });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update entry' },
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
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await initMongoose();

    const { id } = await params;
    const entry = await IncomeEntry.findById(id);
    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const entryUserId = typeof entry.user === 'string' ? entry.user : entry.user?.toString();
    if (entryUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate date (only allow deleting last month's data)
    const entryDate = new Date(entry.date);
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    if (entryDate < lastMonth) {
      return NextResponse.json(
        { error: 'Cannot delete entries older than last month' },
        { status: 400 }
      );
    }

    await IncomeEntry.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Entry deleted successfully' });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
} 