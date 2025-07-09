
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Activity,
  Ban,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer } from 'recharts';
import ProductEditModal from '@/components/ProductEditModal';

const Admin = () => {
  const { user, userRole, loading } = useAuth();

  // State for real data
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    totalRevenue: 0,
    reportedItems: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);

  // Analytics data state
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (userRole === 'admin') {
      fetchAdminData();
      fetchAnalyticsData();
    }
  }, [userRole]);

  // Fetch categories for edit modal
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error) setCategories(data || []);
    };
    fetchCategories();
  }, []);

  const fetchAdminData = async () => {
    setDataLoading(true);
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');
      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('products')
        .select('*');
      if (listingsError) throw listingsError;
      setListings(listingsData || []);

      // Fetch reports (use products with status 'reported')
      const reportedProducts = (listingsData || []).filter((l: any) => l.status === 'reported');
      setReports(reportedProducts);

      // Fetch orders for revenue
      let totalRevenue = 0;
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('amount');
        if (ordersError) throw ordersError;
        if (ordersData) {
          totalRevenue = ordersData.reduce((sum: number, order: any) => sum + (order.amount || 0), 0);
        }
      } catch (err) {
        totalRevenue = 0;
      }

      // Calculate stats
      setStats({
        totalUsers: usersData ? usersData.length : 0,
        activeListings: listingsData ? listingsData.filter((l: any) => l.status === 'active').length : 0,
        totalRevenue,
        reportedItems: reportedProducts.length,
      });
    } catch (err) {
      // Optionally handle error
      setUsers([]);
      setListings([]);
      setReports([]);
      setStats({ totalUsers: 0, activeListings: 0, totalRevenue: 0, reportedItems: 0 });
    } finally {
      setDataLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    // User growth: count users per month
    const { data: usersData } = await supabase.from('profiles').select('created_at');
    if (usersData) {
      const growthMap: Record<string, number> = {};
      usersData.forEach((u: any) => {
        if (u.created_at) {
          const month = u.created_at.slice(0, 7); // YYYY-MM
          growthMap[month] = (growthMap[month] || 0) + 1;
        }
      });
      const growthArr = Object.entries(growthMap).map(([month, count]) => ({ month, count }));
      growthArr.sort((a, b) => a.month.localeCompare(b.month));
      setUserGrowthData(growthArr);
    }
    // Sales: sum orders per month
    const { data: ordersData } = await supabase.from('orders').select('created_at, amount');
    if (ordersData) {
      const salesMap: Record<string, number> = {};
      ordersData.forEach((o: any) => {
        if (o.created_at) {
          const month = o.created_at.slice(0, 7);
          salesMap[month] = (salesMap[month] || 0) + (o.amount || 0);
        }
      });
      const salesArr = Object.entries(salesMap).map(([month, total]) => ({ month, total }));
      salesArr.sort((a, b) => a.month.localeCompare(b.month));
      setSalesData(salesArr);
    }
  };

  // Listing management handlers
  const handleActivateListing = async (id: string) => {
    await supabase.from('products').update({ status: 'active' }).eq('id', id);
    fetchAdminData();
  };
  const handleDeactivateListing = async (id: string) => {
    await supabase.from('products').update({ status: 'inactive' }).eq('id', id);
    fetchAdminData();
  };
  const handleDeleteListing = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    fetchAdminData();
  };
  const handleEditListing = (id: string) => {
    const product = listings.find((l) => l.id === id);
    setEditProduct(product);
    setEditModalOpen(true);
  };
  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditProduct(null);
  };
  const handleEditModalSave = () => {
    fetchAdminData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Checking admin privileges...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
            <p className="text-gray-600 mb-6">Please log in to access the admin dashboard.</p>
            {/* You can add a login button or link here if desired */}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You do not have permission to view this page. Admin privileges are required.</p>
            {/* Optionally, add a button to go back to dashboard or home */}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your marketplace</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Listings</p>
                  <p className="text-2xl font-bold">{stats.activeListings}</p>
                </div>
                <Package className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Reported Items</p>
                  <p className="text-2xl font-bold">{stats.reportedItems}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{user.full_name || user.email}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">Sales: {user.sales || 0}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                          {user.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Ban className="w-4 h-4 mr-1" />
                          {user.status === 'active' ? 'Suspend' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>Listing Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div key={listing.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-2">
                      <div>
                        <h3 className="font-semibold">{listing.title}</h3>
                        <p className="text-sm text-gray-600">Status: {listing.status}</p>
                        <p className="text-sm text-gray-500">Price: ${listing.current_price}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {listing.status !== 'active' && (
                          <Button size="sm" onClick={() => handleActivateListing(listing.id)}>Activate</Button>
                        )}
                        {listing.status === 'active' && (
                          <Button size="sm" variant="outline" onClick={() => handleDeactivateListing(listing.id)}>Deactivate</Button>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => handleEditListing(listing.id)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteListing(listing.id)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <ProductEditModal
                  product={editProduct}
                  isOpen={editModalOpen}
                  onClose={handleEditModalClose}
                  onSave={handleEditModalSave}
                  categories={categories}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reported Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{report.item_name}</h3>
                        <p className="text-sm text-gray-600">Reported by: {report.reporter_id}</p>
                        <p className="text-sm text-gray-500">Reason: {report.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={report.status === 'resolved' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {report.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* User Growth Line Chart */}
                  <div>
                    <h3 className="font-semibold mb-2">User Growth Over Time</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={userGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Sales Bar Chart */}
                  <div>
                    <h3 className="font-semibold mb-2">Sales Over Time</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
