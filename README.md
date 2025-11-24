# 🌟 Purcmium - Premium Affiliate Marketing Platform

A full-stack MERN (MongoDB, Express, React, Node.js) application designed for affiliate marketing with a premium, responsive design and comprehensive admin panel.

## ✨ Features

### 🌐 Public Website
- **Premium Landing Page** with hero section, product showcase, and animated components
- **Product Discovery** with categories, search, and filtering
- **Detailed Product Pages** with affiliate link tracking
- **Responsive Design** optimized for all devices
- **Smooth Animations** powered by Framer Motion

### 🔐 Admin Panel
- **Secure Authentication** with JWT and HttpOnly cookies
- **Dashboard Analytics** with performance metrics and charts  
- **Product Management** with full CRUD operations
- **Click & Conversion Tracking** for affiliate performance
- **Export/Import** functionality for bulk operations
- **Advanced Analytics** with detailed reports

### 🛡️ Security Features
- **Rate Limiting** to prevent abuse
- **Input Sanitization** against XSS and NoSQL injection
- **Secure Headers** with Helmet.js
- **Password Hashing** with bcrypt (12 rounds)
- **CORS Protection** with configurable origins

### 🎨 Design System
- **Tailwind CSS** for utility-first styling
- **Custom Color Palette** with navy, gold, and primary blues
- **Typography** with Playfair Display and Inter fonts
- **Responsive Components** with mobile-first approach
- **Premium Animations** and micro-interactions

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB instance (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd purcmium
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create `server/.env`:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/purcmium
   
   # JWT Secret (generate a strong secret)
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # CORS Origins (comma-separated)
   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Admin Account (for initial setup)
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123456
   ADMIN_EMAIL=admin@purcmium.com
   ```

   Create `client/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the application**
   ```bash
   # Development mode (both client and server)
   npm run dev
   
   # Or run separately
   npm run server  # Backend on http://localhost:5000
   npm run client  # Frontend on http://localhost:3000
   ```

5. **Create Admin Account**
   ```bash
   # Navigate to server directory
   cd server
   
   # Create the first admin user
   node utils/createAdmin.js
   ```

## 🏗️ Project Structure

```
purcmium/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── admin/     # Admin-specific components
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   └── ...
│   │   ├── pages/         # Page components
│   │   │   ├── admin/     # Admin panel pages
│   │   │   ├── Home.js
│   │   │   └── ...
│   │   ├── sections/      # Page sections
│   │   ├── context/       # React Context providers
│   │   ├── utils/         # Utility functions
│   │   └── index.css      # Global styles
│   └── package.json
│
├── server/                # Node.js backend
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API route handlers
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── server.js         # Entry point
│   └── package.json
│
├── package.json          # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout  
- `GET /api/auth/check` - Check auth status

### Products (Public)
- `GET /api/products` - Get all products (paginated)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/latest` - Get latest products
- `GET /api/products/:identifier` - Get single product

### Products (Admin)
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/admin/products` - Get all products (admin view)

### Analytics & Tracking
- `POST /api/track/click` - Track product click
- `POST /api/track/conversion` - Track conversion
- `GET /api/admin/metrics` - Get dashboard metrics

## 🎨 Design Tokens

### Colors
```css
/* Primary Palette */
--primary-50: #eff6ff;
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Navy Palette */
--navy-800: #1e293b;
--navy-900: #0f172a;

/* Gold Accents */
--gold-500: #f59e0b;
--gold-600: #d97706;
```

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)
- **UI**: Inter (sans-serif)

## 🔐 Admin Panel Access

1. **Default Credentials** (after setup):
   - URL: `http://localhost:3000/webapp/admin`
   - Username: `admin`
   - Password: `admin123456`

2. **Features Available**:
   - Dashboard with analytics
   - Product management (CRUD)
   - Performance tracking
   - Export/import tools
   - Settings management

## 📱 Responsive Breakpoints

- **Mobile**: 0px - 767px
- **Tablet**: 768px - 1023px  
- **Desktop**: 1024px+

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the client: `npm run build`
2. Deploy the `client/build` directory
3. Set environment variables in deployment platform

### Backend (Railway/Render/DigitalOcean)
1. Deploy the `server` directory
2. Set all required environment variables
3. Ensure MongoDB connection is available

### Environment Variables for Production
```env
# Server
NODE_ENV=production
MONGODB_URI=<your_production_mongodb_uri>
JWT_SECRET=<strong_production_secret>
CORS_ORIGINS=https://yourdomain.com

# Client  
REACT_APP_API_URL=https://your-api-domain.com/api
```

## 🔧 Development

### Adding New Products
1. Access admin panel at `/webapp/admin`
2. Navigate to Products section
3. Use "Add Product" button
4. Fill in product details including:
   - Title and description
   - Price and category
   - Images (URLs)
   - Affiliate URL
   - Tags and settings

### Customization
- **Colors**: Modify `tailwind.config.js`
- **Fonts**: Update `client/public/index.html`
- **Components**: Extend existing components in `client/src/components/`
- **API**: Add new routes in `server/routes/`

## 🧪 Testing

```bash
# Run client tests
cd client && npm test

# Run server tests (when implemented)
cd server && npm test
```

## 📊 Performance Features

- **Lazy Loading** for images and components
- **Code Splitting** with React.lazy()
- **Optimized Images** with proper sizing
- **Caching** for API responses
- **Minification** in production builds

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **CORS Errors**
   - Check `CORS_ORIGINS` in server `.env`
   - Ensure client URL is included

3. **Authentication Issues**
   - Verify JWT secret is set
   - Check cookie settings in browser
   - Ensure server and client are on allowed origins

4. **Build Errors**
   - Clear `node_modules` and reinstall
   - Check for missing dependencies
   - Verify Node.js version compatibility

## 📞 Support

For issues, feature requests, or questions:
1. Check existing documentation
2. Search through project issues
3. Create a new issue with detailed description

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **React** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **MongoDB** - Database
- **Express.js** - Backend framework
- **Lucide React** - Icon library

---

Built with ❤️ by the Purcmium Team