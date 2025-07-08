
import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const SampleDataLoader = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const addSampleProducts = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get categories first
      const { data: categories } = await supabase
        .from('categories')
        .select('*');

      if (!categories || categories.length === 0) {
        toast({
          title: "No categories found",
          description: "Categories need to be created first.",
          variant: "destructive",
        });
        return;
      }

      const sampleProducts = [
        {
          title: "Vintage Leather Jacket",
          description: "Classic brown leather jacket in excellent condition. Perfect for stylish casual wear.",
          starting_price: 2500,
          current_price: 2500,
          condition: "excellent",
          size: "M",
          brand: "Vintage Collection",
          is_auction: false,
          seller_id: user.id,
          category_id: categories.find(c => c.name === 'Clothing')?.id,
          images: ['/placeholder.svg']
        },
        {
          title: "Designer Handbag",
          description: "Beautiful designer handbag with minimal wear. Perfect for special occasions.",
          starting_price: 1500,
          current_price: 1800,
          condition: "good",
          brand: "Fashion Elite",
          is_auction: true,
          auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          seller_id: user.id,
          category_id: categories.find(c => c.name === 'Accessories')?.id,
          images: ['/placeholder.svg']
        },
        {
          title: "Running Sneakers",
          description: "Comfortable running sneakers in great condition. Barely used.",
          starting_price: 1200,
          current_price: 1200,
          condition: "like_new",
          size: "42",
          brand: "SportMax",
          is_auction: false,
          seller_id: user.id,
          category_id: categories.find(c => c.name === 'Shoes')?.id,
          images: ['/placeholder.svg']
        },
        {
          title: "Smartphone (Used)",
          description: "Well-maintained smartphone with all accessories. Great battery life.",
          starting_price: 8000,
          current_price: 8500,
          condition: "good",
          brand: "TechCorp",
          is_auction: true,
          auction_end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          seller_id: user.id,
          category_id: categories.find(c => c.name === 'Electronics')?.id,
          images: ['/placeholder.svg']
        }
      ];

      const { error } = await supabase
        .from('products')
        .insert(sampleProducts);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Sample products added successfully.",
      });
    } catch (error) {
      console.error('Error adding sample products:', error);
      toast({
        title: "Error",
        description: "Failed to add sample products.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
      <h3 className="font-semibold text-yellow-800 mb-2">Demo Mode</h3>
      <p className="text-sm text-yellow-700 mb-3">
        Add some sample products to see the store in action.
      </p>
      <Button onClick={addSampleProducts} variant="outline" size="sm">
        Add Sample Products
      </Button>
    </div>
  );
};

export default SampleDataLoader;
