import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) { }

    async findAll(query: {
        type?: 'clothing' | 'ornament';
        search?: string;
        material?: string;
        occasion?: string;
        color?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        sortBy?: 'price' | 'name' | 'date';
        sortOrder?: 'ASC' | 'DESC';
        inStock?: boolean;
    }) {
        const {
            type, search, material, occasion, color, category,
            minPrice, maxPrice, sortBy, sortOrder, inStock
        } = query;

        const queryBuilder = this.productsRepository.createQueryBuilder('product');

        if (type) {
            queryBuilder.andWhere('product.type = :type', { type });
        }

        if (category) {
            queryBuilder.andWhere('product.category = :category', { category });
        }

        if (material) {
            queryBuilder.andWhere('product.material = :material', { material });
        }

        if (occasion) {
            queryBuilder.andWhere('product.occasion = :occasion', { occasion });
        }

        if (color) {
            queryBuilder.andWhere('product.color = :color', { color });
        }

        if (minPrice) {
            queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
        }

        if (maxPrice) {
            queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
        }

        if (inStock) {
            queryBuilder.andWhere('product.stock > 0');
        }

        if (search) {
            queryBuilder.andWhere(
                '(product.name ILIKE :search OR product.category ILIKE :search OR product.description ILIKE :search OR :search = ANY(product.tags))',
                { search: `%${search}%` }
            );
        }

        // Sorting
        const order = sortOrder || 'DESC';
        if (sortBy === 'price') {
            queryBuilder.orderBy('product.price', order);
        } else if (sortBy === 'name') {
            queryBuilder.orderBy('product.name', order);
        } else if (sortBy === 'date') {
            // Use createdAt if possible, fallback to id
            queryBuilder.orderBy('product.createdAt', order);
        } else {
            queryBuilder.orderBy('product.id', 'DESC');
        }

        // Always add id as a secondary sort for stability
        queryBuilder.addOrderBy('product.id', 'DESC');

        return queryBuilder.getMany();
    }

    async getFilterMetadata() {
        const materials = await this.productsRepository
            .createQueryBuilder('product')
            .select('DISTINCT product.material', 'material')
            .where('product.material IS NOT NULL')
            .getRawMany();

        const occasions = await this.productsRepository
            .createQueryBuilder('product')
            .select('DISTINCT product.occasion', 'occasion')
            .where('product.occasion IS NOT NULL')
            .getRawMany();

        const colors = await this.productsRepository
            .createQueryBuilder('product')
            .select('DISTINCT product.color', 'color')
            .where('product.color IS NOT NULL')
            .getRawMany();

        const categories = await this.productsRepository
            .createQueryBuilder('product')
            .select('DISTINCT product.category', 'category')
            .getRawMany();

        return {
            materials: materials.map(m => m.material),
            occasions: occasions.map(o => o.occasion),
            colors: colors.map(c => c.color),
            categories: categories.map(c => c.category),
        };
    }

    count() {
        return this.productsRepository.count();
    }

    findByType(type: 'clothing' | 'ornament') {
        return this.productsRepository.find({ where: { type } });
    }

    findOne(id: number) {
        return this.productsRepository.findOneBy({ id });
    }

    async create(productData: Partial<Product>) {
        const product = this.productsRepository.create(productData);
        return this.productsRepository.save(product);
    }

    async update(id: number, productData: Partial<Product>) {
        await this.productsRepository.update(id, productData);
        return this.productsRepository.findOneBy({ id });
    }

    async remove(id: number) {
        return this.productsRepository.delete(id);
    }

    async createMany(productsData: Partial<Product>[]) {
        const products = this.productsRepository.create(productsData);
        return this.productsRepository.save(products);
    }
}
