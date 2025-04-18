



"use client"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Moon, Sun } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from '@/components/ui/command';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import Confetti from 'react-confetti';
import { useWindowSize } from '@uidotdev/usehooks';

// Recharts
import {
    BarChart, LineChart, PieChart, AreaChart, RadarChart, ScatterChart, Treemap, Sankey,
    Bar, Line, Pie, Area, Radar, Scatter, Rectangle, Sankey as SankeyChart,
    XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, Cell,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis, ReferenceLine, Brush, SankeyLink, SankeyNode
} from 'recharts';

// Icons
import {
    Calendar as CalendarIcon,
    Download, Filter, MoreHorizontal, Plus, RefreshCw, Search, Settings,
    TrendingUp, User, FileText, Printer, Share2, Trash2, Edit, Eye,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Home, LineChart as LineChartIcon, BarChart2, PieChart as PieChartIcon,
    AlertCircle, Info, Bell, Mail, HelpCircle, Clock, Tag, DollarSign,
    Scale, Database, Layers, Box, Package, Warehouse, Truck,
    ClipboardList, CreditCard, Wallet, TrendingDown, ArrowUpDown, Hash, Percent,
    Circle, ArrowRight, ArrowLeft, Check, X, Loader2, Sparkles, Activity, Gauge, Landmark,
    AlertTriangle, Award, Clock4, Coins, Compass, CreditCard as CreditCardIcon, Gem,
    Globe, HardDrive, Layout, List, Map, Megaphone, Package2, Ruler, ShoppingBag,
    ShoppingCart, Star, Target, Ticket, Timer, Warehouse as WarehouseIcon, Zap,
    File, FileText as FileTextIcon, FileCode, Barcode, Trophy
} from 'lucide-react';
import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useMemo, useCallback } from 'react';
import ScrapForm from '@/components/ScrapForm';
import { useAutoAnimate } from '@formkit/auto-animate/react';

// Helper functions
const convertToCSV = (data) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(','));
    return [headers, ...rows].join('\n');
};

const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6384', '#36A2EB', '#9966FF', '#4BC0C0', '#FFA07A'];

