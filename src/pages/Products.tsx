
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { Search, Filter, Heart, ShoppingCart } from 'lucide-react';

const mockProducts = [
  {
    id: '1',
    title: 'Vintage Levi\'s Denim Jacket',
    price: 45,
    image: 'https://images.unsplash.com/photo-1551542049-8b7e5d4f6cdf?w=400&h=400&fit=crop',
    condition: 'Like New',
    category: 'Outerwear',
    size: 'M',
    seller: 'VintageVibes'
  },
  {
    id: '2',
    title: 'Designer Handbag',
    price: 120,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
    condition: 'Good',
    category: 'Accessories',
    seller: 'LuxFinds'
  },
  {
    id: '3',
    title: 'Retro Sneakers',
    price: 35,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    condition: 'Fair',
    category: 'Shoes',
    size: '9',
    seller: 'SneakerHead'
  },
  {
    id: '4',
    title: 'Boho Summer Dress',
    price: 28,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
    condition: 'Excellent',
    category: 'Dresses',
    size: 'S',
    seller: 'BohoChic'
  },
  {
    id: '5',
    title: 'Leather Boots',
    price: 65,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop',
    condition: 'Good',
    category: 'Shoes',
    size: '8',
    seller: 'BootCollector'
  },
  {
    id: '6',
    title: 'Silk Scarf',
    price: 22,
    image: 'https://images.unsplash.com/photo-1601762603339-fd61e28b698f?w=400&h=400&fit=crop',
    condition: 'Like New',
    category: 'Accessories',
    seller: 'SilkRoad'
  }
];

const categories = ['All', 'Outerwear', 'Dresses', 'Shoes', 'Accessories'];
const conditions = ['All', 'Like New', 'Excellent', 'Good', 'Fair'];
const sortOptions = ['price-low', 'price-high', 'newest', 'condition'];

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const { addToCart, addToWishlist, isInWishlist } = useCart();

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      size: product.size,
      sellerId: product.seller
    });
  };

  const handleWishlistToggle = (productId: string) => {
    if (isInWishlist(productId)) {
      // Remove from wishlist logic would go here
    } else {
      addToWishlist(productId);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Unique Finds</h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search for items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map(condition => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="condition">Best Condition</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  <Badge className="bg-emerald-500">{product.condition}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`absolute top-2 right-2 p-2 rounded-full ${
                    isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                  }`}
                  onClick={() => handleWishlistToggle(product.id)}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              <CardContent className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold text-gray-800 mb-1 hover:text-emerald-600 transition-colors">
                    {product.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mb-1">by {product.seller}</p>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">{product.category}</Badge>
                  {product.size && (
                    <Badge variant="outline" className="text-xs">Size {product.size}</Badge>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-emerald-600">${product.price}</span>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
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

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50">
            Load More Items
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Products;
