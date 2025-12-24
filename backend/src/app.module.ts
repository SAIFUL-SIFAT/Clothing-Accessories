import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { ProductsService } from './products/products.service';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: process.env.DB_PASS ?? 'postgres123',
      database: 'petal_&_pearl',
      entities: [Product, User],
      synchronize: true
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    ProductsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly productsService: ProductsService) { }

  async onApplicationBootstrap() {
    // Basic seeding logic
    const count = await this.productsService.count();
    if (count === 0) {
      console.log('Seeding initial products data...');

      const clothingProducts = [
        { name: 'Emerald Jamdani Three-Piece', price: 12500, image: '/assets/clothing-1.jpg', category: 'Three-Piece Suite', isNew: true, type: 'clothing' },
        { name: 'Royal Gold Muslin Set', price: 15000, originalPrice: 18000, image: '/assets/clothing-2.jpg', category: 'Three-Piece Suite', isSale: true, type: 'clothing' },
        { name: 'Ivory Silk Ensemble', price: 9800, image: '/assets/clothing-3.jpg', category: 'Three-Piece Suite', type: 'clothing' },
        { name: 'Festive Maroon Collection', price: 11200, image: '/assets/clothing-4.jpg', category: 'Three-Piece Suite', isNew: true, type: 'clothing' },
        { name: 'Ocean Blue Chiffon Suite', price: 8500, image: '/assets/clothing-5.jpg', category: 'Three-Piece Suite', type: 'clothing' },
        { name: 'Blush Pink Embroidered Set', price: 13500, originalPrice: 16000, image: '/assets/clothing-1.jpg', category: 'Three-Piece Suite', isSale: true, type: 'clothing' },
        { name: 'Classic Black Formal', price: 10500, image: '/assets/clothing-2.jpg', category: 'Three-Piece Suite', type: 'clothing' },
        { name: 'Lavender Dream Suite', price: 9200, image: '/assets/clothing-3.jpg', category: 'Three-Piece Suite', isNew: true, type: 'clothing' },
      ];

      const ornamentProducts = [
        { name: 'Pearl Drop Earrings', price: 2500, image: '/assets/ornament-1.jpg', category: 'Earrings', isNew: true, type: 'ornament' },
        { name: 'Gold Jhumka Set', price: 4500, image: '/assets/ornament-2.jpg', category: 'Earrings', type: 'ornament' },
        { name: 'Crystal Choker Necklace', price: 6800, originalPrice: 8500, image: '/assets/ornament-3.jpg', category: 'Necklace', isSale: true, type: 'ornament' },
        { name: 'Kundan Bridal Set', price: 18500, image: '/assets/ornament-4.jpg', category: 'Bridal Set', isNew: true, type: 'ornament' },
        { name: 'Antique Bangles (Set of 6)', price: 3200, image: '/assets/ornament-5.jpg', category: 'Bangles', type: 'ornament' },
        { name: 'Temple Pendant Necklace', price: 5500, image: '/assets/ornament-6.jpg', category: 'Necklace', type: 'ornament' },
        { name: 'Diamond Nose Pin', price: 1800, image: '/assets/ornament-7.jpg', category: 'Nose Pin', isNew: true, type: 'ornament' },
        { name: 'Ruby Statement Ring', price: 7200, originalPrice: 9000, image: '/assets/ornament-8.jpg', category: 'Rings', isSale: true, type: 'ornament' },
      ];

      await this.productsService.createMany([...clothingProducts, ...ornamentProducts] as any);
      console.log('Seeding completed.');
    }
  }
}