export default function ScrapSalesDashboard() {
    const { isLoaded, user } = useUser();
    const { theme, setTheme } = useTheme();
    const { width, height } = useWindowSize();
    const [animationParent] = useAutoAnimate();
    const [showConfetti, setShowConfetti] = useState(false);

    // Dynamic data states
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        to: new Date(),
    });
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedRows, setSelectedRows] = useState([]);
    const [chartType, setChartType] = useState('bar');
    const [openNewSaleDialog, setOpenNewSaleDialog] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState([
        'date', 'type', 'weight', 'amount', 'actions'
    ]);
    const [priceAlerts, setPriceAlerts] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [inventoryLevels, setInventoryLevels] = useState({});
    const [isEditing, setIsEditing] = useState(null);
    
      const totalAmount = sales.reduce((sum, sale) => sum + sale.price, 0);
      const totalWeight = sales.reduce((sum, sale) => sum + sale.kilos, 0);
      const averagePerKg = totalAmount / totalWeight || 0;
      const transactionCount = sales.length;
    // Dynamic stats calculation
    const stats = useMemo(() => {
        if (sales.length === 0) return {
            topScrapType: '',
            bestSellingMonth: '',
            avgTransactionValue: 0,
            peakHour: '',
            totalAmount: 0,
            totalWeight: 0,
            transactionCount: 0
        };

        // Calculate all stats dynamically
        const typeStats = sales.reduce((acc, sale) => {
            if (!acc[sale.scrapType]) {
                acc[sale.scrapType] = { totalAmount: 0, count: 0, totalWeight: 0 };
            }
            acc[sale.scrapType].totalAmount += sale.price;
            acc[sale.scrapType].count += 1;
            acc[sale.scrapType].totalWeight += sale.kilos;
            return acc;
        }, {});

        const monthlyStats = sales.reduce((acc, sale) => {
            const date = new Date(sale.date);
            const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
            if (!acc[monthYear]) {
                acc[monthYear] = { totalAmount: 0, count: 0, month: date.toLocaleString('default', { month: 'long' }) };
            }
            acc[monthYear].totalAmount += sale.price;
            acc[monthYear].count += 1;
            return acc;
        }, {});

        const hourStats = sales.reduce((acc, sale) => {
            const date = new Date(sale.date);
            const hour = date.getHours();
            if (!acc[hour]) {
                acc[hour] = { totalAmount: 0, count: 0 };
            }
            acc[hour].totalAmount += sale.price;
            acc[hour].count += 1;
            return acc;
        }, {});

        const totalAmount = sales.reduce((sum, sale) => sum + sale.price, 0);
        const totalWeight = sales.reduce((sum, sale) => sum + sale.kilos, 0);
        const avgTransaction = totalAmount / sales.length;
        const topType = Object.entries(typeStats).sort((a, b) => b[1].totalAmount - a[1].totalAmount)[0]?.[0] || 'N/A';
        const bestMonth = Object.entries(monthlyStats).sort((a, b) => b[1].totalAmount - a[1].totalAmount)[0]?.[1]?.month || 'N/A';
        const peakHourEntry = Object.entries(hourStats).sort((a, b) => b[1].count - a[1].count)[0];
        const peakHour = peakHourEntry ? `${peakHourEntry[0]}:00 - ${parseInt(peakHourEntry[0]) + 1}:00` : 'N/A';

        return {
            topScrapType: topType,
            bestSellingMonth: bestMonth,
            avgTransactionValue: avgTransaction,
            peakHour: peakHour,
            totalAmount,
            totalWeight,
            transactionCount: sales.length
        };
    }, [sales]);

    // Dynamic chart data preparation
    const chartData = useMemo(() => {
        const typeMap = {};
        sales.forEach(sale => {
            if (!typeMap[sale.scrapType]) {
                typeMap[sale.scrapType] = {
                    name: sale.scrapType,
                    totalWeight: 0,
                    totalAmount: 0,
                    count: 0,
                    avgPricePerKg: 0
                };
            }
            typeMap[sale.scrapType].totalWeight += sale.kilos;
            typeMap[sale.scrapType].totalAmount += sale.price;
            typeMap[sale.scrapType].count += 1;
        });

        return Object.values(typeMap).map(item => ({
            ...item,
            totalWeight: parseFloat(item.totalWeight.toFixed(2)),
            totalAmount: parseFloat(item.totalAmount.toFixed(2)),
            avgPricePerKg: parseFloat((item.totalAmount / item.totalWeight).toFixed(2))
        }));
    }, [sales]);

    const monthlyTrendData = useMemo(() => {
        const monthlyData = {};
        sales.forEach(sale => {
            const date = new Date(sale.date);
            const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = {
                    month: date.toLocaleString('default', { month: 'short' }),
                    year: date.getFullYear(),
                    totalAmount: 0,
                    totalWeight: 0,
                    count: 0
                };
            }
            monthlyData[monthYear].totalAmount += sale.price;
            monthlyData[monthYear].totalWeight += sale.kilos;
            monthlyData[monthYear].count += 1;
        });

        return Object.values(monthlyData).sort((a, b) =>
            new Date(`${a.year}-${a.month}`) - new Date(`${b.year}-${b.month}`)
        );
    }, [sales]);

    const hourlyData = useMemo(() => {
        const hourlyData = Array(24).fill().map((_, i) => ({
            hour: i,
            name: `${i}:00`,
            sales: 0,
            amount: 0
        }));

        sales.forEach(sale => {
            const hour = new Date(sale.date).getHours();
            hourlyData[hour].sales += 1;
            hourlyData[hour].amount += sale.price;
        });

        return hourlyData;
    }, [sales]);

    const scatterData = useMemo(() => {
        return sales.map(sale => ({
            x: sale.kilos,
            y: sale.price,
            z: sale.kilos * 2,
            type: sale.scrapType
        }));
    }, [sales]);

    // Dynamic filtering and pagination
    const filteredSales = useMemo(() => {
        return sales
            .filter(sale =>
                sale.scrapType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.price.toString().includes(searchTerm) ||
                sale.kilos.toString().includes(searchTerm) ||
                new Date(sale.date).toLocaleString().includes(searchTerm)
            )
            .filter(sale => filterType === 'all' || sale.scrapType === filterType)
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= dateRange.from && saleDate <= dateRange.to;
            });
    }, [sales, searchTerm, filterType, dateRange]);

    const paginatedSales = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredSales.slice(start, end);
    }, [filteredSales, currentPage, rowsPerPage]);

    const pageCount = Math.ceil(filteredSales.length / rowsPerPage);

    // Dynamic price alerts
    useEffect(() => {
        if (chartData.length > 0) {
            const alerts = [];
            const avgPrices = chartData.reduce((sum, item) => sum + item.avgPricePerKg, 0) / chartData.length;

            chartData.forEach(item => {
                if (item.avgPricePerKg < avgPrices * 0.9) {
                    alerts.push({
                        type: item.name,
                        change: ((item.avgPricePerKg - avgPrices) / avgPrices * 100).toFixed(1),
                        currentPrice: item.avgPricePerKg
                    });
                }
            });

            setPriceAlerts(alerts);
        }
    }, [chartData]);

    // Dynamic achievements
    useEffect(() => {
        const newAchievements = [];
        if (stats.totalAmount > 10000) newAchievements.push('10K Club');
        if (stats.totalWeight > 5000) newAchievements.push('5 Ton Trader');
        if (sales.length > 100) newAchievements.push('Century Seller');

        if (newAchievements.length > achievements.length) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
        setAchievements(newAchievements);
    }, [stats, sales.length]);

    // Dynamic inventory levels
    useEffect(() => {
        const inventory = {};
        chartData.forEach(item => {
            const initialStock = 1000; // This would come from your API in a real app
            const sold = item.totalWeight;
            inventory[item.name] = {
                current: initialStock - sold,
                max: initialStock,
                percentage: ((initialStock - sold) / initialStock) * 100
            };
        });
        setInventoryLevels(inventory);
    }, [chartData]);

    // Fetch data
    const fetchSales = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/scrap');
            const { data, success, error: apiError } = await response.json();

            if (!success) throw new Error(apiError || 'Failed to fetch sales');
            setSales(data || []);
            toast.success('Data loaded successfully', {
                icon: <Database className="h-5 w-5" />
            });
        } catch (err) {
            setError(err.message);
            toast.error('Failed to load scrap sales', {
                description: err.message,
                icon: <AlertCircle className="h-5 w-5" />
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isLoaded && user?.id) {
            fetchSales();
        }
    }, [isLoaded, user, fetchSales]);

    // Dynamic functions
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id)
                ? prev.filter(rowId => rowId !== id)
                : [...prev, id]
        );
    };

    const handleSelectAllRows = (checked) => {
        setSelectedRows(checked ? paginatedSales.map(sale => sale._id) : []);
    };

    const handleBulkDelete = async () => {
        if (selectedRows.length === 0) {
            toast.warning('No items selected for deletion', {
                icon: <AlertTriangle className="h-5 w-5" />
            });
            return;
        }

        const deletePromise = fetch('/api/scrap', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: selectedRows }),
        }).then(res => res.json());

        toast.promise(deletePromise, {
            loading: 'Deleting selected items...',
            success: (data) => {
                if (data.success) {
                    setSales(prev => prev.filter(sale => !selectedRows.includes(sale._id)));
                    setSelectedRows([]);
                    return 'Selected items deleted successfully!';
                } else {
                    throw new Error(data.error || 'Failed to delete items');
                }
            },
            error: (err) => err.message || 'Failed to delete items'
        });
    };

    const handleExportData = async (format) => {
        try {
            const dataToExport = selectedRows.length > 0
                ? sales.filter(sale => selectedRows.includes(sale._id))
                : filteredSales;

            if (dataToExport.length === 0) {
                toast.warning('No data to export', {
                    icon: <AlertCircle className="h-5 w-5" />
                });
                return;
            }

            switch (format) {
                case 'csv':
                    const csvData = dataToExport.map(sale => ({
                        'Date': formatDate(sale.date),
                        'Type': sale.scrapType,
                        'Weight (kg)': sale.kilos.toFixed(2),
                        'Amount (₹)': sale.price.toFixed(2),
                        'Price per kg (₹)': (sale.price / sale.kilos).toFixed(2)
                    }));
                    const csv = convertToCSV(csvData);
                    downloadFile(csv, `scrap-sales-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
                    toast.success('CSV exported successfully', {
                        icon: <FileTextIcon className="h-5 w-5" />
                    });
                    break;

                case 'json':
                    const jsonData = {
                        metadata: {
                            exportedAt: new Date().toISOString(),
                            totalRecords: dataToExport.length,
                            totalAmount: dataToExport.reduce((sum, sale) => sum + sale.price, 0),
                            totalWeight: dataToExport.reduce((sum, sale) => sum + sale.kilos, 0)
                        },
                        data: dataToExport
                    };
                    downloadFile(
                        JSON.stringify(jsonData, null, 2),
                        `scrap-sales-${new Date().toISOString().slice(0, 10)}.json`,
                        'application/json'
                    );
                    toast.success('JSON exported successfully', {
                        icon: <FileCode className="h-5 w-5" />
                    });
                    break;

                case 'pdf':
                    const { jsPDF } = await import('jspdf');
                    const autoTable = (await import('jspdf-autotable')).default;
                    const doc = new jsPDF();

                    // Title and metadata
                    doc.setFontSize(18);
                    doc.text('Scrap Sales Report', 14, 20);
                    doc.setFontSize(12);
                    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
                    doc.text(`Total Records: ${dataToExport.length}`, 14, 40);
                    doc.text(`Total Amount: ₹${dataToExport.reduce((sum, sale) => sum + sale.price, 0).toFixed(2)}`, 14, 50);
                    doc.text(`Total Weight: ${dataToExport.reduce((sum, sale) => sum + sale.kilos, 0).toFixed(2)} kg`, 14, 60);

                    // Table data
                    const tableData = dataToExport.map(sale => [
                        formatDate(sale.date),
                        sale.scrapType,
                        sale.kilos.toFixed(2),
                        `₹${sale.price.toFixed(2)}`,
                        `₹${(sale.price / sale.kilos).toFixed(2)}`
                    ]);

                    autoTable(doc, {
                        head: [['Date', 'Type', 'Weight (kg)', 'Amount (₹)', 'Price/kg (₹)']],
                        body: tableData,
                        startY: 70,
                        styles: {
                            fontSize: 10,
                            cellPadding: 2,
                            valign: 'middle',
                            halign: 'center'
                        },
                        headStyles: {
                            fillColor: [64, 64, 64],
                            textColor: 255,
                            fontStyle: 'bold'
                        },
                        alternateRowStyles: {
                            fillColor: [240, 240, 240]
                        }
                    });

                    doc.save(`scrap-sales-${new Date().toISOString().slice(0, 10)}.pdf`);
                    toast.success('PDF exported successfully', {
                        icon: <File className="h-5 w-5" />
                    });
                    break;

                default:
                    toast.info('Please select an export format');
            }
        } catch (error) {
            toast.error(`Failed to export ${format.toUpperCase()}`, {
                description: error.message,
                icon: <X className="h-5 w-5" />
            });
        }
    };

    const toggleColumn = (column) => {
        setVisibleColumns(prev =>
            prev.includes(column)
                ? prev.filter(col => col !== column)
                : [...prev, column]
        );
    };

    const startEditing = (id, field, value) => {
        setIsEditing({ id, field, value });
    };

    const saveEdit = async (id, field, newValue) => {
        try {
            const response = await fetch(`/api/scrap/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ [field]: newValue }),
            });

            const { success } = await response.json();
            if (success) {
                setSales(prev => prev.map(sale =>
                    sale._id === id ? { ...sale, [field]: newValue } : sale
                ));
                toast.success('Update successful');
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            toast.error('Failed to save changes', {
                description: error.message
            });
        } finally {
            setIsEditing(null);
        }
    };

    // Dynamic column definitions
    const columns = [
        { id: 'select', header: '', accessor: 'select', width: 40 },
        { id: 'date', header: 'Date & Time', accessor: 'date', width: 180 },
        { id: 'type', header: 'Type', accessor: 'scrapType', width: 120 },
        { id: 'weight', header: 'Weight (kg)', accessor: 'kilos', width: 100, align: 'right' },
        { id: 'amount', header: 'Amount (₹)', accessor: 'price', width: 100, align: 'right' },
        { id: 'actions', header: '', accessor: 'actions', width: 60, align: 'right' }
    ];

    if (!isLoaded) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Loading user data...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Data</AlertTitle>
                    <AlertDescription>
                        <p className="mb-2">We couldn't load your scrap sales data</p>
                        <p className="text-sm">{error}</p>
                        <Button onClick={fetchSales} variant="outline" className="gap-2 mt-4">
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 mt-15 space-y-6 px-[18px]" ref={animationParent}>
            {showConfetti && <Confetti width={width} height={height} recycle={false} />}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/" className="flex items-center gap-1">
                                    <Home className="h-4 w-4" />
                                    <span>Home</span>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/scrap">Scrap</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Sales Dashboard</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="flex items-center gap-3 mt-2">
                        <h1 className="text-3xl font-bold tracking-tight">Scrap Sales Dashboard</h1>
                        <Badge variant="outline" className="px-3 py-1 text-sm">
                            <Activity className="h-4 w-4 mr-1" />
                            {stats.transactionCount} transactions
                        </Badge>
                        {achievements.length > 0 && (
                            <Tooltip>
                                <TooltipTrigger>
                                    <Badge variant="secondary" className="px-3 py-1 text-sm gap-1">
                                        <Trophy className="h-4 w-4" />
                                        {achievements.length} Achievements
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {achievements.join(', ')}
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                    <p className="text-muted-foreground">
                        Track and analyze your scrap sales performance
                    </p>
                </div>

                <div className="flex gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                >
                                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Toggle Theme</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={fetchSales}>
                                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Refresh Data</TooltipContent>
                        </Tooltip>

                        <Dialog open={openNewSaleDialog} onOpenChange={setOpenNewSaleDialog}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Sale
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Add New Scrap Sale</DialogTitle>
                                    <DialogDescription>
                                        Fill in the details of the scrap sale transaction
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <ScrapForm
                                        onSuccess={() => {
                                            setOpenNewSaleDialog(false);
                                            fetchSales();
                                        }}
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </TooltipProvider>
                </div>
            </div>

            {/* Price Alerts */}
            {priceAlerts.length > 0 && (
                <Alert variant="warning" className="border-l-4 border-yellow-500">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertTitle>Price Alerts</AlertTitle>
                    <AlertDescription>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {priceAlerts.map((alert, i) => (
                                <Badge key={i} variant="outline" className="text-yellow-600">
                                    {alert.type}: {alert.change}% (₹{alert.currentPrice.toFixed(2)}/kg)
                                </Badge>
                            ))}
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Main Content */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="transactions">
                        <FileText className="mr-2 h-4 w-4" />
                        Transactions
                    </TabsTrigger>
                    <TabsTrigger value="analytics">
                        <BarChart2 className="mr-2 h-4 w-4" />
                        Analytics
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Sales
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{totalAmount.toLocaleString('en-IN')}</div>
                                <p className="text-xs text-muted-foreground">
                                    from {transactionCount} transactions
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Weight
                                </CardTitle>
                                <Scale className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalWeight.toLocaleString('en-IN')} kg</div>
                                <p className="text-xs text-muted-foreground">
                                    average ₹{averagePerKg.toFixed(2)}/kg
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Scrap Types
                                </CardTitle>
                                <Layers className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{chartData.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    different types sold
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Recent Activity
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {sales.length > 0 ? formatDate(sales[0].date) : 'N/A'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    last transaction date
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stats Insights */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Top Scrap Type
                                </CardTitle>
                                <Award className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold capitalize">{stats.topScrapType || 'N/A'}</div>
                                <p className="text-xs text-muted-foreground">
                                    by total sales value
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Best Selling Month
                                </CardTitle>
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">{stats.bestSellingMonth || 'N/A'}</div>
                                <p className="text-xs text-muted-foreground">
                                    highest sales volume
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Avg Transaction
                                </CardTitle>
                                <Landmark className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">₹{stats.avgTransactionValue.toFixed(2) || '0.00'}</div>
                                <p className="text-xs text-muted-foreground">
                                    per sale
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Peak Sales Hour
                                </CardTitle>
                                <Timer className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">{stats.peakHour || 'N/A'}</div>
                                <p className="text-xs text-muted-foreground">
                                    most active time
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Section */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Monthly Sales Trend</CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant={chartType === 'bar' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setChartType('bar')}
                                        >
                                            <BarChart2 className="mr-2 h-4 w-4" />
                                            Bar
                                        </Button>
                                        <Button
                                            variant={chartType === 'line' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setChartType('line')}
                                        >
                                            <LineChartIcon className="mr-2 h-4 w-4" />
                                            Line
                                        </Button>
                                        <Button
                                            variant={chartType === 'area' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setChartType('area')}
                                        >
                                            <AreaChart className="mr-2 h-4 w-4" />
                                            Area
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <ResponsiveContainer width="100%" height={350}>
                                    {chartType === 'bar' ? (
                                        <BarChart data={monthlyTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis tickFormatter={(value) => `₹${value}`} />
                                            <ChartTooltip
                                                formatter={(value) => [`₹${value}`, "Total Amount"]}
                                            />
                                            <Legend />
                                            <Bar
                                                dataKey="totalAmount"
                                                name="Total Amount"
                                                fill="#8884d8"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    ) : chartType === 'line' ? (
                                        <LineChart data={monthlyTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis tickFormatter={(value) => `₹${value}`} />
                                            <ChartTooltip
                                                formatter={(value) => [`₹${value}`, "Total Amount"]}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="totalAmount"
                                                name="Total Amount"
                                                stroke="#8884d8"
                                                strokeWidth={2}
                                                activeDot={{ r: 8 }}
                                            />
                                        </LineChart>
                                    ) : (
                                        <AreaChart data={monthlyTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis tickFormatter={(value) => `₹${value}`} />
                                            <ChartTooltip
                                                formatter={(value) => [`₹${value}`, "Total Amount"]}
                                            />
                                            <Legend />
                                            <Area
                                                type="monotone"
                                                dataKey="totalAmount"
                                                name="Total Amount"
                                                stroke="#8884d8"
                                                fill="#8884d8"
                                                fillOpacity={0.2}
                                            />
                                        </AreaChart>
                                    )}
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Scrap Distribution</CardTitle>
                                <CardDescription>By weight and value</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium mb-2 ">By Weight (kg)</h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={chartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="totalWeight"
                                                    nameKey="name"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <ChartTooltip
                                                    formatter={(value, name) => [`${value} kg`, name]}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">By Value (₹)</h3>
                                        <div className="space-y-2">
                                            {chartData.map((item, index) => (
                                                <div key={index} className="space-y-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">{item.name}</span>
                                                        <span className="text-sm font-medium">
                                                            ₹{item.totalAmount.toLocaleString('en-IN')}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={(item.totalAmount / totalAmount) * 100}
                                                        className={`bg-gray-200 dark:bg-gray-800 [&>div]:bg-[${COLORS[index % COLORS.length]}]`}
                                                    />

                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Additional Charts */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Hourly Sales Distribution</CardTitle>
                                <CardDescription>Average sales by hour of day</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={hourlyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <ChartTooltip
                                            formatter={(value, name) =>
                                                name === 'sales'
                                                    ? [`${value} transactions`, 'Transactions']
                                                    : [`₹${value}`, 'Amount']}
                                        />
                                        <Legend />
                                        <Bar dataKey="sales" name="Transactions" fill="#8884d8" />
                                        <Bar dataKey="amount" name="Amount (₹)" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Weight vs Price Correlation</CardTitle>
                                <CardDescription>Relationship between weight and price</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <ScatterChart>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" dataKey="x" name="Weight (kg)" unit="kg" />
                                        <YAxis type="number" dataKey="y" name="Price" unit="₹" />
                                        <ChartTooltip
                                            cursor={{ strokeDasharray: '3 3' }}
                                            formatter={(value, name, props) => {
                                                if (name === 'x') return [`${value} kg`, 'Weight'];
                                                if (name === 'y') return [`₹${value}`, 'Price'];
                                                return [value, name];
                                            }}
                                        />
                                        <Legend />
                                        <Scatter name="Scrap Sales" data={scatterData} fill="#8884d8">
                                            {scatterData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Transactions Tab */}
                <TabsContent value="transactions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <CardTitle>Transaction History</CardTitle>
                                    <CardDescription>
                                        All your scrap sales transactions in one place
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="gap-1">
                                                <Download className="h-4 w-4" />
                                                Export
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleExportData('csv')}>
                                                <FileTextIcon className="mr-2 h-4 w-4" />
                                                CSV
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleExportData('json')}>
                                                <FileCode className="mr-2 h-4 w-4" />
                                                JSON
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleExportData('pdf')}>
                                                <File className="mr-2 h-4 w-4" />
                                                PDF
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleBulkDelete}
                                        className="gap-1"
                                        disabled={selectedRows.length === 0}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete ({selectedRows.length})
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                                <div className="relative w-full md:max-w-md">
                                    <Input
                                        placeholder="Filter transactions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
                                    <Select
                                        value={filterType}
                                        onValueChange={setFilterType}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Filter by type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            {chartData.map((type) => (
                                                <SelectItem key={type.name} value={type.name}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-[280px] justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dateRange.from?.toLocaleDateString()} - {dateRange.to?.toLocaleDateString()}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="range"
                                                selected={dateRange}
                                                onSelect={setDateRange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : filteredSales.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                                    <Package className="h-12 w-12 text-muted-foreground" />
                                    <h3 className="text-lg font-medium">No scrap sales records found</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Try adjusting your filters or add a new sale
                                    </p>
                                    <Button className="mt-4" onClick={() => {
                                        setSearchTerm('');
                                        setFilterType('all');
                                        setDateRange({
                                            from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
                                            to: new Date(),
                                        });
                                    }}>
                                        Reset Filters
                                    </Button>
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[40px]">
                                                    <Checkbox
                                                        checked={
                                                            selectedRows.length > 0 &&
                                                            selectedRows.length === paginatedSales.length
                                                        }
                                                        onCheckedChange={handleSelectAllRows}
                                                    />
                                                </TableHead>
                                                <TableHead>Date & Time</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead className="text-right">Weight (kg)</TableHead>
                                                <TableHead className="text-right">Amount (₹)</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedSales.map((sale) => (
                                                <TableRow key={sale._id}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedRows.includes(sale._id)}
                                                            onCheckedChange={() => handleSelectRow(sale._id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        <HoverCard>
                                                            <HoverCardTrigger>
                                                                <span className="underline decoration-dotted cursor-help">
                                                                    {formatDate(sale.date)}
                                                                </span>
                                                            </HoverCardTrigger>
                                                            <HoverCardContent className="w-auto">
                                                                <div className="space-y-1">
                                                                    <h4 className="text-sm font-semibold">Transaction Details</h4>
                                                                    <p className="text-sm">
                                                                        <span className="font-medium">ID:</span> {sale._id}
                                                                    </p>
                                                                    <p className="text-sm">
                                                                        <span className="font-medium">Added:</span> {new Date(sale.createdAt).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </HoverCardContent>
                                                        </HoverCard>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {sale.scrapType}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {sale.kilos.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        ₹{sale.price.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-red-600">
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="text-sm text-muted-foreground">
                                Showing <strong>{(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredSales.length)}</strong> of <strong>{filteredSales.length}</strong> transactions
                            </div>

                            <div className="flex items-center space-x-2">
                                <Select
                                    value={`${rowsPerPage}`}
                                    onValueChange={(value) => {
                                        setRowsPerPage(Number(value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-[70px]">
                                        <SelectValue placeholder={rowsPerPage} />
                                    </SelectTrigger>
                                    <SelectContent side="top">
                                        {[10, 20, 30, 40, 50].map((pageSize) => (
                                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                                {pageSize}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="text-sm">
                                    Page {currentPage} of {pageCount}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                                    disabled={currentPage === pageCount || pageCount === 0}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(pageCount)}
                                    disabled={currentPage === pageCount || pageCount === 0}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Price Analysis</CardTitle>
                                <CardDescription>Average price per kg by type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="name" />
                                        <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 10']} />
                                        <Radar
                                            name="Price/kg"
                                            dataKey="avgPricePerKg"
                                            stroke="#8884d8"
                                            fill="#8884d8"
                                            fillOpacity={0.6}
                                        />
                                        <ChartTooltip
                                            formatter={(value) => [`₹${value.toFixed(2)}`, "Price per kg"]}
                                        />
                                        <Legend />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Sales Composition</CardTitle>
                                <CardDescription>By type and quantity</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <ChartTooltip
                                            formatter={(value, name) =>
                                                name === 'totalAmount'
                                                    ? [`₹${value}`, 'Total Amount']
                                                    : [`${value} kg`, 'Total Weight']}
                                        />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="totalAmount"
                                            name="Total Amount (₹)"
                                            stroke="#8884d8"
                                            fill="#8884d8"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="totalWeight"
                                            name="Total Weight (kg)"
                                            stroke="#82ca9d"
                                            fill="#82ca9d"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction Volume</CardTitle>
                                <CardDescription>Number of transactions by type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        layout="vertical"
                                        data={chartData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" />
                                        <ChartTooltip />
                                        <Legend />
                                        <Bar dataKey="count" name="Transactions" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Price vs Weight</CardTitle>
                                <CardDescription>Relationship between price and weight</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <ScatterChart
                                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            type="number"
                                            dataKey="avgPricePerKg"
                                            name="Price/kg"
                                            label={{
                                                value: 'Price per kg (₹)',
                                                position: 'bottom',
                                                offset: 0,
                                                dx: 120,
                                                dy: 8
                                            }}
                                        />

                                        <YAxis
                                            type="number"
                                            dataKey="totalWeight"
                                            name="Weight"
                                            label={{ value: 'Total Weight (kg)', angle: -90, position: 'left' }}
                                        />
                                        <ChartTooltip
                                            cursor={{ strokeDasharray: '3 3' }}
                                            formatter={(value, name) =>
                                                name === 'avgPricePerKg'
                                                    ? [`₹${value}`, 'Price per kg']
                                                    : [`${value} kg`, 'Total Weight']}
                                        />
                                        <Legend className='mt-10' />
                                        <Scatter name='Scrap Types ' data={chartData} fill="#8884d8">
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                            <CardDescription>Key indicators and statistics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-2">
                                    <Label>Highest Value Type</Label>
                                    <div className="flex items-center gap-2">
                                        <div className="text-xl font-semibold capitalize">
                                            {chartData.length > 0
                                                ? chartData.reduce((prev, current) =>
                                                    prev.totalAmount > current.totalAmount ? prev : current
                                                ).name
                                                : 'N/A'}
                                        </div>
                                        <Badge variant="outline" className="gap-1">
                                            <DollarSign className="h-3 w-3" />
                                            {chartData.length > 0
                                                ? `₹${chartData.reduce((prev, current) =>
                                                    prev.totalAmount > current.totalAmount ? prev : current
                                                ).totalAmount.toLocaleString('en-IN')}`
                                                : 'N/A'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Best Price/kg</Label>
                                    <div className="flex items-center gap-2">
                                        <div className="text-xl font-semibold capitalize">
                                            {chartData.length > 0
                                                ? chartData.reduce((prev, current) =>
                                                    prev.avgPricePerKg > current.avgPricePerKg ? prev : current
                                                ).name
                                                : 'N/A'}
                                        </div>
                                        <Badge variant="outline" className="gap-1">
                                            <Percent className="h-3 w-3" />
                                            {chartData.length > 0
                                                ? `₹${Math.max(...chartData.map(item => item.avgPricePerKg)).toFixed(2)}`
                                                : 'N/A'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Most Frequent Type</Label>
                                    <div className="flex items-center gap-2">
                                        <div className="text-xl font-semibold capitalize">
                                            {chartData.length > 0
                                                ? chartData.reduce((prev, current) =>
                                                    prev.count > current.count ? prev : current
                                                ).name
                                                : 'N/A'}
                                        </div>
                                        <Badge variant="outline" className="gap-1">
                                            <Hash className="h-3 w-3" />
                                            {chartData.length > 0
                                                ? chartData.reduce((prev, current) =>
                                                    prev.count > current.count ? prev : current
                                                ).count
                                                : 'N/A'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Heaviest Type</Label>
                                    <div className="flex items-center gap-2">
                                        <div className="text-xl font-semibold capitalize">
                                            {chartData.length > 0
                                                ? chartData.reduce((prev, current) =>
                                                    prev.totalWeight > current.totalWeight ? prev : current
                                                ).name
                                                : 'N/A'}
                                        </div>
                                        <Badge variant="outline" className="gap-1">
                                            <Scale className="h-3 w-3" />
                                            {chartData.length > 0
                                                ? `${chartData.reduce((prev, current) =>
                                                    prev.totalWeight > current.totalWeight ? prev : current
                                                ).totalWeight.toLocaleString('en-IN')} kg`
                                                : 'N/A'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Advanced Analytics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Advanced Analytics</CardTitle>
                            <CardDescription>Detailed performance breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="types">
                                <TabsList>
                                    <TabsTrigger value="types">
                                        <Package className="mr-2 h-4 w-4" />
                                        By Type
                                    </TabsTrigger>
                                    <TabsTrigger value="time">
                                        <Clock className="mr-2 h-4 w-4" />
                                        Time Analysis
                                    </TabsTrigger>
                                    <TabsTrigger value="trends">
                                        <TrendingUp className="mr-2 h-4 w-4" />
                                        Trends
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="types" className="pt-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Type Performance</CardTitle>
                                                <CardDescription>Revenue contribution by type</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <Treemap
                                                        width={400}
                                                        height={200}
                                                        data={chartData}
                                                        dataKey="totalAmount"
                                                        aspectRatio={4 / 3}
                                                        stroke="#fff"
                                                        fill="#8884d8"
                                                    >
                                                        <ChartTooltip
                                                            formatter={(value, name) => [`₹${value}`, name]}
                                                        />
                                                    </Treemap>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Type Efficiency</CardTitle>
                                                <CardDescription>Price per kg vs volume</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <ScatterChart
                                                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis
                                                            type="number"
                                                            dataKey="avgPricePerKg"
                                                            name="Price/kg"
                                                            label={{ value: 'Price per kg (₹)', position: 'bottom', dx: 100, dy: 2 }}
                                                        />
                                                        <YAxis
                                                            type="number"
                                                            dataKey="totalWeight"
                                                            name="Weight"
                                                            label={{ value: 'Total Weight (kg)', angle: -90, position: 'left' }}
                                                        />
                                                        <ChartTooltip
                                                            cursor={{ strokeDasharray: '3 3' }}
                                                            formatter={(value, name) =>
                                                                name === 'avgPricePerKg'
                                                                    ? [`₹${value}`, 'Price per kg']
                                                                    : [`${value} kg`, 'Total Weight']}
                                                        />
                                                        <Legend />
                                                        <Scatter name="Scrap Types" data={chartData} fill="#8884d8">
                                                            {chartData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Scatter>
                                                    </ScatterChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                                <TabsContent value="time" className="pt-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Daily Sales Pattern</CardTitle>
                                                <CardDescription>Sales by hour of day</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <LineChart data={hourlyData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <ChartTooltip
                                                            formatter={(value) => [`₹${value}`, 'Amount']}
                                                        />
                                                        <Legend />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="amount"
                                                            name="Amount (₹)"
                                                            stroke="#8884d8"
                                                            strokeWidth={2}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Transaction Frequency</CardTitle>
                                                <CardDescription>Transactions by hour of day</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <BarChart data={hourlyData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <ChartTooltip
                                                            formatter={(value) => [`${value}`, 'Transactions']}
                                                        />
                                                        <Legend />
                                                        <Bar
                                                            dataKey="sales"
                                                            name="Transactions"
                                                            fill="#8884d8"
                                                            radius={[4, 4, 0, 0]}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                                <TabsContent value="trends" className="pt-4">
                                    <div className="grid gap-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Monthly Trends</CardTitle>
                                                <CardDescription>Sales growth over time</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <ResponsiveContainer width="100%" height={400}>
                                                    <AreaChart data={monthlyTrendData}>
                                                        <defs>
                                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="month" />
                                                        <YAxis />
                                                        <ChartTooltip
                                                            formatter={(value) => [`₹${value}`, 'Amount']}
                                                        />
                                                        <Legend />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="totalAmount"
                                                            name="Amount (₹)"
                                                            stroke="#8884d8"
                                                            fillOpacity={1}
                                                            fill="url(#colorAmount)"
                                                        />
                                                        <Brush dataKey="month" height={30} stroke="#8884d8" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}



