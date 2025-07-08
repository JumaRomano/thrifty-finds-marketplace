
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Recycle, Heart, Shield, Truck } from 'lucide-react';

const mockProducts = [
  {
    id: '1',
    title: 'Vintage Levi\'s Denim Jacket',
    price: 45,
    image: 'https://images.unsplash.com/photo-1551542049-8b7e5d4f6cdf?w=400&h=400&fit=crop',
    condition: 'Like New',
    category: 'Outerwear'
  },
  {
    id: '2',
    title: 'Designer Handbag',
    price: 120,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
    condition: 'Good',
    category: 'Accessories'
  },
  {
    id: '3',
    title: 'Retro Sneakers',
    price: 35,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    condition: 'Fair',
    category: 'Shoes'
  },
  {
    id: '4',
    title: 'Boho Summer Dress',
    price: 28,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
    condition: 'Excellent',
    category: 'Dresses'
  }
];

const features = [
  {
    icon: Recycle,
    title: 'Sustainable Fashion',
    description: 'Give pre-loved clothes a new life and reduce fashion waste'
  },
  {
    icon: Heart,
    title: 'Curated Quality',
    description: 'Every item is carefully inspected for quality and authenticity'
  },
  {
    icon: Shield,
    title: 'Secure Trading',
    description: 'Safe payments and verified sellers for peace of mind'
  },
  {
    icon: Truck,
    title: 'Fast Shipping',
    description: 'Quick and reliable delivery straight to your door'
  }
];

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Discover Unique
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Thrifted Treasures
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-emerald-50">
            Sustainable fashion that's good for you and the planet
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold px-8">
                Shop Now
              </Button>
            </Link>
            {!user && (
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600 px-8">
                  Start Selling
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Why Choose Thrifty Finds?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Featured Items</h2>
            <Link to="/products">
              <Button variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50">
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-2 right-2 bg-emerald-500">
                    {product.condition}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{product.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-emerald-600">${product.price}</span>
                    <Link to={`/product/${product.id}`}>
                      <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600">
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Thrifting Journey?</h2>
          <p className="text-xl mb-8 text-emerald-50">
            Join thousands of conscious shoppers making sustainable fashion choices
          </p>
          {!user && (
            <Link to="/register">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold px-8">
                Join Thrifty Finds Today
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
