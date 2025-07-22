import { NextRequest, NextResponse } from 'next/server';
import { initMongoose } from '@/lib/mongoose';
import IncomeEntry from '@/lib/models/IncomeEntry';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await initMongoose();

    const query: any = {};

    if (user.role === 'employee') {
      // Employee can only see their own entries
      query.user = user.id;
    } else {
      // Business can see all entries for their business
      query.business = user.businessId;
    }

    if (startDate && endDate) {
      // Set start date to beginning of day (00:00:00)
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      // Set end date to end of day (23:59:59.999)
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: start,
        $lte: end
      };
    }

    let entries;
    if (user.role === 'business') {
      entries = await IncomeEntry.find(query)
        .populate({
          path: 'user',
          select: 'name username companyName'
        })
        .sort({ date: -1 });
    } else {
      entries = await IncomeEntry.find(query)
        .sort({ date: -1 });
    }

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Get income entries error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { date, cashIncome, posIncome, expenses } = await request.json();

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    // Validate that the date is within the last month
    const entryDate = new Date(date);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    if (entryDate < oneMonthAgo || entryDate > new Date()) {
      return NextResponse.json(
        { error: 'You can only add entries for the last month' },
        { status: 400 }
      );
    }

    await initMongoose();

    // Check if entry already exists for this user and date
    const existingEntry = await IncomeEntry.findOne({
      user: user.id,
      date: {
        $gte: new Date(entryDate.setHours(0, 0, 0, 0)),
        $lt: new Date(entryDate.setHours(23, 59, 59, 999))
      }
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Entry already exists for this date' },
        { status: 409 }
      );
    }

    const entry = new IncomeEntry({
      user: user.id,
      userType: user.role === 'business' ? 'Business' : 'Employee',
      business: user.businessId,
      date: entryDate,
      cashIncome: cashIncome || 0,
      posIncome: posIncome || 0,
      expenses: expenses || 0
    });

    await entry.save();

    return NextResponse.json(
      { entry },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Create income entry error:', error);
    
    if (error && typeof error === 'object' && 'code' in error && (error as any).code === 11000) {
      return NextResponse.json(
        { error: 'Entry already exists for this date' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 