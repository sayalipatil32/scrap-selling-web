'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';

const CounterCard = ({ end, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const speed = 50; // smaller = faster
    const increment = Math.ceil(end / 100);
    const interval = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(interval);
      }
      setCount(start);
    }, speed);
    return () => clearInterval(interval);
  }, [end]);

  return (
    <Card className="w-full text-center shadow-lg">
      <CardContent className="py-6">
        <h1 className="text-4xl font-bold text-green-600">{count}+</h1>
        <p className="text-sm mt-2 text-gray-600">{label}</p>
      </CardContent>
    </Card>
  );
};

export default function CounterSection() {
  return (
    <div className="mt-10 px-4 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
        <CounterCard end={50} label="Industries Served" />
        <CounterCard end={120} label="Tie Up Residential Apartments" />
        <CounterCard end={500} label="Happy Customers" />
        <CounterCard end={80} label="Metric Tonnes Of Material Recycled" />
      </div>
    </div>
  );
}
