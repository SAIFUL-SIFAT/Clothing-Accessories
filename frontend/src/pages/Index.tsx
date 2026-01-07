import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import FeaturesSection from '@/components/FeaturesSection';
import AboutSection from '@/components/AboutSection';
import PageLayout from '@/components/PageLayout';
import { useCart } from '@/hooks/use-cart';
import { productApi } from '@/api/services';
import ProductCarousel from '@/components/ProductCarousel';

const Index = () => {
  const { addToCart } = useCart();
  const [clothing, setClothing] = useState([]);
  const [ornaments, setOrnaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const [clothingRes, ornamentsRes] = await Promise.all([
          productApi.getAll({ type: 'clothing' }),
          productApi.getAll({ type: 'ornament' }),
        ]);

        if (clothingRes?.data) setClothing(clothingRes.data);
        if (ornamentsRes?.data) setOrnaments(ornamentsRes.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <PageLayout>
      {/* Hero Section */}
      <Hero />

      {/* Features Bar */}
      <FeaturesSection />

      {/* Ornaments Section */}
      <ProductGrid
        title="Handcrafted Ornaments"
        subtitle="Timeless Jewelry"
        products={ornaments}
        type="ornament"
        onAddToCart={addToCart}
      />

      {ornaments.length > 0 && (
        <ProductCarousel
          title="Trending Pieces"
          subtitle="Most Loved"
          products={ornaments}
          type="ornament"
          onAddToCart={addToCart}
        />
      )}

      {/* About Section */}
      <AboutSection />

      {/* Clothing (Collection) Section - Coming Soon Mode */}
      <section id="collections" className="py-24 bg-background relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-accent uppercase tracking-[0.4em] text-sm font-medium">Summer 2025</p>
            <h2 className="font-serif text-5xl md:text-7xl text-foreground mb-4">Exclusive <span className="italic text-accent">Collection</span></h2>

            <div className="flex items-center justify-center gap-4 py-8">
              <div className="h-px w-12 bg-accent/20" />
              <div className="text-2xl md:text-3xl font-serif italic text-accent/80 tracking-widest px-6 py-2 border border-accent/20 rounded-full bg-accent/5">
                Coming Soon
              </div>
              <div className="h-px w-12 bg-accent/20" />
            </div>

            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed font-light">
              Our signature three-piece suites are currently being crafted with the finest Jamdani weaves.
              The new collection will be unveiled soon.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 
      // ORIGINAL CLOTHING SECTIONS (Commented out for later use)
      <ProductGrid
        title="Three-Piece Suites"
        subtitle="Exclusive Collection"
        products={clothing}
        type="clothing"
        onAddToCart={addToCart}
      />

      {clothing.length > 0 && (
        <ProductCarousel
          title="New Arrivals"
          subtitle="Just In"
          products={clothing}
          type="clothing"
          onAddToCart={addToCart}
        />
      )}
      */}
    </PageLayout>
  );
};

export default Index;
