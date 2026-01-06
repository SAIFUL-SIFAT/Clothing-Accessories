import { Controller, Get, Param, Query, Post, Body, Patch, Delete, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import { CreateProductDto } from './dto/create-product.dto';
@Controller('products')
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly configService: ConfigService
    ) { }

    @Get()
    findAll(
        @Query('type') type?: 'clothing' | 'ornament',
        @Query('q') q?: string,
        @Query('material') material?: string,
        @Query('occasion') occasion?: string,
        @Query('color') color?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
    ) {
        return this.productsService.findAll({
            type,
            search: q,
            material,
            occasion,
            color,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
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
        storage: diskStorage({
            destination: './public/assets',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = extname(file.originalname);
                const filename = `product-${uniqueSuffix}${ext}`;
                callback(null, filename);
            }
        }),
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
    uploadFile(@UploadedFile() file: any, @Req() req: Request) {
        if (!file) {
            throw new Error('File upload failed');
        }

        const protocol = req.protocol;
        const host = req.get('host');
        const baseUrl = this.configService.get('BACKEND_URL') || `${protocol}://${host}`;

        return {
            filename: file.filename,
            path: `/assets/${file.filename}`,
            url: `${baseUrl}/assets/${file.filename}`
        };
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
