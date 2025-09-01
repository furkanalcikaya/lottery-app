import { NextRequest, NextResponse } from 'next/server';
import { initMongoose } from '@/lib/mongoose';
import IncomeEntry from '@/lib/models/IncomeEntry';
import Store from '@/lib/models/Store';
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
    const storeId = searchParams.get('store');

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

    // Add store filter if provided
    if (storeId) {
      query.store = storeId;
    }

    let entries;
    if (user.role === 'business') {
      entries = await IncomeEntry.find(query)
        .populate({
          path: 'user',
          select: 'name username companyName'
        })
        .populate({
          path: 'store',
          select: 'name address'
        })
        .sort({ date: -1 });
    } else {
      entries = await IncomeEntry.find(query)
        .populate({
          path: 'store',
          select: 'name address'
        })
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

    const { 
      date, 
      cashIncome, 
      posIncome, 
      lotteryTicketIncome, 
      lotteryScratchIncome, 
      lotteryNumericalIncome,
      store 
    } = await request.json();

    if (!date || !store) {
      return NextResponse.json(
        { error: 'Date and store are required' },
        { status: 400 }
      );
    }

    // Validate that the date is within the last 15 days
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
    console.log('=== DETAILED DATE VALIDATION DEBUG ===');
    console.log('1. Original date string:', date);
    console.log('2. Parsed components:', { year, month, day });
    console.log('3. Entry date (UTC):', entryDateUTC.toISOString());
    console.log('4. Entry date (Local):', entryDateUTC.toString());
    console.log('5. Fifteen days ago (UTC):', fifteenDaysAgoUTC.toISOString());
    console.log('6. Today end (UTC):', todayUTC.toISOString());
    console.log('7. Server timezone offset (minutes):', new Date().getTimezoneOffset());
    console.log('8. Current server time (UTC):', new Date().toISOString());
    console.log('9. Current server time (Local):', new Date().toString());
    console.log('10. Entry >= FifteenDaysAgo?', entryDateUTC >= fifteenDaysAgoUTC);
    console.log('11. Entry <= Today?', entryDateUTC <= todayUTC);
    console.log('12. Overall valid?', entryDateUTC >= fifteenDaysAgoUTC && entryDateUTC <= todayUTC);
    
    // More permissive approach - allow today + tomorrow + last 15 days
    const serverNow = new Date();
    const serverToday = new Date(serverNow.getFullYear(), serverNow.getMonth(), serverNow.getDate());
    
    // Allow entries for tomorrow too (to handle timezone differences)
    const allowedEndDate = new Date(serverToday);
    allowedEndDate.setDate(allowedEndDate.getDate() + 1);
    
    const fifteenDaysAgoLocal = new Date(serverToday);
    fifteenDaysAgoLocal.setDate(fifteenDaysAgoLocal.getDate() - 15);
    
    console.log('=== PERMISSIVE DATE VALIDATION ===');
    console.log('Server today:', serverToday.toISOString());
    console.log('Allowed end date (tomorrow):', allowedEndDate.toISOString());
    console.log('Fifteen days ago:', fifteenDaysAgoLocal.toISOString());
    console.log('Entry date for comparison:', new Date(year, month - 1, day).toISOString());
    
    const entryDateLocal = new Date(year, month - 1, day);
    const localValid = entryDateLocal >= fifteenDaysAgoLocal && entryDateLocal <= allowedEndDate;
    console.log('PERMISSIVE validation result:', localValid);

    // Use the more permissive check for now
    if (!localValid) {
      console.log('Date validation failed - rejecting entry');
      console.log('Entry date:', entryDateLocal.toISOString());
      console.log('Must be between:', fifteenDaysAgoLocal.toISOString(), 'and', allowedEndDate.toISOString());
      return NextResponse.json(
        { error: 'Sadece son 15 gün için gelir-gider ekleyebilirsiniz' },
        { status: 400 }
      );
    }
    
    console.log('Date validation passed - allowing entry');

    await initMongoose();

    // Remove the unique constraint check since we now allow multiple entries per day
    // const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    // const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
    
    // const existingEntry = await IncomeEntry.findOne({
    //   user: user.id,
    //   date: {
    //     $gte: startOfDay,
    //     $lt: endOfDay
    //   }
    // });

    // if (existingEntry) {
    //   return NextResponse.json(
    //     { error: 'Entry already exists for this date' },
    //     { status: 409 }
    //   );
    // }

    const entry = new IncomeEntry({
      user: user.id,
      userType: user.role === 'business' ? 'Business' : 'Employee',
      business: user.businessId,
      store: store,
      date: entryDateLocal,
      cashIncome: cashIncome || 0,
      posIncome: posIncome || 0,
      lotteryTicketIncome: lotteryTicketIncome || 0,
      lotteryScratchIncome: lotteryScratchIncome || 0,
      lotteryNumericalIncome: lotteryNumericalIncome || 0
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