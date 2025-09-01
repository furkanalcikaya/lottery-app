import { NextRequest, NextResponse } from 'next/server';
import { initMongoose } from '@/lib/mongoose';
import Store from '@/lib/models/Store';
import IncomeEntry from '@/lib/models/IncomeEntry';
import { ExpenseEntry } from '@/lib/models/ExpenseEntry';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request);
    
    if (!user || user.role !== 'business') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initMongoose();
    const { id } = await params;
    const store = await Store.findOne({ _id: id, business: user.businessId });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json({ store });
  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request);
    
    if (!user || user.role !== 'business') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Store name is required' }, { status: 400 });
    }

    await initMongoose();
    const { id } = await params;

    // Check if store belongs to the authenticated business
    const store = await Store.findOne({ _id: id, business: user.businessId });
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Check if new name conflicts with existing stores (excluding current store)
    const existingStore = await Store.findOne({ 
      business: user.businessId, 
      name, 
      _id: { $ne: id } 
    });
    if (existingStore) {
      return NextResponse.json({ error: 'Store name already exists' }, { status: 400 });
    }

    store.name = name;
    await store.save();

    return NextResponse.json({ store });
  } catch (error) {
    console.error('Error updating store:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request);
    
    if (!user || user.role !== 'business') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await initMongoose();

    // Check if store belongs to the authenticated business
    const store = await Store.findOne({ _id: id, business: user.businessId });
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Check if store has associated income entries or expenses
    const [incomeCount, expenseCount] = await Promise.all([
      IncomeEntry.countDocuments({ store: id }),
      ExpenseEntry.countDocuments({ store: id })
    ]);

    if (incomeCount > 0 || expenseCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete store with associated income entries or expenses' 
      }, { status: 400 });
    }

    // Delete the store
    await Store.deleteOne({ _id: id });

    return NextResponse.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Error deleting store:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
