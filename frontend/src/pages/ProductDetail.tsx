import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productApi } from '@/api/services';
import ProductCard, { Product } from '@/components/ProductCard';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/context/WishlistContext';
import PageLayout from '@/components/PageLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, ArrowLeft, Loader2, Sparkles, ShieldCheck, Truck, RefreshCcw, Share2, PackageSearch } from 'lucide-react';
import { toast } from 'sonner';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                if (!id) return;
                const res = await productApi.getById(parseInt(id));
                setProduct(res.data);

                // Fetch related products
                const relatedRes = await productApi.getAll({
                    category: res.data.category,
                    type: res.data.type,
                    limit: 4
                });
                setRelatedProducts(relatedRes.data.filter((p: Product) => p.id !== res.data.id).slice(0, 4));

                // Scroll to top when product changes
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (error) {
                console.error('Failed to fetch product:', error);
                toast.error('Product not found');
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-accent" />
            </div>
        );
    }

    if (!product) return null;

    const isWishlisted = isInWishlist(product.id);
    const isOutOfStock = product.stock <= 0;

    return (
        <PageLayout>
            <div className="pt-24 pb-20 min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs / Back button */}
                    <Link
                        to={product.type === 'ornament' ? '/ornaments' : '/collections'}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group w-fit"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to {product.type === 'ornament' ? 'Ornaments' : 'Collections'}</span>
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
                        {/* Image Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative aspect-[4/5] rounded-[32px] overflow-hidden bg-muted group"
                        >
                            <img
                                src={product.image?.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${product.image}`}
                                alt={product.name}
                                crossOrigin="anonymous"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {product.isNew && (
                                <div className="absolute top-6 left-6 px-4 py-1.5 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-widest rounded-full shadow-xl">
                                    New Arrival
                                </div>
                            )}
                        </motion.div>

                        {/* Info Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col justify-center space-y-8"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-accent">
                                    <Sparkles size={16} />
                                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold">{product.category}</span>
                                </div>
                                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl font-serif text-accent">৳ {product.price.toLocaleString()}</span>
                                    {product.originalPrice && (
                                        <span className="text-xl text-muted-foreground line-through opacity-50">
                                            ৳ {product.originalPrice.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-muted-foreground text-lg leading-relaxed font-light">
                                {product.description || "Indulge in the timeless elegance of our handcrafted pieces. Each ornament is meticulously designed to celebrate tradition with a modern touch, ensuring you shine on every occasion."}
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Material</span>
                                    <span className="text-sm font-medium">{product.material || "Premium Quality"}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Availability</span>
                                    <span className={`text-sm font-medium ${isOutOfStock ? 'text-destructive' : 'text-green-400'}`}>
                                        {isOutOfStock ? 'Sold Out' : `${product.stock} in stock`}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    disabled={isOutOfStock}
                                    onClick={() => {
                                        addToCart(product);
                                        toast.success(`${product.name} added to cart!`);
                                    }}
                                    className="flex-1 bg-accent text-accent-foreground py-4 rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest hover:bg-[#a68b3d] transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl shadow-accent/20"
                                >
                                    <ShoppingBag size={20} />
                                    {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                                </button>
                                <button
                                    onClick={() => isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}
                                    className={`p-4 rounded-2xl border transition-all flex items-center justify-center ${isWishlisted
                                        ? 'bg-destructive/10 border-destructive/20 text-destructive'
                                        : 'bg-muted border-border text-foreground hover:bg-muted/80'
                                        }`}
                                >
                                    <Heart size={24} fill={isWishlisted ? 'currentColor' : 'none'} />
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        toast.success('Link copied to clipboard!');
                                    }}
                                    className="p-4 rounded-2xl border border-border bg-muted text-foreground hover:bg-muted/80 transition-all flex items-center justify-center"
                                    title="Share Product"
                                >
                                    <Share2 size={24} />
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-border mt-4">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Truck size={18} className="text-accent" />
                                    <span className="text-[10px] uppercase tracking-wider font-medium">Fast Shipping</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <ShieldCheck size={18} className="text-accent" />
                                    <span className="text-[10px] uppercase tracking-wider font-medium">Secure Payment</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <RefreshCcw size={18} className="text-accent" />
                                    <span className="text-[10px] uppercase tracking-wider font-medium">Easy Returns</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Related Products Section */}
                    {relatedProducts.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-12"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-[10px] uppercase tracking-[0.3em] font-bold">
                                    <PackageSearch size={14} />
                                    Complete The Look
                                </div>
                                <h2 className="font-serif text-4xl md:text-5xl text-foreground">
                                    Related <span className="text-accent italic">Treasures</span>
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {relatedProducts.map((p, idx) => (
                                    <ProductCard
                                        key={p.id}
                                        product={p}
                                        index={idx}
                                        onAddToCart={addToCart}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default ProductDetail;
