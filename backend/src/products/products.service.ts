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

    findAll(type?: 'clothing' | 'ornament', search?: string) {
        if (search) {
            return this.productsRepository.find({
                where: [
                    { ...(type ? { type } : {}), name: ILike(`%${search}%`) },
                    { ...(type ? { type } : {}), category: ILike(`%${search}%`) }
                ]
            });
        }

        return this.productsRepository.find({
            where: type ? { type } : {}
        });
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
