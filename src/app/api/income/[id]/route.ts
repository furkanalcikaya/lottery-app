import { NextRequest, NextResponse } from 'next/server';
import { initMongoose } from '@/lib/mongoose';
import IncomeEntry from '@/lib/models/IncomeEntry';
import { getAuthUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { cashIncome, posIncome, expenses } = await request.json();

    await initMongoose();

    const entry = await IncomeEntry.findById(params.id);
    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Check if user can edit this entry
    if (entry.user.toString() !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate that the entry date is within the last month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    if (entry.date < oneMonthAgo) {
      return NextResponse.json(
        { error: 'You can only edit entries from the last month' },
        { status: 400 }
      );
    }

    entry.cashIncome = cashIncome !== undefined ? cashIncome : entry.cashIncome;
    entry.posIncome = posIncome !== undefined ? posIncome : entry.posIncome;
    entry.expenses = expenses !== undefined ? expenses : entry.expenses;

    await entry.save();

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Update income entry error:', error);
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
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await initMongoose();

    const entry = await IncomeEntry.findById(params.id);
    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Check if user can delete this entry
    if (entry.user.toString() !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate that the entry date is within the last month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    if (entry.date < oneMonthAgo) {
      return NextResponse.json(
        { error: 'You can only delete entries from the last month' },
        { status: 400 }
      );
    }

    await IncomeEntry.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Delete income entry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 