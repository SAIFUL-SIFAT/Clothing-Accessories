import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
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

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

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

                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex -ml-4 py-4">
                        {products.map((product, index) => (
                            <div
                                key={product.id}
                                className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] pl-4"
                            >
                                <ProductCard
                                    product={product}
                                    type={type}
                                    onAddToCart={onAddToCart}
                                    index={index}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductCarousel;
