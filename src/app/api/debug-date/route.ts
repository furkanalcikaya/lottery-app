import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const dateParam = url.searchParams.get('date');
  
  const serverNow = new Date();
  
  let parsedDate = null;
  let isValid = false;
  
  if (dateParam) {
    const [year, month, day] = dateParam.split('-').map(Number);
    parsedDate = new Date(year, month - 1, day);
    
    const serverToday = new Date(serverNow.getFullYear(), serverNow.getMonth(), serverNow.getDate());
    const allowedEndDate = new Date(serverToday);
    allowedEndDate.setDate(allowedEndDate.getDate() + 1); // Allow tomorrow too
    const fifteenDaysAgo = new Date(serverToday);
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    
    isValid = parsedDate >= fifteenDaysAgo && parsedDate <= allowedEndDate;
  }
  
  return NextResponse.json({
    serverInfo: {
      currentTime: serverNow.toISOString(),
      currentTimeLocal: serverNow.toString(),
      timezoneOffset: serverNow.getTimezoneOffset(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    dateParam: dateParam,
    parsedDate: parsedDate ? {
      iso: parsedDate.toISOString(),
      local: parsedDate.toString(),
      isValid: isValid
    } : null,
    validation: dateParam ? {
      serverToday: new Date(serverNow.getFullYear(), serverNow.getMonth(), serverNow.getDate()).toISOString(),
      allowedEndDate: (() => {
        const d = new Date(serverNow.getFullYear(), serverNow.getMonth(), serverNow.getDate());
        d.setDate(d.getDate() + 1);
        return d.toISOString();
      })(),
      fifteenDaysAgo: (() => {
        const d = new Date(serverNow.getFullYear(), serverNow.getMonth(), serverNow.getDate());
        d.setDate(d.getDate() - 15);
        return d.toISOString();
      })(),
      isValid: isValid
    } : null
  });
}
