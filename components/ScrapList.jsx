'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function ScrapList() {
  const { isSignedIn } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchTransactions = async () => {
      try {
        const res = await fetch('/api/transactions');
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [isSignedIn]);

  if (!isSignedIn) return null;

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Weight (kg)</TableHead>
          <TableHead className="text-right">Amount (₹)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((txn) => (
          <TableRow key={txn._id}>
            <TableCell>
              {new Date(txn.date).toLocaleDateString()}
            </TableCell>
            <TableCell className="capitalize">
              {txn.category?.name || 'Unknown'}
            </TableCell>
            <TableCell className="text-right">
              {txn.kilos.toFixed(2)}
            </TableCell>
            <TableCell className="text-right">
              ₹{txn.amount.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}