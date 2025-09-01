import { NextRequest, NextResponse } from 'next/server';
import { initMongoose } from '@/lib/mongoose';
import Store from '@/lib/models/Store';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initMongoose();
    const stores = await Store.find({ business: user.businessId }).sort({ createdAt: -1 });
    
    return NextResponse.json({ stores });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user || user.role !== 'business') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Mağaza adı gereklidir' }, { status: 400 });
    }

    await initMongoose();

    // Check if store name already exists for this business
    const existingStore = await Store.findOne({ business: user.businessId, name });
    if (existingStore) {
      return NextResponse.json({ error: 'Mağaza adı zaten mevcut' }, { status: 400 });
    }

    const store = new Store({
      name,
      business: user.businessId
    });

    await store.save();

    return NextResponse.json({ store }, { status: 201 });
  } catch (error) {
    console.error('Mağaza oluşturma hatası:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
