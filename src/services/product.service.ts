import { HttpException } from '../exceptions/HttpException';
import { Product } from '../interfaces/product.interface';
import { ProductModel } from '../models/product.model';
import { Document } from 'mongoose';

export class ProductService {
  public productModel = ProductModel;
  public async findAllProduct(): Promise<Product[]> {
    const products: Product[] = await this.productModel.find();
    return products;
  }

  public async findProductById(productId: string): Promise<Product> {
    const findProduct: Product = await this.productModel.findOne({ _id: productId });
    if (!findProduct) throw new HttpException(409, "Product doesn't exist");

    return findProduct;
  }
  public async findProductsByName(productName: string): Promise<Product[]> {
    const findProducts: Product[] = await this.productModel.find({
      product_name: productName
    });
    
    if (findProducts.length === 0) throw new HttpException(404, "No products found with that name");
  
    return findProducts;
  }
  

  public async createProduct(productData: Product): Promise<Product> {
    // Correct the query to properly check both product_name and product_model
    const findProduct: Product | null = await this.productModel.findOne({
      product_name: productData.product_name,
      product_model: productData.product_model
    });
  
    // Check if the product already exists and throw an exception
    if (findProduct) {
      throw new HttpException(409, `This product ${productData.product_name} with model ${productData.product_model} already exists`);
    }
  
    // Create the product if it doesn't exist
    const createProductData: Product = await this.productModel.create({ ...productData });
  
    return createProductData;
  }
  

  public async updateProduct(productId: string, productData: Partial<Product>): Promise<Product> {
    // Check if the product exists by ID
    const findProduct: Product | null = await this.productModel.findById(productId);
  
    if (!findProduct) {
      throw new HttpException(404, `Product with ID ${productId} not found`);
    }
  // Update the product with the provided data, excluding the reviews array
    const { reviews, ...updateData } = productData; 
    // Update the product with the provided data, excluding the reviews array
    const updatedProduct: Product = await this.productModel.findByIdAndUpdate(
      productId, 
      { ...updateData }, 
      { new: true } 
    );
    return updatedProduct;
  }
  

  public async addProductReview(productId: string, reviewData: { id: string; name: string; review: string }): Promise<Product & Document> {
    // Find the product by ID
    const findProduct = await this.productModel.findById(productId);
  
    if (!findProduct) {
      throw new HttpException(404, `Product with ID ${productId} not found`);
    }
  
    // Ensure that reviews is an array before pushing
    if (!Array.isArray(findProduct.reviews)) {
      findProduct.reviews = []; 
    }
    // Add the new review to the reviews array
    findProduct.reviews.push(reviewData);

    const updatedProduct = await findProduct.save();
    return updatedProduct;
  }
  

  public async updateProductImage(productId: string, product_image: string): Promise<Product> {
    const updateProductById: Product = await this.productModel.findByIdAndUpdate(productId, {product_image: product_image}, {new: true, runValidators: true})
    if (!updateProductById) throw new HttpException(409, "Product doesn't exist")

    return updateProductById;
  }

  public async deleteProduct(productId: string): Promise<Product> {
    const deleteProductById: Product = await this.productModel.findByIdAndDelete(productId);
    if (!deleteProductById) throw new HttpException(409, "Product doesn't exist");

    return deleteProductById;
  }
}
