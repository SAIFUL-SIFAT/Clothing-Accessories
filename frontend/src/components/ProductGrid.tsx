import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard, { Product } from './ProductCard';

interface ProductGridProps {
  title: string;
  subtitle?: string;
  products: Product[];
  type?: 'clothing' | 'ornament';
  onAddToCart: (product: Product) => void;
  showViewAll?: boolean;
  transparent?: boolean;
}

const ProductGrid = ({
  title,
  subtitle,
  products,
  type = 'clothing',
  onAddToCart,
  showViewAll = true,
  transparent = false
}: ProductGridProps) => {
  const backgroundClass = transparent ? '' : (type === 'ornament' ? 'bg-secondary' : 'bg-background');
  const paddingClass = transparent ? '' : 'py-20';

  return (
    <section
      id={type === 'clothing' ? 'collections' : 'ornaments'}
      className={`${paddingClass} ${backgroundClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          {subtitle && (
            <p className={`text-sm uppercase tracking-[0.3em] mb-3 ${type === 'ornament' ? 'text-gold' : 'text-accent'
              }`}>
              {subtitle}
            </p>
          )}
          <h2 className={`font-serif text-4xl md:text-5xl ${type === 'ornament' ? 'text-cream' : 'text-foreground'
            }`}>
            {title}
          </h2>

          {/* Decorative Line */}
          <div className="flex items-center justify-center mt-6 gap-3">
            <div className={`h-px w-12 ${type === 'ornament' ? 'bg-gold/30' : 'bg-accent/30'
              }`} />
            <div className={`w-2 h-2 rotate-45 ${type === 'ornament' ? 'bg-gold' : 'bg-accent'
              }`} />
            <div className={`h-px w-12 ${type === 'ornament' ? 'bg-gold/30' : 'bg-accent/30'
              }`} />
          </div>
        </motion.div>

        {/* Product Grid */}
        {type === 'ornament' ? (
          // Fixed Grid for Ornaments (was Masonry)
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                type="ornament"
                onAddToCart={onAddToCart}
                index={index}
              />
            ))}
          </div>
        ) : (
          // Standard Grid for Clothing
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                type="clothing"
                onAddToCart={onAddToCart}
                index={index}
              />
            ))}
          </div>
        )}

        {/* View All Button */}
        {showViewAll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to={type === 'ornament' ? '/ornaments' : '/collections'}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`btn-luxury ${type === 'ornament'
                  ? 'border-gold text-gold hover:bg-gold hover:text-primary'
                  : 'border-foreground text-foreground hover:bg-foreground hover:text-background'
                  }`}
              >
                View All {type === 'ornament' ? 'Ornaments' : 'Collection'}
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
