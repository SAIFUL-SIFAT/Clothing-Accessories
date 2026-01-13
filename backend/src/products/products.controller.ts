import { Controller, Get, Param, Query, Post, Body, Patch, Delete, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import type { Request } from 'express';

import { CreateProductDto } from './dto/create-product.dto';
@Controller('products')
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly configService: ConfigService,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    @Get()
    findAll(
        @Query('type') type?: 'clothing' | 'ornament',
        @Query('q') q?: string,
        @Query('material') material?: string,
        @Query('occasion') occasion?: string,
        @Query('color') color?: string,
        @Query('category') category?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('sortBy') sortBy?: 'price' | 'name' | 'date',
        @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
        @Query('inStock') inStock?: string,
    ) {
        return this.productsService.findAll({
            type,
            search: q,
            material,
            occasion,
            color,
            category,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            sortBy,
            sortOrder,
            inStock: inStock === 'true',
        });
    }

    @Get('filters/metadata')
    getFilterMetadata() {
        return this.productsService.getFilterMetadata();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(+id);
    }

    @Post()
    async create(@Body() createProductDto: CreateProductDto) {
        return await this.productsService.create(createProductDto);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                return callback(new Error('Only image files are allowed!'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        }
    }))
    async uploadFile(@UploadedFile() file: any) {
        if (!file) {
            throw new Error('File upload failed');
        }

        try {
            const result = await this.cloudinaryService.uploadFile(file);
            return {
                filename: result.public_id,
                path: result.secure_url,
                url: result.secure_url
            };
        } catch (error) {
            throw new Error(`Cloudinary upload failed: ${error.message}`);
        }
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProductDto: any) {
        return this.productsService.update(+id, updateProductDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productsService.remove(+id);
    }
}
