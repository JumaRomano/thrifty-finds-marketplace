
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { Heart, ShoppingCart, X } from 'lucide-react';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  // Mock wishlist items - in real app, fetch by IDs
  const mockWishlistItems = [
    {
      id: '1',
      title: 'Vintage Levi\'s Denim Jacket',
      price: 45,
      image: 'https://images.unsplash.com/photo-1551542049-8b7e5d4f6cdf?w=400&h=400&fit=crop',
      condition: 'Like New',
      seller: 'VintageVibes'
    },
    {
      id: '3',
      title: 'Retro Sneakers',
      price: 35,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
      condition: 'Fair',
      seller: 'SneakerHead'
    }
  ];

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      sellerId: item.seller
    });
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Save items you love for later!</p>
            <Link to="/products">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                Discover Items
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">{wishlist.length} items saved</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockWishlistItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 p-2 rounded-full"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Badge className="absolute top-2 left-2 bg-emerald-500">
                  {item.condition}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <Link to={`/product/${item.id}`}>
                  <h3 className="font-semibold text-gray-800 mb-1 hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mb-2">by {item.seller}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-emerald-600">${item.price}</span>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(item)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
