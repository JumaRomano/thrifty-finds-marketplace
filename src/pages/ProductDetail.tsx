
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/currency';
import BiddingSection from '@/components/BiddingSection';
import { ArrowLeft, Heart, ShoppingCart, Star, MapPin, Calendar, Package } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  current_price: number;
  starting_price: number;
  buy_now_price?: number;
  condition: string;
  size?: string;
  brand?: string;
  images?: string[];
  is_auction: boolean;
  auction_end_time?: string;
  created_at: string;
  seller_id: string;
  profiles: {
    full_name: string;
    location?: string;
  };
  categories?: {
    name: string;
  };
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles!inner(full_name, location),
          categories(name)
        `)
        .eq('id', id)
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

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to cart.",
        variant: "destructive",
      });
      return;
    }

    if (product) {
      addToCart({
        id: product.id,
        title: product.title,
        price: product.current_price,
        image: product.images?.[0] || '/placeholder.svg',
        condition: product.condition,
        sellerId: product.seller_id,
      });
    }
  };

  const handleAddToWishlist = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to wishlist.",
        variant: "destructive",
      });
      return;
    }

    if (product) {
      addToWishlist(product.id);
    }
  };

  const handlePriceUpdate = (newPrice: number) => {
    if (product) {
      setProduct({ ...product, current_price: newPrice });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Link to="/products" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images?.[currentImageIndex] || '/placeholder.svg'}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-emerald-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.categories && (
                  <Badge variant="secondary">{product.categories.name}</Badge>
                )}
                <Badge variant="outline">{product.condition}</Badge>
                {product.is_auction && (
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600">
                    Auction
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{product.profiles.location || 'Location not specified'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Listed {new Date(product.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="text-3xl font-bold text-emerald-600 mb-4">
                {formatCurrency(product.current_price)}
              </div>

              {product.is_auction && product.starting_price !== product.current_price && (
                <p className="text-sm text-gray-600 mb-4">
                  Starting price: {formatCurrency(product.starting_price)}
                </p>
              )}

              {product.buy_now_price && (
                <p className="text-sm text-gray-600 mb-4">
                  Buy now price: {formatCurrency(product.buy_now_price)}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {product.brand && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Brand:</span>
                    <p className="text-gray-900">{product.brand}</p>
                  </div>
                )}
                {product.size && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Size:</span>
                    <p className="text-gray-900">{product.size}</p>
                  </div>
                )}
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Seller:</span>
                <p className="text-gray-900">{product.profiles.full_name}</p>
              </div>
            </div>

            {!product.is_auction && (
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddToWishlist}
                  className={isInWishlist(product.id) ? "text-red-500 border-red-500" : ""}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Description */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {product.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Bidding Section */}
          <div>
            <BiddingSection
              productId={product.id}
              currentPrice={product.current_price}
              isAuction={product.is_auction}
              auctionEndTime={product.auction_end_time}
              onPriceUpdate={handlePriceUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
