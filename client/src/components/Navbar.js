import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navItems = [
    { name: 'Home', path: '/', isActive: location.pathname === '/' },
    { name: 'Products', path: '/products', isActive: location.pathname === '/products' },
    { name: 'Search', path: '/search', isActive: location.pathname === '/search' },
    { name: 'Categories', path: '/products?view=categories', isActive: false },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center">
                  <img src="/perciumt.png" alt="Purcmium Logo" className="w-8 h-8 lg:w-10 lg:h-10 object-contain" />
                </div>
                <span className="text-xl lg:text-2xl font-serif font-bold text-gradient">
                  Purcmium
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative py-2 px-1 font-medium transition-colors duration-200 ${
                    item.isActive
                      ? 'text-primary-600'
                      : isScrolled
                      ? 'text-navy-700 hover:text-primary-600'
                      : 'text-gray-100 hover:text-gold-300 drop-shadow-sm'
                  }`}
                >
                  <span className="relative z-10">{item.name}</span>
                  {item.isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                      initial={false}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Search & CTA */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                to="/search"
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isScrolled
                    ? 'text-navy-600 hover:bg-gray-100'
                    : 'text-gray-100 hover:bg-white/10 drop-shadow-sm'
                }`}
              >
                <Search className="w-5 h-5" />
              </Link>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/products"
                  className="btn-gold text-sm lg:text-base"
                >
                  View Products
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors duration-200 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isScrolled
                  ? 'text-navy-600 hover:bg-gray-100 active:bg-gray-200'
                  : 'text-gray-100 hover:bg-white/10 active:bg-white/20 drop-shadow-sm'
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-200"
            >
              <div className="container-custom py-4">
                <div className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                        item.isActive
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-navy-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  <hr className="my-2 border-gray-200" />
                  
                  <div className="flex items-center space-x-3 px-4">
                    <Link to="/search" className="flex-1 btn-secondary text-sm py-2">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Link>
                    <Link
                      to="/products"
                      className="flex-1 btn-gold text-sm py-2 text-center"
                    >
                      View Products
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div className="h-16 lg:h-20" />
    </>
  );
};

export default Navbar;