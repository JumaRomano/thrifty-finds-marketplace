
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/currency';
import { Clock, Users, TrendingUp } from 'lucide-react';

interface Bid {
  id: string;
  amount: number;
  created_at: string;
  bidder_id: string;
  profiles: {
    full_name: string;
  };
}

interface BiddingSectionProps {
  productId: string;
  currentPrice: number;
  isAuction: boolean;
  auctionEndTime?: string;
  onPriceUpdate: (newPrice: number) => void;
}

const BiddingSection = ({
  productId,
  currentPrice,
  isAuction,
  auctionEndTime,
  onPriceUpdate
}: BiddingSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bidAmount, setBidAmount] = useState('');
  const [bids, setBids] = useState<Bid[]>([]);
  const [timeLeft, setTimeLeft] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuction) {
      fetchBids();
      setupRealtimeSubscription();
    }
  }, [productId, isAuction]);

  useEffect(() => {
    if (auctionEndTime) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(auctionEndTime).getTime();
        const difference = endTime - now;

        if (difference > 0) {
          const hours = Math.floor(difference / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft('Auction ended');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [auctionEndTime]);

  const fetchBids = async () => {
    const { data, error } = await supabase
      .from('bids')
      .select(`
        *,
        profiles!inner(full_name)
      `)
      .eq('product_id', productId)
      .order('amount', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching bids:', error);
      return;
    }

    setBids(data || []);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('bids-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `product_id=eq.${productId}`,
        },
        (payload) => {
          console.log('New bid received:', payload);
          fetchBids();
          onPriceUpdate(payload.new.amount);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to place a bid.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(bidAmount);
    if (amount <= currentPrice) {
      toast({
        title: "Invalid bid",
        description: `Bid must be higher than current price of ${formatCurrency(currentPrice)}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('bids')
        .insert({
          product_id: productId,
          bidder_id: user.id,
          amount: amount,
        });

      if (error) throw error;

      setBidAmount('');
      toast({
        title: "Bid placed!",
        description: `Your bid of ${formatCurrency(amount)} has been placed.`,
      });
    } catch (error: any) {
      console.error('Error placing bid:', error);
      toast({
        title: "Failed to place bid",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuction) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Auction Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Price:</span>
            <span className="text-2xl font-bold text-emerald-600">
              {formatCurrency(currentPrice)}
            </span>
          </div>
          
          {auctionEndTime && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Time Left:
              </span>
              <Badge variant={timeLeft === 'Auction ended' ? 'destructive' : 'default'}>
                {timeLeft}
              </Badge>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Users className="w-4 h-4" />
              Total Bids:
            </span>
            <span className="font-semibold">{bids.length}</span>
          </div>

          {user && timeLeft !== 'Auction ended' && (
            <form onSubmit={handleBidSubmit} className="space-y-3">
              <div>
                <label htmlFor="bidAmount" className="block text-sm font-medium mb-1">
                  Your Bid Amount (KSh)
                </label>
                <Input
                  id="bidAmount"
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Min: ${formatCurrency(currentPrice + 10)}`}
                  min={currentPrice + 1}
                  step="0.01"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
              >
                {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {bids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Bids</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bids.map((bid, index) => (
                <div key={bid.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{bid.profiles.full_name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(bid.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">
                      {formatCurrency(bid.amount)}
                    </p>
                    {index === 0 && (
                      <Badge variant="default" className="text-xs">
                        Highest Bid
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BiddingSection;
