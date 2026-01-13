import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import ProductCard, { Product } from './ProductCard';
import { useEffect, useState } from 'react';
import { productApi } from '@/api/services';

interface QuickViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onAddToCart: (product: Product) => void;
}

const QuickViewModal = ({ isOpen, onClose, product, onAddToCart }: QuickViewModalProps) => {
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (product) {
            const fetchRelated = async () => {
                try {
                    // Fetch products of the same type/category
                    const response = await productApi.getAll({ type: product.type });
                    // Filter out current product and take 4
                    const related = response.data
                        .filter((p: Product) => p.id !== product.id)
                        .slice(0, 4);
                    setRelatedProducts(related);
                } catch (error) {
                    console.error("Failed to fetch related products", error);
                }
            };
            fetchRelated();
        }
    }, [product]);

    if (!product) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative w-full max-w-5xl bg-card rounded-2xl shadow-2xl flex flex-col z-[101] max-h-[90vh] overflow-hidden"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-md transition-colors z-[102]"
                        >
                            <X size={24} />
                        </button>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            <div className="flex flex-col md:flex-row">
                                <div className="w-full md:w-1/2 aspect-square md:aspect-auto relative bg-muted shrink-0 min-h-[400px]">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        crossOrigin="anonymous"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
                                    <h2 className="text-sm font-medium tracking-widest text-[#BFA045] uppercase mb-2">
                                        {product.category}
                                    </h2>
                                    <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
                                        {product.name}
                                    </h1>
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="text-2xl font-semibold text-accent">৳{product.price.toLocaleString()}</span>
                                        {product.originalPrice && (
                                            <span className="text-lg text-muted-foreground line-through">
                                                ৳{product.originalPrice.toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mb-6">
                                        <div className="text-[10px] uppercase tracking-wider font-medium">
                                            {product.stock <= 0 ? (
                                                <span className="text-destructive">Out of Stock</span>
                                            ) : product.stock <= 5 ? (
                                                <span className="text-amber-500">Only {product.stock} left in stock!</span>
                                            ) : (
                                                <span className="text-green-400">In Stock ({product.stock} available)</span>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-muted-foreground leading-relaxed mb-8 flex-1 whitespace-pre-wrap break-words">
                                        {product.description || `Experience luxury with our ${product.name}, meticulously crafted to bring out your inner elegance. Perfect for special occasions or adding a touch of sophistication to your daily wear.`}
                                    </p>

                                    <button
                                        onClick={() => {
                                            onAddToCart(product);
                                            onClose();
                                        }}
                                        disabled={product.stock <= 0}
                                        className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 mb-4 ${product.stock <= 0
                                            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                                            : 'bg-accent text-accent-foreground hover:bg-[#a68b3d]'
                                            }`}
                                    >
                                        <ShoppingBag size={20} />
                                        {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>

                            {/* Related Products Section */}
                            {/* {relatedProducts.length > 0 && (
                                <div className="p-6 md:p-8 border-t border-border/50 bg-black/20">
                                    <h3 className="font-serif text-2xl mb-6 text-foreground">You May Also Like</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {relatedProducts.map((related) => (
                                            <ProductCard
                                                key={related.id}
                                                product={related}
                                                onAddToCart={onAddToCart}
                                                type={related.type}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )} */}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default QuickViewModal;
