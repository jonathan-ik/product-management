import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReviewDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  review: string;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  product_name?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  product_image?: string;

  @IsString()
  @IsOptional()
  product_model?: string;

}

export class CreateProductDto {
    @IsString()
    product_name: string;
  
    @IsNumber()
    price: number;
  
    @IsString()
    description: string;
  
    @IsString()
    @IsOptional()
    product_image?: string;
  
    @IsString()
    product_model: string;
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReviewDto)
    @IsOptional() // Reviews are optional when creating a product
    reviews?: ReviewDto[];
  }