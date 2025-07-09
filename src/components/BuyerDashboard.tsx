
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/currency';
import { ShoppingBag, TrendingUp, Heart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Bid {
  id: string;
  amount: number;
  created_at: string;
  products: {
    id: string;
    title: string;
    current_price: number;
    is_auction: boolean;
    status: string;
    images?: string[];
  };
}

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBuyerData();
    }
  }, [user]);

  const fetchBuyerData = async () => {
    try {
      // Fetch user's bids
      const { data: bidsData } = await supabase
        .from('bids')
        .select(`
          *,
          products!inner(
            id,
            title,
            current_price,
            is_auction,
            status,
            images
          )
        `)
        .eq('bidder_id', user?.id)
        .order('created_at', { ascending: false });

      setBids(bidsData || []);
    } catch (error) {
      console.error('Error fetching buyer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBidStatus = (bid: Bid) => {
    const product = bid.products;
    if (product.status === 'sold') {
      return bid.amount === product.current_price ? 'won' : 'lost';
    }
    if (bid.amount === product.current_price) {
      return 'winning';
    }
    return 'outbid';
  };

  const getBidStatusBadge = (status: string) => {
    switch (status) {
      case 'won':
        return <Badge className="bg-green-500">Won</Badge>;
      case 'lost':
        return <Badge variant="destructive">Lost</Badge>;
      case 'winning':
        return <Badge className="bg-emerald-500">Winning</Badge>;
      case 'outbid':
        return <Badge variant="secondary">Outbid</Badge>;
      default:
        return <Badge variant="outline">Active</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const winningBids = bids.filter(bid => getBidStatus(bid) === 'winning').length;
  const wonBids = bids.filter(bid => getBidStatus(bid) === 'won').length;
  const totalSpent = bids
    .filter(bid => getBidStatus(bid) === 'won')
    .reduce((sum, bid) => sum + bid.amount, 0);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
            <p className="text-gray-600">Track your bids and purchases</p>
          </div>
          <Link to="/products">
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Browse Items
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Bids</p>
                  <p className="text-2xl font-bold text-emerald-600">{winningBids}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Items Won</p>
                  <p className="text-2xl font-bold text-emerald-600">{wonBids}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalSpent)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link to="/products">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Browse All Items
                  </Button>
                </Link>
                <Link to="/wishlist">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="w-4 h-4 mr-2" />
                    View Wishlist
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Bid Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Bids Placed:</span>
                  <span className="font-medium">{bids.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Currently Winning:</span>
                  <span className="font-medium text-emerald-600">{winningBids}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items Won:</span>
                  <span className="font-medium text-green-600">{wonBids}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bids List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Bids</CardTitle>
          </CardHeader>
          <CardContent>
            {bids.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No bids placed yet.</p>
                <p className="text-sm text-gray-500">Start bidding on items you love!</p>
                <Link to="/products" className="mt-4 inline-block">
                  <Button>Browse Items</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bids.map((bid) => {
                  const status = getBidStatus(bid);
                  return (
                    <div key={bid.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <img
                          src={bid.products.images?.[0] || '/placeholder.svg'}
                          alt={bid.products.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <h4 className="font-medium">{bid.products.title}</h4>
                          <p className="text-sm text-gray-600">
                            Your bid: {formatCurrency(bid.amount)} • Current: {formatCurrency(bid.products.current_price)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Placed on {new Date(bid.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getBidStatusBadge(status)}
                        <Link to={`/product/${bid.products.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuyerDashboard;
