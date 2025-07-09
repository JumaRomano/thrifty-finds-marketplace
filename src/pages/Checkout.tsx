
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/currency';
import { ArrowLeft, CreditCard, MapPin, User } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  current_price: number;
  images?: string[];
  seller_id: string;
  profiles: {
    full_name: string;
  };
}

const Checkout = () => {
  const { productId } = useParams<{ productId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles!inner(full_name)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!user || !product) return;

    if (!shippingAddress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a shipping address.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create order record
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          seller_id: product.seller_id,
          product_id: product.id,
          amount: product.current_price,
          shipping_address: shippingAddress,
          status: 'paid'
        });

      if (orderError) throw orderError;

      // Update product status to sold
      const { error: updateError } = await supabase
        .from('products')
        .update({ status: 'sold' })
        .eq('id', product.id);

      if (updateError) throw updateError;

      toast({
        title: "Payment Successful!",
        description: "Your order has been placed successfully. The seller will be notified.",
      });

      // Redirect to success page
      navigate('/dashboard', { 
        state: { message: 'Payment completed successfully!' }
      });

    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <Input value={user?.email || ''} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shipping Address *</label>
                  <Textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your full shipping address..."
                    required
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    💡 This is a demo checkout. In production, integrate with payment processors like Stripe, PayPal, or M-Pesa.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <img
                    src={product.images?.[0] || '/placeholder.svg'}
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{product.title}</h4>
                    <p className="text-sm text-gray-600">
                      Sold by {product.profiles.full_name}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>Item price</span>
                    <span>{formatCurrency(product.current_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-emerald-600">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(product.current_price)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={submitting || !shippingAddress.trim()}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  {submitting ? 'Processing...' : `Pay ${formatCurrency(product.current_price)}`}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Secure checkout powered by demo system
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
