import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onAuthClick: () => void;
  onMenuClick: () => void;
}

const Navbar = ({ cartCount, onCartClick, onAuthClick, onMenuClick }: NavbarProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled
        ? 'bg-background/95 backdrop-blur-md shadow-lg border-b border-border'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left - Menu */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuClick}
            className={`p-2 transition-colors duration-300 ${isScrolled ? 'text-foreground hover:text-accent' : 'text-cream hover:text-gold'
              }`}
          >
            <Menu size={24} />
          </motion.button>

          {/* Center - Logo */}
          <Link to="/">
            <motion.div
              className="flex flex-col items-center cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <h1 className={`font-serif text-2xl sm:text-3xl tracking-[0.15em] font-semibold transition-colors duration-300 ${isScrolled ? 'text-foreground' : 'text-cream'
                }`}>
                PETAL & PEARL
              </h1>
              <span className={`text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 ${isScrolled ? 'text-accent' : 'text-gold-light'
                }`}>
                Elegance Redefined
              </span>
            </motion.div>
          </Link>

          {/* Right - Icons */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 transition-colors duration-300 hidden sm:block ${isScrolled ? 'text-foreground hover:text-accent' : 'text-cream hover:text-gold'
                }`}
            >
              <Search size={22} />
            </motion.button>

            {/* Auth / Profile */}
            <div className="flex items-center">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span className={`text-sm hidden md:block ${isScrolled ? 'text-foreground' : 'text-cream'}`}>
                    Hello, <span className="font-semibold text-accent">{user?.name}</span>
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="text-xs uppercase tracking-widest px-4 py-2 border border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300 rounded-full"
                  >
                    Logout
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAuthClick}
                  className={`p-2 transition-colors duration-300 ${isScrolled ? 'text-foreground hover:text-accent' : 'text-cream hover:text-gold'
                    }`}
                >
                  <User size={22} />
                </motion.button>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCartClick}
              className={`p-2 relative transition-colors duration-300 ${isScrolled ? 'text-foreground hover:text-accent' : 'text-cream hover:text-gold'
                }`}
            >
              <ShoppingBag size={22} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-semibold rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-background border-t border-border overflow-hidden"
          >
            <div className="max-w-2xl mx-auto px-4 py-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for Three-Pieces, Ornaments..."
                  className="w-full px-4 py-3 pl-12 bg-muted rounded-lg border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 font-sans text-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
