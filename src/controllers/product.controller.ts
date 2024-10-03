import { NextFunction, Request, Response } from 'express';
import { Product } from '@interfaces/product.interface';
import { ProductService } from '@services/product.service';
import { RequestWithProduct } from '@/interfaces/auth.interface';
import { s3Upload } from '@/helpers/s3.helper';
import { MulterRequest } from '@/interfaces/multer.interface';

export class ProductController {
  public productService = new ProductService();

  // Get all products
  public getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products: Product[] = await this.productService.findAllProduct();
      res.status(200).json({ data: products, message: 'All products retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };

  // Get product by ID
  public getProductById = async (req: RequestWithProduct, res: Response, next: NextFunction) => {
    try {
      const productId = req.params.id;
      const product: Product = await this.productService.findProductById(productId);
      res.status(200).json({ data: product, message: 'Product retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };

  // Get products by name
  public getProductsByName = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productName = req.params.name;
      const products: Product[] = await this.productService.findProductsByName(productName);
      res.status(200).json({ data: products, message: `Products with name '${productName}' retrieved successfully` });
    } catch (error) {
      next(error);
    }
  };

  // Create a new product
  public createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productData: Product = req.body;
      const createdProduct: Product = await this.productService.createProduct(productData);
      res.status(201).json({ data: createdProduct, message: 'Product created successfully' });
    } catch (error) {
      next(error);
    }
  };

  // Update a product
  public updateProduct = async (req: RequestWithProduct, res: Response, next: NextFunction) => {
    try {
      const productId: string = req.params.id;
      const productData: Partial<Product> = req.body;
      const updatedProduct: Product = await this.productService.updateProduct(productId, productData);
      res.status(200).json({ data: updatedProduct, message: 'Product updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  // Delete a product
  public deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId: string = req.params.id;
      const deletedProduct: Product = await this.productService.deleteProduct(productId);
      res.status(200).json({ data: deletedProduct, message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // Add a product review
  public addProductReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId: string = req.params.id;
      const reviewData = req.body;  // Assuming body contains { id, name, review }
      const updatedProduct = await this.productService.addProductReview(productId, reviewData);
      res.status(200).json({ data: updatedProduct, message: 'Review added successfully' });
    } catch (error) {
      next(error);
    }
  };

  // Upload product image
  public uploadProductImage = async (req: MulterRequest, res: Response, next: NextFunction) => {
    try {
      const productId: string = req.params.id;
      const file = req.file;  // Assuming the file is uploaded via multipart form
      const imageUrl = await s3Upload(productId, file);
      const updatedProduct = await this.productService.updateProductImage(productId, imageUrl);
      res.status(200).json({ data: updatedProduct, message: 'Product image uploaded successfully' });
    } catch (error) {
      next(error);
    }
  };
}
