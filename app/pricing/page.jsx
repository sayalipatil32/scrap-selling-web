


'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    AreaChart,
    Area,
    LineChart,
    Line,
    ScatterChart,
    Scatter,
    CartesianGrid
} from 'recharts';
import { toast } from 'sonner';
import { format } from 'date-fns';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function PricingSection() {
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('none');
    const [scrapData, setScrapData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('all');
    const [chartType, setChartType] = useState('bar');
    const [pricePerKgData, setPricePerKgData] = useState([]);

    // Fetch scrap data
    useEffect(() => {
        const fetchScrapData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('/api/scrap');
                const { data } = await response.json();

                if (!response.ok) throw new Error('Failed to fetch scrap data');

                setScrapData(data);
                processPriceData(data);
            } catch (err) {
                setError(err.message);
                toast.error('Failed to load scrap data', {
                    description: err.message
                });
            } finally {
                setLoading(false);
            }
        };

        fetchScrapData();
    }, []);

    // Process scrap data to calculate average price per kg
    const processPriceData = (data) => {
        const priceMap = {};

        data.forEach(item => {
            if (!priceMap[item.scrapType]) {
                priceMap[item.scrapType] = {
                    totalPrice: 0,
                    totalWeight: 0,
                    count: 0,
                    transactions: []
                };
            }
            priceMap[item.scrapType].totalPrice += item.price;
            priceMap[item.scrapType].totalWeight += item.kilos;
            priceMap[item.scrapType].count += 1;
            priceMap[item.scrapType].transactions.push({
                date: item.date,
                price: item.price,
                kilos: item.kilos
            });
        });

        const processedData = Object.keys(priceMap).map(scrapType => {
            const avgPricePerKg = priceMap[scrapType].totalPrice / priceMap[scrapType].totalWeight;
            return {
                scrapType,
                avgPricePerKg: parseFloat(avgPricePerKg.toFixed(2)),
                totalTransactions: priceMap[scrapType].count,
                totalWeight: parseFloat(priceMap[scrapType].totalWeight.toFixed(2)),
                totalValue: parseFloat(priceMap[scrapType].totalPrice.toFixed(2)),
                transactions: priceMap[scrapType].transactions
            };
        });

        setPricePerKgData(processedData);
    };

    // Filter and sort data
    const filteredData = pricePerKgData
        .filter(item =>
            item.scrapType.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sortOrder === 'asc') return a.avgPricePerKg - b.avgPricePerKg;
            if (sortOrder === 'desc') return b.avgPricePerKg - a.avgPricePerKg;
            return 0;
        });

    // Prepare chart data based on time range
    const getChartData = () => {
        if (timeRange === 'all') return filteredData;

        const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return filteredData.map(item => {
            const recentTransactions = item.transactions.filter(
                t => new Date(t.date) > cutoffDate
            );

            if (recentTransactions.length === 0) return null;

            const recentTotalPrice = recentTransactions.reduce((sum, t) => sum + t.price, 0);
            const recentTotalWeight = recentTransactions.reduce((sum, t) => sum + t.kilos, 0);
            const recentAvgPricePerKg = recentTotalPrice / recentTotalWeight;

            return {
                ...item,
                avgPricePerKg: parseFloat(recentAvgPricePerKg.toFixed(2)),
                totalTransactions: recentTransactions.length,
                totalWeight: parseFloat(recentTotalWeight.toFixed(2)),
                totalValue: parseFloat(recentTotalPrice.toFixed(2))
            };
        }).filter(Boolean);
    };

    const chartData = getChartData();

    if (loading) {
        return (
            <section id="pricing" className="mt-20 px-4 md:px-10 mb-20">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/2 mx-auto" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-80" />
                        <Skeleton className="h-80" />
                    </div>
                    <Skeleton className="h-96" />
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="pricing" className="mt-20 px-4 md:px-10 mb-20">
                <div className="text-center py-10">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Data</h2>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </section>
        );
    }

    return (
        <section id="pricing" className="mt-20 px-4 md:px-10 mb-20">
            <h2 className="text-4xl font-extrabold text-center mb-10">Scrap Pricing Analytics</h2>
            <p className="text-center text-muted-foreground mb-8">
                Average price per kg by scrap type based on historical transactions
            </p>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <div className="w-full md:w-1/3">
                    <Input
                        placeholder="Search by scrap type..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-4 w-full md:w-2/3">
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sort by price" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Default Order</SelectItem>
                            <SelectItem value="asc">Price: Low to High</SelectItem>
                            <SelectItem value="desc">Price: High to Low</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Time Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="week">Last 7 Days</SelectItem>
                            <SelectItem value="month">Last 30 Days</SelectItem>
                            <SelectItem value="quarter">Last 90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={chartType} onValueChange={setChartType}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chart Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bar">Bar Chart</SelectItem>
                            <SelectItem value="pie">Pie Chart</SelectItem>
                            <SelectItem value="line">Line Chart</SelectItem>
                            <SelectItem value="area">Area Chart</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Data Table */}
            <Card className="mb-10">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Scrap Type</TableHead>
                            <TableHead className="text-right">Avg Price/Kg</TableHead>
                            <TableHead className="text-right">Total Weight (kg)</TableHead>
                            <TableHead className="text-right">Total Value</TableHead>
                            <TableHead className="text-right">Transactions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <TableRow key={item.scrapType}>
                                    <TableCell className="font-medium capitalize">{item.scrapType}</TableCell>
                                    <TableCell className="text-right">₹{item.avgPricePerKg.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">{item.totalWeight.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">₹{item.totalValue.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{item.totalTransactions}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">
                                    No scrap types found matching your search
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-8">
                {/* Main Chart */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">
                                {timeRange === 'all' ? 'All Time' :
                                    timeRange === 'week' ? 'Last 7 Days' :
                                        timeRange === 'month' ? 'Last 30 Days' : 'Last 90 Days'} Price Analysis
                            </h3>
                            <div className="text-sm text-muted-foreground">
                                {chartData.length} scrap types shown
                            </div>
                        </div>
                        <div className="h-96">
                            {chartType === 'bar' ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="scrapType" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) => [`₹${value}`, 'Price per kg']}
                                            labelFormatter={(value) => `Type: ${value}`}
                                        />
                                        <Legend />
                                        <Bar dataKey="avgPricePerKg" name="Price per kg (₹)" fill="#3B82F6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : chartType === 'pie' ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            dataKey="avgPricePerKg"
                                            nameKey="scrapType"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={120}
                                            label={({ name, percent }) => `${name}: ₹${(percent * 100).toFixed(0)}%`}
                                        >
                                            {chartData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`₹${value}`, 'Price per kg']}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : chartType === 'line' ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="scrapType" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) => [`₹${value}`, 'Price per kg']}
                                            labelFormatter={(value) => `Type: ${value}`}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="avgPricePerKg"
                                            name="Price per kg (₹)"
                                            stroke="#3B82F6"
                                            strokeWidth={2}
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="scrapType" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) => [`₹${value}`, 'Price per kg']}
                                            labelFormatter={(value) => `Type: ${value}`}
                                        />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="avgPricePerKg"
                                            name="Price per kg (₹)"
                                            stroke="#3B82F6"
                                            fillOpacity={1}
                                            fill="url(#colorPrice)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Price vs Volume */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-xl font-semibold mb-4">Price vs Transaction Volume</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart
                                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            type="number"
                                            dataKey="avgPricePerKg"
                                            name="Price/kg"
                                            label={{ value: 'Price per kg (₹)', position: 'bottom', dx:120 }}
                                        />
                                        <YAxis
                                            type="number"
                                            dataKey="totalTransactions"
                                            name="Transactions"
                                            label={{ value: 'Transaction Count', angle: -90, position: 'left' }}
                                        />
                                        <Tooltip
                                            cursor={{ strokeDasharray: '3 3' }}
                                            formatter={(value, name) =>
                                                name === 'avgPricePerKg'
                                                    ? [`₹${value}`, 'Price per kg']
                                                    : [`${value}`, 'Transactions']}
                                        />
                                        <Legend />
                                        <Scatter name="Scrap Types" data={chartData} fill="#3B82F6">
                                            {chartData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Value Distribution */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-xl font-semibold mb-4">Total Value Distribution</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            dataKey="totalValue"
                                            nameKey="scrapType"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {chartData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`₹${value}`, 'Total Value']}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}