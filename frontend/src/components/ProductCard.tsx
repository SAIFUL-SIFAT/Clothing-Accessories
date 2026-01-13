import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useWishlist } from '@/context/WishlistContext';
import { useQuickView } from '@/context/QuickViewContext';

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  type?: 'clothing' | 'ornament';
  description?: string;
  isNew?: boolean;
  isSale?: boolean;
  stock: number;
  material?: string;
  occasion?: string;
  color?: string;
  tags?: string[];
}

interface ProductCardProps {
  product: Product;
  type?: 'clothing' | 'ornament';
  onAddToCart: (product: Product) => void;
  index?: number;
}

const ProductCard = ({ product, type = 'clothing', onAddToCart, index = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { openQuickView } = useQuickView();
  const navigate = useNavigate();
  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const productUrl = `/product/${product.id}/${slugify(product.name)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden bg-card rounded-lg"
      style={{ boxShadow: 'var(--shadow-soft)' }}
    >
      {/* Image Container */}
      <div
        className="relative aspect-[3/4] overflow-hidden cursor-pointer"
        onClick={() => navigate(productUrl)}
      >
        <motion.img
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          src={product.image?.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${product.image}`}
          alt={product.name}
          crossOrigin="anonymous"
          className={`h-full w-full object-cover ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
        />

        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-black/40"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isOutOfStock ? (
            <span className="px-3 py-1 bg-neutral-800 text-white text-[10px] uppercase tracking-widest font-semibold rounded">
              Sold Out
            </span>
          ) : (
            <>
              {product.isNew && (
                <span className="px-3 py-1 bg-accent text-accent-foreground text-[10px] uppercase tracking-widest font-semibold rounded">
                  New
                </span>
              )}
              {product.isSale && (
                <span className="px-3 py-1 bg-destructive text-destructive-foreground text-[10px] uppercase tracking-widest font-semibold rounded">
                  Sale
                </span>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: isHovered ? 1 : 1, x: isHovered ? 0 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product);
            }}
            className={`p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-colors ${isWishlisted
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-background/80 text-foreground hover:bg-background'
              }`}
          >
            <Heart size={16} className="sm:w-[18px] sm:h-[18px]" fill={isWishlisted ? 'currentColor' : 'none'} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              openQuickView(product);
            }}
            className="p-1.5 sm:p-2 bg-background/80 rounded-full backdrop-blur-sm text-foreground hover:bg-background transition-colors"
          >
            <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
          </motion.button>
        </motion.div>

        {/* Quick Add Button */}
        {!isOutOfStock && (
          <motion.button
            initial={{ y: '100%' }}
            animate={{ y: isHovered ? 0 : '100%' }}
            className="absolute bottom-0 w-full bg-[#1e1b0f]/90 backdrop-blur-md text-foreground py-3 sm:py-4 flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:text-accent transition-all group lg:opacity-0 lg:group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
          >
            <ShoppingBag size={18} className="transition-transform group-hover:-translate-y-0.5" />
            Quick Add
          </motion.button>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 text-center">
        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <h3
          className="font-serif text-lg text-foreground mb-2 line-clamp-1 cursor-pointer hover:text-accent transition-colors"
          onClick={() => navigate(productUrl)}
        >
          {product.name}
        </h3>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-accent font-semibold">৳ {product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-muted-foreground line-through text-sm opacity-50">
              ৳ {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        <div className="text-[10px] uppercase tracking-wider font-medium">
          {isOutOfStock ? (
            <span className="text-destructive font-bold uppercase">Sold Out</span>
          ) : product.stock <= 5 ? (
            <span className="text-amber-500 font-bold">Only {product.stock} Left!</span>
          ) : (
            <span className="text-green-500/80 tracking-[0.1em]">{product.stock} In Stock</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
