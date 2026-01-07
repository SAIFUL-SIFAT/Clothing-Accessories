import { useEffect, useState } from 'react';
import { motion /* , AnimatePresence */ } from 'framer-motion';
// import { Filter, SlidersHorizontal, Trash2, X } from 'lucide-react';
// import ProductGrid from '@/components/ProductGrid';
import PageLayout from '@/components/PageLayout';
// import FilterSidebar from '@/components/FilterSidebar';
// import { useCart } from '@/hooks/use-cart';
// import { productApi } from '@/api/services';

const Collections = () => {
    /* 
    // ORIGINAL COLLECTION LOGIC (Commented out for Coming Soon mode)
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [filterMetadata, setFilterMetadata] = useState({
        materials: [],
        occasions: [],
        colors: [],
        categories: []
    });
    const [activeFilters, setActiveFilters] = useState({
        material: null,
        occasion: null,
        color: null,
        category: null
    });

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await productApi.getFilterMetadata();
                setFilterMetadata(res.data);
            } catch (error) {
                console.error('Failed to fetch filter metadata:', error);
            }
        };
        fetchMetadata();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const params = {
                type: 'clothing',
                ...activeFilters
            };
            const res = await productApi.getAll(params);
            setProducts(res.data);
        } catch (error) {
            console.error('Failed to fetch collections:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [activeFilters]);

    const handleFilterChange = (key: string, value: string | null) => {
        setActiveFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setActiveFilters({
            material: null,
            occasion: null,
            color: null,
            category: null
        });
    };

    const activeFilterCount = Object.values(activeFilters).filter(v => v !== null).length;
    */

    return (
        <PageLayout>
            <div className="pt-32 pb-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-[10px] uppercase tracking-[0.3em] font-bold"
                    >
                        Preview Mode
                    </motion.div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Coming Soon Content */}
                    <div className="py-10 text-center relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="bg-card/30 backdrop-blur-md border border-accent/20 rounded-[40px] p-12 md:p-24 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />

                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03]"
                            >
                                <svg width="600" height="600" viewBox="0 0 100 100">
                                    <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="currentColor" />
                                </svg>
                            </motion.div>

                            <div className="relative z-10 space-y-8">
                                <div className="inline-flex items-center gap-4 px-6 py-2 bg-accent/10 border border-accent/20 rounded-full">
                                    <div className="w-2 h-2 bg-accent animate-pulse rounded-full" />
                                    <span className="text-accent text-sm font-bold uppercase tracking-[0.3em]">Exclusively Crafting</span>
                                </div>

                                <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl text-foreground">
                                    Summer <span className="text-accent italic">2025</span>
                                </h2>

                                <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                                    The grand collection of Jamdani three-piece suites is currently being prepared by our master weavers.
                                    Expect the unexpected this festive season.
                                </p>

                                <div className="pt-10">
                                    <div className="text-3xl md:text-4xl font-serif italic text-accent tracking-[0.2em]">
                                        Coming Soon
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* 
                    // ORIGINAL JSX (Commented out)
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-4 leading-tight">
                                    Seasonal <span className="text-accent italic">Collections</span>
                                </h1>
                            </motion.div>
                            <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-3 bg-card border border-border px-6 py-3 rounded-xl hover:bg-muted transition-all">
                                <span className="text-sm font-bold uppercase tracking-widest">Filters</span>
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />)}
                            </div>
                        ) : (
                            <ProductGrid products={products} type="clothing" onAddToCart={addToCart} showViewAll={false} />
                        )}
                    </div>

                    <FilterSidebar
                        isOpen={isFilterOpen}
                        onClose={() => setIsFilterOpen(false)}
                        metadata={filterMetadata}
                        activeFilters={activeFilters}
                        onFilterChange={handleFilterChange}
                        onReset={resetFilters}
                    />
                    */}
                </div>
            </div>
        </PageLayout>
    );
};

export default Collections;
