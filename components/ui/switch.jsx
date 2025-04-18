'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

// ShadCN UI Components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption
} from '@/components/ui/table';
import {
  Tabs, TabsList, TabsTrigger, TabsContent
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip, TooltipTrigger, TooltipContent
} from '@/components/ui/tooltip';

// Recharts
import {
  BarChart, LineChart, PieChart, Bar, Line, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

// Icons from lucide-react
import {
  Calendar as CalendarIcon,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings,
  TrendingUp,
  User,
  FileText,
  Printer,
  Share2,
  Trash2,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import ScrapForm from '@/components/ScrapForm';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6384', '#36A2EB'];

export default function ScrapSalesDashboard() {
  const { isLoaded, user } = useUser();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [filterType, setFilterType] = useState('all');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [darkMode, setDarkMode] = useState(false);
  const [newSaleForm, setNewSaleForm] = useState({
    scrapType: '',
    kilos: '',
    price: '',
    date: new Date(),
    notes: ''
  });

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch data
  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchSales();
    }
  }, [isLoaded, user]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/scrap');
      const { data, success, error: apiError } = await response.json();

      if (!success) {
        throw new Error(apiError || 'Failed to fetch sales');
      }

      setSales(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      toast.error('Failed to load scrap sales', {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Data processing functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const prepareChartData = () => {
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
  };

  const prepareMonthlyTrendData = () => {
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
  };

  // Derived data
  const chartData = prepareChartData();
  const monthlyTrendData = prepareMonthlyTrendData();
  const totalAmount = sales.reduce((sum, sale) => sum + sale.price, 0);
  const totalWeight = sales.reduce((sum, sale) => sum + sale.kilos, 0);
  const averagePerKg = totalAmount / totalWeight || 0;

  // Filtering and pagination
  const filteredSales = sales
    .filter(sale =>
      sale.scrapType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.price.toString().includes(searchTerm) ||
      sale.kilos.toString().includes(searchTerm)
    )
    .filter(sale => filterType === 'all' || sale.scrapType === filterType)
    .filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= dateRange.from && saleDate <= dateRange.to;
    });

  const pageCount = Math.ceil(filteredSales.length / rowsPerPage);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Helper functions
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

  const handleBulkDelete = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          setSales(prev => prev.filter(sale => !selectedRows.includes(sale._id)));
          setSelectedRows([]);
          resolve();
        }, 1000);
      }),
      {
        loading: 'Deleting selected items...',
        success: 'Selected items deleted successfully!',
        error: 'Failed to delete items'
      }
    );
  };

  const handleNewSaleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/scrap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSaleForm),
      });

      const { data, success, error: apiError } = await response.json();

      if (!success) {
        throw new Error(apiError || 'Failed to add sale');
      }

      setSales(prev => [...prev, data]);
      setNewSaleForm({
        scrapType: '',
        kilos: '',
        price: '',
        date: new Date(),
        notes: ''
      });
      toast.success('Sale added successfully!');
    } catch (err) {
      toast.error('Failed to add sale', {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex items-center gap-2">
          <RefreshCw className="animate-spin h-4 w-4" />
          Loading user data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Loading Data
            </CardTitle>
            <CardDescription>We couldn't load your scrap sales data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={fetchSales}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6 mt-10">
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scrap Sales Dashboard</h1>
          <p className="text-muted-foreground">
            Track and analyze your scrap sales performance
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? (
                  <span className="text-yellow-400">☀️</span>
                ) : (
                  <span className="text-gray-600">🌙</span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Dark Mode</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={fetchSales}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh Data</TooltipContent>
          </Tooltip>

          <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Export Data</TooltipContent>
            </Tooltip>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Sales Data</DialogTitle>
                <DialogDescription>
                  Choose the format and options for your export
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <RadioGroup
                    value={exportFormat}
                    onValueChange={setExportFormat}
                    className="grid grid-cols-3 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="csv" id="csv" />
                      <Label htmlFor="csv">CSV</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="excel" id="excel" />
                      <Label htmlFor="excel">Excel</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pdf" id="pdf" />
                      <Label htmlFor="pdf">PDF</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
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

                <div className="space-y-2">
                  <Label>Include Columns</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="date" defaultChecked />
                      <Label htmlFor="date">Date</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="type" defaultChecked />
                      <Label htmlFor="type">Type</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="weight" defaultChecked />
                      <Label htmlFor="weight">Weight</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="amount" defaultChecked />
                      <Label htmlFor="amount">Amount</Label>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="sm:justify-end">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
                <Button type="button">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
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
              {/* <form onSubmit={handleNewSaleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Scrap Type
                    </Label>
                    <Select
                      value={newSaleForm.scrapType}
                      onValueChange={(value) => setNewSaleForm({ ...newSaleForm, scrapType: value })}
                      required
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select scrap type" />
                      </SelectTrigger>
                      <SelectContent>
                        {chartData.map((type) => (
                          <SelectItem key={type.name} value={type.name}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="weight" className="text-right">
                      Weight (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      className="col-span-3"
                      value={newSaleForm.kilos}
                      onChange={(e) => setNewSaleForm({ ...newSaleForm, kilos: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                      Price (₹)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      className="col-span-3"
                      value={newSaleForm.price}
                      onChange={(e) => setNewSaleForm({ ...newSaleForm, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="col-span-3 justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newSaleForm.date.toLocaleDateString()}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newSaleForm.date}
                          onSelect={(date) => setNewSaleForm({ ...newSaleForm, date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      className="col-span-3"
                      value={newSaleForm.notes}
                      onChange={(e) => setNewSaleForm({ ...newSaleForm, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form> */}

              <ScrapForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {selectedRows.length} selected
            </span>
          </div>
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="mr-2 h-4 w-4" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Export Selected
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Selected
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Selected
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRows([])}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Main content tabs */}
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
            <Settings className="mr-2 h-4 w-4" />
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  from {sales.length} transactions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Weight
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalWeight.toLocaleString()} kg</div>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
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
                      Bar
                    </Button>
                    <Button
                      variant={chartType === 'line' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType('line')}
                    >
                      Line
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  {chartType === 'bar' ? (
                    <BarChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tickFormatter={(value) => `₹${value}`}
                        tick={{ fontSize: 12 }}
                      />
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
                  ) : (
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tickFormatter={(value) => `₹${value}`}
                        tick={{ fontSize: 12 }}
                      />
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
                    <h3 className="text-sm font-medium mb-2">By Weight (kg)</h3>
                    <ResponsiveContainer width="100%" height={200}>
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
                              ₹{item.totalAmount.toLocaleString()}
                            </span>
                          </div>
                          <Progress
                            value={(item.totalAmount / totalAmount) * 100}
                            className="h-2"
                            indicatorColor={COLORS[index % COLORS.length]}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                All your scrap sales transactions in one place
              </CardDescription>
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
                    className="w-full md:w-[180px]"
                  >
                    <SelectTrigger>
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
                        className="w-full md:w-[280px] justify-start text-left font-normal"
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
                <div className="text-center py-8 text-muted-foreground">
                  No scrap sales records found
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableCaption>A list of your recent scrap sales</TableCaption>
                    <TableHeader className="bg-gray-100 dark:bg-gray-800">
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
                        <TableHead className="w-[180px]">Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Weight (kg)</TableHead>
                        <TableHead className="text-right">Amount (₹)</TableHead>
                        <TableHead className="text-right">Status</TableHead>
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
                            {formatDate(sale.date)}
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
                            <Badge variant="success">Completed</Badge>
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
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">
                          Page Total
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {paginatedSales.reduce((sum, sale) => sum + sale.kilos, 0).toFixed(2)} kg
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{paginatedSales.reduce((sum, sale) => sum + sale.price, 0).toFixed(2)}
                        </TableCell>
                        <TableCell colSpan={2}></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium"> Filtered Total </TableCell> <TableCell className="text-right font-medium"> {filteredSales.reduce((sum, sale) => sum + sale.kilos, 0).toFixed(2)} kg </TableCell> <TableCell className="text-right font-medium"> ₹{filteredSales.reduce((sum, sale) => sum + sale.price, 0).toFixed(2)} </TableCell> <TableCell colSpan={2}></TableCell> </TableRow> </TableFooter> </Table> </div>)} </CardContent> <CardFooter className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"> <div className="text-sm text-muted-foreground"> Showing <strong>{(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredSales.length)}</strong> of <strong>{filteredSales.length}</strong> transactions </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="rows-per-page" className="text-sm">
                    Rows per page
                  </Label>
                  <Select
                    value={`${rowsPerPage}`}
                    onValueChange={(value) => {
                      setRowsPerPage(Number(value))
                      setCurrentPage(1)
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
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
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
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                    disabled={currentPage === pageCount || pageCount === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(pageCount)}
                    disabled={currentPage === pageCount || pageCount === 0}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Scrap Type Performance</CardTitle>
                <CardDescription>Average price per kg</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm">
                          ₹{item.avgPricePerKg.toFixed(2)}/kg
                        </span>
                      </div>
                      <Progress
                        value={(item.avgPricePerKg / averagePerKg) * 100}
                        className="h-2"
                        indicatorColor={COLORS[index % COLORS.length]}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sales by Type</CardTitle>
                <CardDescription>Comparison of scrap types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Bar dataKey="totalAmount" name="Total Amount (₹)" fill="#8884d8" />
                    <Bar dataKey="totalWeight" name="Total Weight (kg)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Price Distribution</CardTitle>
              <CardDescription>Range of prices per kg</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Price Range</span>
                  <span className="text-sm">
                    ₹{Math.min(...chartData.map(item => item.avgPricePerKg)).toFixed(2)} - ₹{Math.max(...chartData.map(item => item.avgPricePerKg)).toFixed(2)}
                  </span>
                </div>
                <Slider
                  defaultValue={[Math.min(...chartData.map(item => item.avgPricePerKg)), Math.max(...chartData.map(item => item.avgPricePerKg))]}
                  min={Math.min(...chartData.map(item => item.avgPricePerKg))}
                  max={Math.max(...chartData.map(item => item.avgPricePerKg))}
                  step={0.1}
                  disabled
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}