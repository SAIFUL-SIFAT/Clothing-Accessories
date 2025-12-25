import { motion } from 'framer-motion';

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80"
                alt="Artisan crafting traditional Bangladeshi textiles"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative Frame */}
            <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-accent rounded-lg -z-10" />

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-8 -left-8 bg-[#1c1a0e] text-primary p-6 rounded-lg shadow-xl"
            >
              <p className="text-4xl font-serif text-accent mb-1">15+</p>
              <p className="text-sm text-primary/70">Years of Excellence</p>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:pl-8"
          >
            <p className="text-accent uppercase tracking-[0.3em] text-sm mb-4">Our Story</p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-6 leading-tight">
              Where Tradition Meets
              <span className="block text-accent">Modern Elegance</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Petal & Pearl was born from a deep appreciation for Bangladesh's rich textile heritage
                and a vision to bring artisanal craftsmanship to the modern woman.
              </p>
              <p>
                Each piece in our collection tells a story—from the intricate Jamdani weaves
                passed down through generations to the delicate pearl ornaments crafted by
                skilled artisans in local workshops.
              </p>
              <p>
                We believe in slow fashion, sustainable practices, and celebrating the
                beauty of handmade creations that carry the soul of their makers.
              </p>
            </div>

            <div className="flex gap-8 mt-8">
              <div>
                <p className="text-3xl font-serif text-accent">500+</p>
                <p className="text-sm text-muted-foreground">Unique Designs</p>
              </div>
              <div>
                <p className="text-3xl font-serif text-accent">50+</p>
                <p className="text-sm text-muted-foreground">Partner Artisans</p>
              </div>
              <div>
                <p className="text-3xl font-serif text-accent">10k+</p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="btn-luxury border-foreground text-foreground hover:bg-foreground hover:text-background mt-10"
            >
              Learn More About Us
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
