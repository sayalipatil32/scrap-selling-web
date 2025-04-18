// app/api/scrap/route.js
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req) {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('newScrap');
    
    const data = await db.collection('scrap_sales')
      .find({ sellerId: userId })
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: data.map(item => ({
        ...item,
        _id: item._id.toString(),
        date: item.date
      }))
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch scrap sales',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db('newScrap');
    
    const result = await db.collection('scrap_sales').insertOne({
      scrapType: body.scrapType,
      kilos: parseFloat(body.kilos),
      price: parseFloat(body.price),
      sellerId: userId,
      date: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      insertedId: result.insertedId.toString()
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create scrap sale'
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
