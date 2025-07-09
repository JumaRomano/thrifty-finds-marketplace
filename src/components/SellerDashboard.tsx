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
import { Plus, Package, TrendingUp, Eye, Edit, Clock, Upload, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductEditModal from './ProductEditModal';
import { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

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
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

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
    auction_duration_hours: '24',
  });
  const [formImages, setFormImages] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchSellerData();
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSellerData = async () => {
    if (!user) return;

    try {
      console.log('Fetching seller data for user:', user.id);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
        throw productsError;
      }

      console.log('Fetched products:', productsData);

      const { data: bidsData, error: bidsError } = await supabase
        .from('seller_bids')
        .select('*')
        .eq('seller_id', user.id)
        .order('bid_time', { ascending: false });

      if (bidsError) {
        console.error('Error fetching bids:', bidsError);
      }

      console.log('Fetched bids:', bidsData);

      setProducts(productsData || []);
      setBids(bidsData || []);
    } catch (error) {
      console.error('Error fetching seller data:', error);
      toast({
        title: "Error",
        description: "Failed to load seller data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Upload to Supabase Storage
        const filePath = `public/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        if (urlData?.publicUrl) {
          newImages.push(urlData.publicUrl);
        }
      }

      setFormImages(prev => [...prev, ...newImages]);
      toast({
        title: "Images uploaded",
        description: "Product images have been added successfully.",
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitListing = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to create a listing",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim() || !formData.starting_price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const startingPrice = parseFloat(formData.starting_price);
      if (isNaN(startingPrice) || startingPrice <= 0) {
        throw new Error('Starting price must be a valid positive number');
      }

      let auctionEndTime = null;
      if (formData.is_auction && formData.auction_duration_hours) {
        const hours = parseInt(formData.auction_duration_hours);
        const endTime = new Date();
        endTime.setHours(endTime.getHours() + hours);
        auctionEndTime = endTime.toISOString();
      }

      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        starting_price: startingPrice,
        current_price: startingPrice,
        buy_now_price: formData.buy_now_price ? parseFloat(formData.buy_now_price) : null,
        condition: formData.condition,
        size: formData.size.trim() || null,
        brand: formData.brand.trim() || null,
        category_id: formData.category_id || null,
        is_auction: formData.is_auction,
        auction_end_time: auctionEndTime,
        seller_id: user.id,
        images: formImages.length > 0 ? formImages : ['/placeholder.svg'],
        status: 'active'
      };

      console.log('Submitting product data:', productData);

      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Product created successfully:', data);

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
        auction_duration_hours: '24',
      });
      setFormImages([]);
      setShowListingForm(false);
      fetchSellerData();
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Loading seller dashboard...</p>
        </div>
      </div>
    );
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
                  <p className="text-sm text-gray-600">Total Value</p>
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
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Enter item title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
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
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Describe your item..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Product Images</label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {formImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Images</span>
                    </label>
                    {uploadingImages && <span className="text-sm text-gray-500">Uploading...</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Starting Price (KSh) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.starting_price}
                      onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                      required
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Condition *</label>
                    <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })} required>
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
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Brand name"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_auction}
                      onChange={(e) => setFormData({ ...formData, is_auction: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Enable Auction</span>
                  </label>

                  {formData.is_auction && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <label className="block text-sm font-medium">Duration (hours):</label>
                      <Select value={formData.auction_duration_hours} onValueChange={(value) => setFormData({ ...formData, auction_duration_hours: value })}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 hour</SelectItem>
                          <SelectItem value="6">6 hours</SelectItem>
                          <SelectItem value="12">12 hours</SelectItem>
                          <SelectItem value="24">24 hours</SelectItem>
                          <SelectItem value="48">48 hours</SelectItem>
                          <SelectItem value="72">72 hours</SelectItem>
                          <SelectItem value="168">7 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-emerald-500 to-teal-600">
                    {submitting ? 'Creating Listing...' : 'List Item'}
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
                <Button
                  onClick={() => setShowListingForm(true)}
                  className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Listing
                </Button>
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
                          {product.auction_end_time && new Date(product.auction_end_time) > new Date() && (
                            <Badge variant="outline">
                              Ends {new Date(product.auction_end_time).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
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

        {/* Edit Product Modal */}
        <ProductEditModal
          product={editingProduct}
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={fetchSellerData}
          categories={categories}
        />
      </div>
    </div>
  );
};

export default SellerDashboard;
