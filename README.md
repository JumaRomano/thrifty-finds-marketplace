
# 🛍️ Thrifty Finds - Sustainable Second-Hand Marketplace

A modern, full-featured e-commerce platform for buying and selling second-hand clothing and vintage items. Built with React, TypeScript, and Tailwind CSS with a focus on sustainability and user experience.

## ✨ Features

### 🛒 Core E-commerce Features
- **User Authentication** - Login/Register with role-based access (Buyer, Seller, Admin)
- **Product Browsing** - Advanced search, filtering, and sorting capabilities
- **Shopping Cart** - Add/remove items, quantity management, persistent cart
- **Wishlist** - Save items for later viewing
- **Responsive Design** - Optimized for all device sizes

### 👥 User Roles & Dashboards
- **Buyers** - Browse, search, purchase items
- **Sellers** - List items, manage inventory, track sales
- **Admin** - User management, content moderation, platform analytics

### 🎨 Design Features
- **Sustainable Theme** - Earthy color palette reflecting eco-consciousness
- **Modern UI** - Clean, Instagram-inspired product cards
- **Smooth Animations** - Hover effects and micro-interactions
- **Accessible** - Following WCAG guidelines

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Beautiful, accessible component library
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

### State Management
- **React Context** - For authentication and cart state
- **React Query** - Server state management (ready for API integration)
- **Local Storage** - Persistent cart and wishlist

### Backend Ready
- **Supabase Integration** - Ready for database, auth, and file storage
- **Mock Data** - Functional demo with realistic data

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd thrifty-finds-marketplace

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup (when integrating Supabase)
```bash
# Create .env.local file
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components (shadcn/ui)
│   └── Navbar.tsx         # Main navigation component
├── contexts/
│   ├── AuthContext.tsx    # Authentication state management
│   └── CartContext.tsx    # Shopping cart state management
├── pages/
│   ├── Index.tsx          # Landing page
│   ├── Login.tsx          # User authentication
│   ├── Register.tsx       # User registration
│   ├── Products.tsx       # Product browsing
│   ├── ProductDetail.tsx  # Individual product view
│   ├── Cart.tsx           # Shopping cart
│   ├── Wishlist.tsx       # Saved items
│   ├── Profile.tsx        # User profile management
│   ├── Dashboard.tsx      # Seller dashboard
│   └── Admin.tsx          # Admin panel
├── hooks/
│   └── use-toast.ts       # Toast notification hook
├── lib/
│   └── utils.ts           # Utility functions
└── types/                 # TypeScript type definitions
```

## 🔧 Key Components

### Authentication System
- Context-based state management
- Role-based access control
- Persistent sessions
- Protected routes

### Shopping Cart
- Add/remove items
- Quantity management
- Price calculations
- Persistent storage

### Product Management
- Advanced filtering and search
- Category organization
- Condition ratings
- Image galleries

### Seller Dashboard
- Product listing management
- Sales analytics
- Performance metrics
- Inventory tracking

### Admin Panel
- User management
- Content moderation
- Platform analytics
- Reporting system

## 🎨 Design System

### Color Palette
- **Primary**: Emerald (sustainability theme)
- **Secondary**: Teal and amber accents
- **Neutral**: Warm grays
- **Semantic**: Standard success/error colors

### Typography
- **Headings**: Bold, hierarchical sizing
- **Body**: Readable, comfortable line height
- **Interactive**: Clear button and link styling

### Components
- Consistent spacing using Tailwind's scale
- Subtle shadows and borders
- Smooth hover transitions
- Accessibility-first approach

## 🚀 Deployment Options

### Recommended Stack
1. **Frontend**: Vercel, Netlify, or GitHub Pages
2. **Backend**: Supabase (PostgreSQL + Auth + Storage)
3. **CDN**: Cloudinary or Supabase Storage for images

### Environment Variables
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 📈 Future Enhancements

### Phase 2 Features
- [ ] Real-time chat between buyers/sellers
- [ ] Bidding/auction system
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] AI-powered recommendations

### Phase 3 Features
- [ ] Seller verification system
- [ ] Shipping integration
- [ ] Payment processing (Stripe)
- [ ] Review and rating system
- [ ] Social features and following

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from Depop, Vinted, and Poshmark
- Icons by Lucide React
- UI components by Shadcn/ui
- Images from Unsplash

---


