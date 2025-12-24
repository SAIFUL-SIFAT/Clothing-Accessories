import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
import { useState } from 'react';

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isSale?: boolean;
}

interface ProductCardProps {
  product: Product;
  type?: 'clothing' | 'ornament';
  onAddToCart: (product: Product) => void;
  index?: number;
}

const ProductCard = ({ product, type = 'clothing', onAddToCart, index = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden bg-card rounded-lg ${type === 'ornament' ? 'break-inside-avoid mb-4' : ''
        }`}
      style={{ boxShadow: 'var(--shadow-soft)' }}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden cursor-pointer">
        <motion.img
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />

        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-black/40"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
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
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
          className="absolute top-3 right-3 flex flex-col gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${isWishlisted
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-background/80 text-foreground hover:bg-background'
              }`}
          >
            <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-background/80 rounded-full backdrop-blur-sm text-foreground hover:bg-background transition-colors"
          >
            <Eye size={18} />
          </motion.button>
        </motion.div>

        {/* Quick Add Button */}
        <motion.button
          initial={{ y: '100%' }}
          animate={{ y: isHovered ? 0 : '100%' }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={() => onAddToCart(product)}
          className="absolute bottom-0 w-full bg-[#1e1b0f] backdrop-blur-sm text-foreground py-4 flex items-center justify-center gap-2 font-medium uppercase tracking-wider text-sm hover:text-[#bfa045] transition-colors"
        >
          <ShoppingBag size={18} />
          Quick Add
        </motion.button>
      </div>

      {/* Product Info */}
      <div className="p-4 text-center">
        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <h3 className="font-serif text-lg text-foreground mb-2 line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center justify-center gap-2">
          <span className="text-accent font-semibold">৳ {product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-muted-foreground line-through text-sm">
              ৳ {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
