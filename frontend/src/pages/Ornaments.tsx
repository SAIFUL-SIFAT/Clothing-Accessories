import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, SlidersHorizontal, Trash2, X, ArrowLeft } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import PageLayout from '@/components/PageLayout';
import FilterSidebar from '@/components/FilterSidebar';
import { useCart } from '@/hooks/use-cart';
import { productApi } from '@/api/services';
import { Link } from 'react-router-dom';

const Ornaments = () => {
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
        category: null,
        minPrice: null,
        maxPrice: null,
        inStock: false,
        sortBy: 'date',
        sortOrder: 'DESC' as 'ASC' | 'DESC'
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
                type: 'ornament',
                ...activeFilters
            };
            const res = await productApi.getAll(params);
            setProducts(res.data);
        } catch (error) {
            console.error('Failed to fetch ornaments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [activeFilters]);

    const handleFilterChange = (key: string | Record<string, any>, value?: any) => {
        if (typeof key === 'object') {
            setActiveFilters(prev => ({ ...prev, ...key }));
        } else {
            setActiveFilters(prev => ({ ...prev, [key]: value }));
        }
    };

    const resetFilters = () => {
        setActiveFilters({
            material: null,
            occasion: null,
            color: null,
            category: null,
            minPrice: null,
            maxPrice: null,
            inStock: false,
            sortBy: 'date',
            sortOrder: 'DESC'
        });
    };

    const activeFilterCount = Object.values(activeFilters).filter(v => v !== null).length;

    return (
        <PageLayout showFooter={false}>
            <div className="pt-32 pb-20 bg-secondary/30 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Return to Home Link */}
                    <Link to="/">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 mb-8 px-4 py-3 bg-[#1a3a2e] text-[#a8c5b8] hover:bg-[#234438] transition-colors rounded-lg cursor-pointer"
                        >
                            <ArrowLeft size={18} />
                            <span className="text-sm font-medium">Return to Home</span>
                        </motion.div>
                    </Link>

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="max-w-2xl"
                        >
                            <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-4 leading-tight">
                                Timeless <span className="text-gold italic">Ornaments</span>
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Discover our exquisite range of handcrafted jewelry and majestic bridal sets.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-3"
                        >
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={resetFilters}
                                    className="p-3 text-muted-foreground hover:text-destructive transition-colors border border-border rounded-xl"
                                    title="Reset Filters"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                            <button
                                onClick={() => setIsFilterOpen(true)}
                                className="flex items-center gap-3 bg-card border border-gold/20 px-6 py-3 rounded-xl hover:bg-muted transition-all group"
                            >
                                <div className="relative">
                                    <SlidersHorizontal size={20} className="text-gold" />
                                </div>
                                <span className="text-sm font-bold uppercase tracking-widest text-gold text-shadow-sm">Filters</span>
                            </button>
                        </motion.div>
                    </div>

                    {/* Active Filter Chips */}
                    <AnimatePresence>
                        {activeFilterCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-wrap gap-2 mb-8"
                            >
                                {Object.entries(activeFilters).map(([key, value]) => {
                                    if (!value) return null;

                                    // Skip default sorting for chips
                                    if (key === 'sortBy' && value === 'date' && activeFilters.sortOrder === 'DESC') return null;
                                    if (key === 'sortOrder') return null;

                                    let displayValue = value;
                                    let displayKey = key;

                                    if (key === 'inStock') {
                                        displayKey = 'Availability';
                                        displayValue = 'In Stock';
                                    } else if (key === 'minPrice') {
                                        displayKey = 'Min Price';
                                        displayValue = `৳${value}`;
                                    } else if (key === 'maxPrice') {
                                        displayKey = 'Max Price';
                                        displayValue = `৳${value}`;
                                    } else if (key === 'sortBy') {
                                        displayKey = 'Sorted By';
                                        const orderLabel = activeFilters.sortOrder === 'ASC' ?
                                            (value === 'price' ? 'Low to High' : value === 'name' ? 'A-Z' : 'Oldest First') :
                                            (value === 'price' ? 'High to Low' : value === 'name' ? 'Z-A' : 'Newest First');
                                        displayValue = `${value.charAt(0).toUpperCase() + value.slice(1)} (${orderLabel})`;
                                    }

                                    return (
                                        <span key={key} className="flex items-center gap-2 bg-gold/10 border border-gold/20 px-4 py-1.5 rounded-full text-xs text-gold font-medium">
                                            <span className="capitalize text-[10px] opacity-60 mr-1">{displayKey}:</span> {displayValue}
                                            <button
                                                onClick={() => {
                                                    if (key === 'sortBy') {
                                                        handleFilterChange({ sortBy: 'date', sortOrder: 'DESC' });
                                                    } else {
                                                        handleFilterChange(key, key === 'inStock' ? false : null);
                                                    }
                                                }}
                                                className="hover:text-foreground"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="aspect-square bg-muted animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <ProductGrid
                            title=""
                            products={products}
                            type="ornament"
                            onAddToCart={addToCart}
                            showViewAll={false}
                        />
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-gold/20 rounded-3xl">
                            <Filter size={48} className="mx-auto text-gold mb-4 opacity-20" />
                            <h3 className="text-2xl font-serif text-cream mb-2">No ornaments found</h3>
                            <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
                            <button onClick={resetFilters} className="mt-6 text-gold font-bold uppercase tracking-widest text-sm hover:underline">
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <FilterSidebar
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                metadata={filterMetadata}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
            />
        </PageLayout>
    );
};

export default Ornaments;
