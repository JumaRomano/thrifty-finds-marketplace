
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/currency';
import { Plus, Package, TrendingUp, Eye, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  title: string;
  current_price: number;
  starting_price: number;
  condition: string;
  is_auction: boolean;
  status: string;
  created_at: string;
  images?: string[];
}

interface Bid {
  bid_id: string;
  amount: number;
  bid_time: string;
  product_id: string;
  product_title: string;
  current_price: number;
  bidder_name: string;
  bidder_email: string;
}

const SellerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showListingForm, setShowListingForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    starting_price: '',
    buy_now_price: '',
    condition: '',
    size: '',
    brand: '',
    category_id: '',
    is_auction: false,
    auction_end_time: '',
  });

  useEffect(() => {
    if (user) {
      fetchSellerData();
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  };

  const fetchSellerData = async () => {
    try {
      // Fetch seller's products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      // Fetch bids on seller's products
      const { data: bidsData } = await supabase
        .from('seller_bids')
        .select('*')
        .eq('seller_id', user?.id)
        .order('bid_time', { ascending: false });

      setProducts(productsData || []);
      setBids(bidsData || []);
    } catch (error) {
      console.error('Error fetching seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitListing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        title: formData.title,
        description: formData.description,
        starting_price: parseFloat(formData.starting_price),
        current_price: parseFloat(formData.starting_price),
        buy_now_price: formData.buy_now_price ? parseFloat(formData.buy_now_price) : null,
        condition: formData.condition,
        size: formData.size || null,
        brand: formData.brand || null,
        category_id: formData.category_id || null,
        is_auction: formData.is_auction,
        auction_end_time: formData.is_auction && formData.auction_end_time ? 
          new Date(formData.auction_end_time).toISOString() : null,
        seller_id: user?.id,
        images: ['/placeholder.svg'],
      };

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your item has been listed successfully.",
      });

      // Reset form and refresh data
      setFormData({
        title: '',
        description: '',
        starting_price: '',
        buy_now_price: '',
        condition: '',
        size: '',
        brand: '',
        category_id: '',
        is_auction: false,
        auction_end_time: '',
      });
      setShowListingForm(false);
      fetchSellerData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to list item.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-gray-600">Manage your listings and track bids</p>
          </div>
          <Button
            onClick={() => setShowListingForm(!showListingForm)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            List New Item
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {products.filter(p => p.status === 'active').length}
                  </p>
                </div>
                <Package className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bids</p>
                  <p className="text-2xl font-bold text-emerald-600">{bids.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(products.reduce((sum, p) => sum + p.current_price, 0))}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listing Form */}
        {showListingForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>List New Item</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitListing} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Starting Price (KSh) *</label>
                    <Input
                      type="number"
                      value={formData.starting_price}
                      onChange={(e) => setFormData({...formData, starting_price: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Condition *</label>
                    <Select value={formData.condition} onValueChange={(value) => setFormData({...formData, condition: value})} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="like_new">Like New</SelectItem>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Brand</label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_auction}
                      onChange={(e) => setFormData({...formData, is_auction: e.target.checked})}
                    />
                    <span className="text-sm font-medium">Enable Auction</span>
                  </label>
                  
                  {formData.is_auction && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Auction End Date</label>
                      <Input
                        type="datetime-local"
                        value={formData.auction_end_time}
                        onChange={(e) => setFormData({...formData, auction_end_time: e.target.value})}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-600">
                    List Item
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowListingForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Recent Bids */}
        {bids.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Bids</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bids.slice(0, 5).map((bid) => (
                  <div key={bid.bid_id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{bid.product_title}</h4>
                      <p className="text-sm text-gray-600">
                        Bid by {bid.bidder_name} • {new Date(bid.bid_time).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{formatCurrency(bid.amount)}</p>
                      <Badge variant="outline">New</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No listings yet. Create your first listing!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.images?.[0] || '/placeholder.svg'}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium">{product.title}</h4>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(product.current_price)} • {product.condition}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                            {product.status}
                          </Badge>
                          {product.is_auction && <Badge className="bg-emerald-500">Auction</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/product/${product.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerDashboard;
