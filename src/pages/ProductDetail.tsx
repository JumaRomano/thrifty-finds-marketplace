
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, ShoppingCart, Star, MessageCircle, ArrowLeft, Shield } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock product data - in real app, fetch by ID
  const product = {
    id: id || '1',
    title: 'Vintage Levi\'s Denim Jacket',
    price: 45,
    images: [
      'https://images.unsplash.com/photo-1551542049-8b7e5d4f6cdf?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop'
    ],
    condition: 'Like New',
    category: 'Outerwear',
    size: 'M',
    brand: 'Levi\'s',
    description: 'Classic vintage Levi\'s denim jacket in excellent condition. This timeless piece features the iconic trucker jacket design with button closure, chest pockets, and adjustable side tabs. Perfect for layering and adds instant vintage cool to any outfit.',
    measurements: {
      chest: '42"',
      length: '24"',
      sleeve: '25"'
    },
    seller: {
      id: '1',
      name: 'VintageVibes',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vintage',
      rating: 4.8,
      sales: 234
    },
    tags: ['vintage', 'denim', 'classic', 'unisex']
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0],
      size: product.size,
      sellerId: product.seller.id
    });
  };

  const handleWishlistToggle = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    addToWishlist(product.id);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-emerald-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-emerald-500">{product.condition}</Badge>
                <Badge variant="outline">{product.category}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <p className="text-sm text-gray-600 mb-4">{product.brand}</p>
              <p className="text-4xl font-bold text-emerald-600">${product.price}</p>
            </div>

            {/* Size and Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Size: {product.size}</h3>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Measurements</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Chest:</span>
                    <p className="font-medium">{product.measurements.chest}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Length:</span>
                    <p className="font-medium">{product.measurements.length}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Sleeve:</span>
                    <p className="font-medium">{product.measurements.sleeve}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
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
                onClick={handleWishlistToggle}
                className={`p-3 ${
                  isInWishlist(product.id) ? 'text-red-500 border-red-500' : 'hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Seller Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={product.seller.avatar} />
                      <AvatarFallback>{product.seller.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{product.seller.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{product.seller.rating}</span>
                        <span>•</span>
                        <span>{product.seller.sales} sales</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Tags */}
            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Trust & Safety */}
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="font-semibold text-emerald-800">Protected Purchase</h4>
                    <p className="text-sm text-emerald-700">
                      Your order is protected by our buyer guarantee
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
