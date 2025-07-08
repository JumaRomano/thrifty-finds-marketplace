
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  size?: string;
  condition?: string;
  quantity: number;
  sellerId: string;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedCart = localStorage.getItem('thrifty_cart');
    const savedWishlist = localStorage.getItem('thrifty_wishlist');
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  useEffect(() => {
    localStorage.setItem('thrifty_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('thrifty_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        toast({
          title: "Item already in cart",
          description: "Increased quantity by 1",
        });
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        toast({
          title: "Added to cart",
          description: `${item.title} has been added to your cart`,
        });
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart",
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const addToWishlist = (productId: string) => {
    setWishlist(prev => {
      if (!prev.includes(productId)) {
        toast({
          title: "Added to wishlist",
          description: "Item saved for later!",
        });
        return [...prev, productId];
      }
      return prev;
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(id => id !== productId));
    toast({
      title: "Removed from wishlist",
      description: "Item removed from your wishlist",
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const clearCart = () => {
    setCart([]);
    toast({
      title: "Cart cleared",
      description: "All items removed from cart",
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateQuantity,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearCart,
      getTotalPrice,
      getTotalItems,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (undefined === context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
