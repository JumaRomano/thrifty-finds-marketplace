
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/currency';
import { ArrowLeft, CreditCard, MapPin, User, Upload, Phone, Calendar } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  current_price: number;
  images?: string[];
  seller_id: string;
  profiles: {
    full_name: string;
    phone?: string;
  };
}

const pickupLocations = [
  { value: 'nairobi-cbd', label: 'Nairobi CBD', address: 'Tom Mboya Street, Nairobi' },
  { value: 'thika-trm', label: 'Thika TRM', address: 'TRM Mall, Thika Road' },
  { value: 'westlands', label: 'Westlands', address: 'Westlands Shopping Centre' },
  { value: 'ngong', label: 'Ngong', address: 'Ngong Town Center' }
];

const Checkout = () => {
  const { productId } = useParams<{ productId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [tillNumber, setTillNumber] = useState('');
  const [mpesaCode, setMpesaCode] = useState('');
  const [mpesaReceipt, setMpesaReceipt] = useState<File | null>(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

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
          profiles!inner(full_name, phone)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);
      
      // Set seller's payment info (in real app, this would come from seller's profile)
      setTillNumber('174379'); // Demo till number
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setMpesaReceipt(file);
      toast({
        title: "Receipt uploaded",
        description: "M-Pesa receipt has been uploaded successfully.",
      });
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload an image file of your M-Pesa receipt.",
        variant: "destructive",
      });
    }
  };

  const getMinPickupDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxPickupDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days from now
    return maxDate.toISOString().split('T')[0];
  };

  const handleCheckout = async () => {
    if (!user || !product) return;

    // Validation
    if (!shippingAddress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a shipping address.",
        variant: "destructive",
      });
      return;
    }

    if (!buyerPhone.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your phone number.",
        variant: "destructive",
      });
      return;
    }

    if (!pickupLocation) {
      toast({
        title: "Missing Information",
        description: "Please select a pickup location.",
        variant: "destructive",
      });
      return;
    }

    if (!pickupDate) {
      toast({
        title: "Missing Information",
        description: "Please select a pickup date.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'mpesa' && !mpesaCode.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your M-Pesa transaction code.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'mpesa' && !mpesaReceipt) {
      toast({
        title: "Missing Information",
        description: "Please upload your M-Pesa receipt.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const selectedLocation = pickupLocations.find(loc => loc.value === pickupLocation);
      
      // Create order record
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          seller_id: product.seller_id,
          product_id: product.id,
          amount: product.current_price,
          shipping_address: shippingAddress,
          status: 'payment_pending',
          // Store additional checkout info in a metadata field or separate table
          // For now, we'll use shipping_address to store all info
          shipping_address: JSON.stringify({
            address: shippingAddress,
            phone: buyerPhone,
            pickup_location: selectedLocation?.label,
            pickup_address: selectedLocation?.address,
            pickup_date: pickupDate,
            payment_method: paymentMethod,
            mpesa_code: mpesaCode,
            till_number: tillNumber
          })
        });

      if (orderError) throw orderError;

      // Update product status to pending (not sold until payment is verified)
      const { error: updateError } = await supabase
        .from('products')
        .update({ status: 'pending' })
        .eq('id', product.id);

      if (updateError) throw updateError;

      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been placed. The seller will verify your payment and contact you for pickup details.",
      });

      // Redirect to success page
      navigate('/dashboard', { 
        state: { 
          message: 'Order placed successfully! You will be contacted once payment is verified.',
          orderDetails: {
            product: product.title,
            amount: product.current_price,
            pickup_location: selectedLocation?.label,
            pickup_date: pickupDate
          }
        }
      });

    } catch (error: any) {
      console.error('Error processing order:', error);
      toast({
        title: "Order Failed",
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
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Buyer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Buyer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <Input value={user?.email || ''} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <Input
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="07xxxxxxxx"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address *</label>
                  <Textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your address for communication purposes..."
                    required
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pickup Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Pickup Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Pickup Location *</label>
                  <Select value={pickupLocation} onValueChange={setPickupLocation} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pickup location" />
                    </SelectTrigger>
                    <SelectContent>
                      {pickupLocations.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          <div>
                            <div className="font-medium">{location.label}</div>
                            <div className="text-sm text-gray-500">{location.address}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pickup Date *</label>
                  <Input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={getMinPickupDate()}
                    max={getMaxPickupDate()}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Available for pickup from tomorrow up to 30 days
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="till">Business Till Number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === 'mpesa' && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">M-Pesa Payment Instructions</h4>
                    <ol className="text-sm text-green-700 space-y-1">
                      <li>1. Go to M-Pesa on your phone</li>
                      <li>2. Select "Lipa na M-Pesa"</li>
                      <li>3. Select "Buy Goods and Services"</li>
                      <li>4. Enter Till Number: <strong>{tillNumber}</strong></li>
                      <li>5. Enter Amount: <strong>{formatCurrency(product.current_price)}</strong></li>
                      <li>6. Enter your M-Pesa PIN</li>
                      <li>7. Upload the M-Pesa receipt below</li>
                    </ol>
                  </div>
                )}

                {paymentMethod === 'till' && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Pochi la Biashara Payment</h4>
                    <p className="text-sm text-blue-700 mb-2">
                      Send <strong>{formatCurrency(product.current_price)}</strong> to the seller's business number:
                    </p>
                    <p className="text-lg font-bold text-blue-800">{tillNumber}</p>
                    <p className="text-sm text-blue-600 mt-2">
                      After sending money, upload your M-Pesa receipt below.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">M-Pesa Transaction Code *</label>
                  <Input
                    value={mpesaCode}
                    onChange={(e) => setMpesaCode(e.target.value)}
                    placeholder="Enter M-Pesa code (e.g., QH7XF7Y890)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Upload M-Pesa Receipt *</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <label
                      htmlFor="receipt-upload"
                      className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{mpesaReceipt ? 'Receipt Uploaded' : 'Upload Receipt'}</span>
                    </label>
                    {mpesaReceipt && (
                      <span className="text-sm text-green-600">✓ {mpesaReceipt.name}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload a clear photo of your M-Pesa receipt for verification
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
                    {product.profiles.phone && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {product.profiles.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>Item price</span>
                    <span>{formatCurrency(product.current_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span className="text-emerald-600">Free</span>
                  </div>
                  {pickupLocation && (
                    <div className="flex justify-between text-sm">
                      <span>Pickup location</span>
                      <span>{pickupLocations.find(loc => loc.value === pickupLocation)?.label}</span>
                    </div>
                  )}
                  {pickupDate && (
                    <div className="flex justify-between text-sm">
                      <span>Pickup date</span>
                      <span>{new Date(pickupDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(product.current_price)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={submitting || !shippingAddress.trim() || !buyerPhone.trim() || !pickupLocation || !pickupDate || !mpesaCode.trim() || !mpesaReceipt}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  {submitting ? 'Processing...' : `Complete Order - ${formatCurrency(product.current_price)}`}
                </Button>

                <div className="text-xs text-gray-500 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Secure checkout with pickup verification
                  </div>
                  <p>Payment will be verified before pickup is arranged</p>
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
