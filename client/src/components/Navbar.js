import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-lg'
            : 'bg-white/90 backdrop-blur-md shadow-md'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center">
                  <img src="/perciumt.png" alt="Purcmium Logo" className="w-8 h-8 lg:w-10 lg:h-10 object-contain" />
                </div>
                <span className="text-xl lg:text-2xl font-serif font-bold text-gradient hidden sm:inline">
                  Purcmium
                </span>
              </motion.div>
            </Link>

            {/* Desktop Advanced Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-2xl xl:max-w-3xl mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products, brands, categories..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                             focus:outline-none focus:border-primary-500 focus:bg-white
                             transition-all duration-200 text-gray-800 placeholder-gray-400
                             hover:border-gray-300"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-12 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 flex items-center px-4 bg-primary-600 hover:bg-primary-700
                             text-white rounded-r-xl transition-colors duration-200"
                  >
                    <span className="hidden xl:inline mr-2">Search</span>
                    <Search className="w-4 h-4 xl:hidden" />
                  </button>
                </div>
              </form>
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/products"
                  className="btn-gold text-sm lg:text-base whitespace-nowrap"
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
              <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col space-y-4">
                  {/* Mobile Search Bar */}
                  <form onSubmit={handleSearch} className="w-full">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products, brands..."
                        className="w-full pl-10 pr-10 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                                 focus:outline-none focus:border-primary-500 focus:bg-white
                                 transition-all duration-200 text-gray-800 placeholder-gray-400"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </form>
                  
                  <hr className="border-gray-200" />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/" className="py-2.5 px-4 rounded-lg font-medium text-center transition-colors duration-200
                                          bg-gray-50 text-navy-700 hover:bg-gray-100 active:bg-gray-200">
                      Home
                    </Link>
                    <Link
                      to="/products"
                      className="py-2.5 px-4 rounded-lg font-medium text-center btn-gold"
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