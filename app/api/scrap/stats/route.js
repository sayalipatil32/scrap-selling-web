// app/api/scrap/stats/route.js
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
    
    // Get total sales count
    const totalSales = await db.collection('scrap_sales')
      .countDocuments({ sellerId: userId });

    // Get total revenue
    const revenueResult = await db.collection('scrap_sales')
      .aggregate([
        { $match: { sellerId: userId } },
        { $group: { _id: null, total: { $sum: "$price" } } }
      ]).toArray();
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get sales by type
    const salesByType = await db.collection('scrap_sales')
      .aggregate([
        { $match: { sellerId: userId } },
        { $group: { _id: "$scrapType", count: { $sum: 1 } } }
      ]).toArray();

    return NextResponse.json({
      success: true,
      data: {
        totalSales,
        totalRevenue,
        salesByType: salesByType.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}