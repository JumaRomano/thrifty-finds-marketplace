import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Package, 
  DollarSign, 
  Eye, 
  Heart, 
  Plus, 
  Edit3, 
  Trash2,
  TrendingUp,
  Users,
  ShoppingBag
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock data for seller dashboard
  const stats = {
    totalListings: 24,
    totalSales: 156,
    totalRevenue: 2340,
    totalViews: 1247
  };

  const mockListings = [
    {
      id: '1',
      title: 'Vintage Levi\'s Denim Jacket',
      price: 45,
      image: 'https://images.unsplash.com/photo-1551542049-8b7e5d4f6cdf?w=200&h=200&fit=crop',
      status: 'active',
      views: 143,
      likes: 12
    },
    {
      id: '2',
      title: 'Designer Handbag',
      price: 120,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop',
      status: 'sold',
      views: 89,
      likes: 8
    }
  ];

  const AddListingForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Add New Listing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Item title" />
          </div>
          <div>
            <Label htmlFor="price">Price ($)</Label>
            <Input id="price" type="number" placeholder="0.00" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outerwear">Outerwear</SelectItem>
                <SelectItem value="dresses">Dresses</SelectItem>
                <SelectItem value="shoes">Shoes</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="condition">Condition</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="like-new">Like New</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="size">Size</Label>
            <Input id="size" placeholder="S, M, L, etc." />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            placeholder="Describe your item..."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="images">Images</Label>
          <Input id="images" type="file" multiple accept="image/*" />
          <p className="text-sm text-gray-500 mt-1">Upload up to 5 images</p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
            List Item
          </Button>
          <Button variant="outline" onClick={() => setShowAddForm(false)}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Please log in to access your seller dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}!</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Listing
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Listings</p>
                  <p className="text-2xl font-bold">{stats.totalListings}</p>
                </div>
                <Package className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Sales</p>
                  <p className="text-2xl font-bold">{stats.totalSales}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Revenue</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue}</p>
                </div>
                <DollarSign className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Views</p>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                </div>
                <Eye className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Listing Form */}
        {showAddForm && (
          <div className="mb-8">
            <AddListingForm />
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="sales">Sales History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            <div className="grid gap-4">
              {mockListings.map((listing) => (
                <Card key={listing.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{listing.title}</h3>
                          <Badge className={listing.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                            {listing.status}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600 mb-2">${listing.price}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {listing.views} views
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {listing.likes} likes
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Sales history will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Analytics charts will appear here.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Top items data will appear here.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
