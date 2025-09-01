import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { message: 'Başarıyla çıkış yapıldı' },
    {
      status: 200,
      headers: {
        'Set-Cookie': 'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
      }
    }
  );
} 