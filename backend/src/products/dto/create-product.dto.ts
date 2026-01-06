import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsArray } from 'class-validator';

export class CreateProductDto {
    @IsString()
    name: string;

    @IsNumber()
    price: number;

    @IsOptional()
    @IsNumber()
    originalPrice?: number;

    @IsString()
    image: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    category: string;

    @IsBoolean()
    @IsOptional()
    isNew?: boolean;

    @IsBoolean()
    @IsOptional()
    isSale?: boolean;

    @IsEnum(['clothing', 'ornament'])
    type: 'clothing' | 'ornament';

    @IsNumber()
    @IsOptional()
    stock?: number;

    @IsOptional()
    @IsString()
    material?: string;

    @IsOptional()
    @IsString()
    occasion?: string;

    @IsOptional()
    @IsString()
    color?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}
