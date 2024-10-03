import { Router } from 'express';
import { ProductController } from '@controllers/product.controller'; 
import { CreateProductDto, UpdateProductDto } from '@dtos/product.dto'; 
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { upload } from '@middlewares/multer.middleware';
export class ProductRoute implements Routes {
  public path = '/products';
  public router = Router();
  public product = new ProductController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.product.getAllProducts); // Fetch all products
    this.router.get(`${this.path}/:id`, this.product.getProductById); // Fetch product by ID
    this.router.get(`${this.path}/name/:name`, this.product.getProductsByName); // Fetch products by name
    this.router.post(`${this.path}`, [AuthMiddleware, ValidationMiddleware(CreateProductDto, 'body')], this.product.createProduct); // Create a new product 
    this.router.put(`${this.path}/:id`, [AuthMiddleware, ValidationMiddleware(UpdateProductDto, 'body')], this.product.updateProduct); // Update product by ID
    this.router.delete(`${this.path}/:id`, AuthMiddleware, this.product.deleteProduct); // Delete product by ID
    this.router.post(`${this.path}/upload/:id`, AuthMiddleware, upload.single('file'), this.product.uploadProductImage); // Upload product image
    this.router.post(`${this.path}/:id/review`, AuthMiddleware, this.product.addProductReview); // Add a review to a product
  }
}
