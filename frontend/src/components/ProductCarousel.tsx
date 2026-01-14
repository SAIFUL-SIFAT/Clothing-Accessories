import React, { useCallback, useState, useRef, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ChevronDown, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard, { Product } from './ProductCard';

interface ProductCarouselProps {
    title: string;
    subtitle?: string;
    products: Product[];
    type?: 'clothing' | 'ornament';
    onAddToCart: (product: Product) => void;
}

const ProductCarousel = ({
    title,
    subtitle,
    products,
    type = 'clothing',
    onAddToCart
}: ProductCarouselProps) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: true });
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const filters = ['All', 'Ring', 'Hair clips', 'Hair bands', 'Jewellery set'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    // Re-initialize Embla when products change
    useEffect(() => {
        if (emblaApi) emblaApi.reInit();
    }, [emblaApi, selectedFilter]);

    const filteredProducts = selectedFilter === 'All'
        ? products
        : products.filter(p => p.category?.toLowerCase() === selectedFilter.toLowerCase());

    if (!products || products.length === 0) return null;

    return (
        <section className={`py-12 ${type === 'ornament' ? 'bg-secondary/50' : 'bg-background'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-8">
                    <div className="text-left">
                        {subtitle && (
                            <p className={`text-sm uppercase tracking-[0.3em] mb-2 ${type === 'ornament' ? 'text-gold' : 'text-accent'
                                }`}>
                                {subtitle}
                            </p>
                        )}
                        <h2 className={`font-serif text-3xl md:text-4xl ${type === 'ornament' ? 'text-cream' : 'text-foreground'
                            }`}>
                            {title}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Filter Dropdown */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all duration-300 group ${type === 'ornament'
                                    ? 'border-gold/30 text-gold hover:border-gold bg-[#14120a]'
                                    : 'border-accent/30 text-accent hover:border-accent bg-accent/5'
                                    }`}
                            >
                                <Filter size={14} className="group-hover:scale-110 transition-transform sm:w-4 sm:h-4" />
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">{selectedFilter}</span>
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-300 sm:w-4 sm:h-4 ${isMenuOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className={`absolute right-0 mt-2 w-40 sm:w-48 rounded-xl shadow-2xl border backdrop-blur-md z-50 overflow-hidden ${type === 'ornament'
                                            ? 'bg-[#1c190e] border-gold/20'
                                            : 'bg-white border-accent/20'
                                            }`}
                                    >
                                        <div className="py-1">
                                            {filters.map((filter) => (
                                                <button
                                                    key={filter}
                                                    onClick={() => {
                                                        setSelectedFilter(filter);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-xs sm:text-sm transition-colors ${selectedFilter === filter
                                                        ? (type === 'ornament' ? 'bg-gold text-primary' : 'bg-accent text-white')
                                                        : (type === 'ornament' ? 'text-cream hover:bg-gold/10' : 'text-foreground hover:bg-accent/10')
                                                        }`}
                                                >
                                                    {filter}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={scrollPrev}
                                aria-label="Previous slide"
                                className={`p-2 rounded-full border transition-colors ${type === 'ornament'
                                    ? 'border-gold text-gold hover:bg-gold hover:text-primary'
                                    : 'border-accent text-accent hover:bg-accent hover:text-white'
                                    }`}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={scrollNext}
                                aria-label="Next slide"
                                className={`p-2 rounded-full border transition-colors ${type === 'ornament'
                                    ? 'border-gold text-gold hover:bg-gold hover:text-primary'
                                    : 'border-accent text-accent hover:bg-accent hover:text-white'
                                    }`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex -ml-4 py-4">
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={`${selectedFilter}-${product.id}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] pl-4"
                                >
                                    <ProductCard
                                        product={product}
                                        type={type}
                                        onAddToCart={onAddToCart}
                                        index={index}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
                {filteredProducts.length === 0 && (
                    <div className="py-20 text-center">
                        <p className={`text-lg font-serif italic ${type === 'ornament' ? 'text-gold/60' : 'text-muted-foreground'
                            }`}>
                            No pieces found in this category.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductCarousel;
