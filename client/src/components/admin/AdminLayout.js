import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  Tag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Analytics'
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: ShoppingBag,
      description: 'Manage Products'
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: Tag,
      description: 'Manage Categories'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'Performance Reports'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      description: 'System Settings'
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl lg:hidden"
          >
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <Link to="/" className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="ml-2 text-xl font-serif font-bold text-navy-800">
                  Purcmium
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <SidebarContent navigation={navigation} isActive={isActive} onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="ml-2 text-xl font-serif font-bold text-navy-800">
                Purcmium
              </span>
            </Link>
          </div>
          
          <SidebarContent navigation={navigation} isActive={isActive} onLogout={handleLogout} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 justify-between px-4 lg:px-6">
            <div className="flex flex-1 items-center">
              {/* Search could go here */}
            </div>
            
            <div className="ml-4 flex items-center lg:ml-6 space-x-3">
              {/* Notifications */}
              <button className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                <Bell className="h-5 w-5" />
              </button>

              {/* Profile */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.username || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="px-4 py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, isActive, onLogout }) => {
  return (
    <div className="flex flex-col flex-grow">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
              isActive(item.href)
                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <item.icon
              className={`mr-3 h-5 w-5 flex-shrink-0 ${
                isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            <div className="flex flex-col">
              <span className="font-medium">{item.name}</span>
              <span className={`text-xs ${
                isActive(item.href) ? 'text-white opacity-90' : 'text-gray-500'
              }`}>
                {item.description}
              </span>
            </div>
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="group flex w-full items-center px-3 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" />
          <div className="flex flex-col items-start">
            <span className="font-medium">Sign out</span>
            <span className="text-xs text-gray-500 group-hover:text-red-500">
              End admin session
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AdminLayout;