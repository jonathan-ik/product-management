import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import { before, after, beforeEach, describe, it } from 'mocha';
import mongoose from 'mongoose';
import { ProductService } from '../services/product.service';
import { ProductModel } from '../models/product.model';
import { CreateProductDto, UpdateProductDto } from '../dtos/product.dto';
import dotenv from 'dotenv';
import { CONNECTION_URL } from '../config';
import { ReviewDto } from '../dtos/product.dto';

chai.use(chaiAsPromised);
dotenv.config();

let productService: ProductService;

const productData: CreateProductDto = {
  product_name: 'Test Product',
  price: 10.99,
  description: 'Test product description',
  product_model: 'Test Model',
  product_image: 'test_image_url',
};

function getUniqueProductData(): CreateProductDto {
  return {
    product_name: `Unique Product ${Math.random()}`,
    price: Math.random() * 100,
    description: 'Unique product description',
    product_model: 'Unique Model',
    product_image: 'unique_image_url',
  };
}

const reviewData: ReviewDto = {
  id: 'review-id',
  name: 'John Doe',
  review: 'Excellent product!',
};

async function createAndReturnProduct() {
  const product = await productService.createProduct(getUniqueProductData());
  return product._id.toString();
}

describe('ProductService', function () {
  this.timeout(40000); // Extend test timeout to 40 seconds

  before(async () => {
    try {
      await mongoose.connect(CONNECTION_URL, {
        serverSelectionTimeoutMS: 30000,
      });
      await mongoose.connection.once('open', () => console.log('Connected to MongoDB'));
      await ProductModel.deleteMany({}); // Clear the collection before running tests
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  });

  after(async () => {
    try {
      await ProductModel.deleteMany({});
      await mongoose.connection.close();
    } catch (error) {
      console.error('Error cleaning up:', error);
    }
  });

  beforeEach(() => {
    // Initialize product service before each test
    productService = new ProductService();
  });

  describe('findAllProduct', () => {
    it('should return an empty array', async () => {
      const products = await productService.findAllProduct();
      expect(products).to.be.an('array').that.is.empty;
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const createdProduct = await productService.createProduct(productData);
      expect(createdProduct).to.have.property('product_name', productData.product_name);
      expect(createdProduct).to.have.property('price', productData.price);
    });

    it('should throw an error if product already exists', async () => {
        const uniqueProductData = getUniqueProductData();
        await productService.createProduct(uniqueProductData);
        await expect(productService.createProduct(uniqueProductData)).to.be.rejectedWith(
          `This product ${uniqueProductData.product_name} with model ${uniqueProductData.product_model} already exists`,
        );
      });
  });

  describe('findProductById', () => {
    let createdProductId: string;

    beforeEach(async () => {
      createdProductId = await createAndReturnProduct();
    });

    it('should find a product by ID', async () => {
        const foundProduct = await productService.findProductById(createdProductId);
        expect(foundProduct._id.toString()).to.equal(createdProductId);
      });

    it('should throw an error if product is not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();  // Valid ObjectId but non-existent
      await expect(productService.findProductById(nonExistentId)).to.be.rejectedWith("Product doesn't exist");
    });
  });

  describe('findProductsByName', () => {
    let createdProductId: string;

    beforeEach(async () => {
      createdProductId = await createAndReturnProduct();
    });

    it('should find products by name', async () => {
      const foundProducts = await productService.findProductsByName(productData.product_name);
      expect(foundProducts).to.be.an('array').that.is.not.empty;
    });

    it('should throw an error if no products are found', async () => {
      await expect(productService.findProductsByName('non-existent-name')).to.be.rejectedWith('No products found with that name');
    });
  });

  describe('updateProduct', () => {
    let createdProductId: string;

    beforeEach(async () => {
      createdProductId = await createAndReturnProduct();
    });

    it('should update a product', async () => {
      const updateData: UpdateProductDto = { product_name: 'Updated Name' };
      const updatedProduct = await productService.updateProduct(createdProductId, updateData);
      expect(updatedProduct).to.have.property('product_name', updateData.product_name);
    });

    it('should throw an error if product is not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();  // Valid ObjectId but non-existent
      await expect(productService.updateProduct(nonExistentId, {})).to.be.rejectedWith(`Product with ID ${nonExistentId} not found`);
    });
  });

  describe('addProductReview', () => {
    let createdProductId: string;

    beforeEach(async () => {
      createdProductId = await createAndReturnProduct();
    });

    it('should add a review to a product', async () => {
      const review: ReviewDto = {
        id: 'review-id',
        name: 'John Doe',
        review: 'Excellent product!',
      };
      const updatedProduct = await productService.addProductReview(createdProductId, review);
      const addedReview = updatedProduct.reviews.find(r => r.name === review.name && r.review === review.review);
      expect(addedReview).to.have.property('name', review.name);
      expect(addedReview).to.have.property('review', review.review);
    });

    it('should throw an error if product is not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const review: ReviewDto = {
        id: 'review-id',
        name: 'John Doe',
        review: 'Excellent product!',
      };
      await expect(
        productService.addProductReview(nonExistentId, review),
      ).to.be.rejectedWith(`Product with ID ${nonExistentId} not found`);
    });
  });

  describe('updateProductImage', () => {
    let createdProductId: string;

    beforeEach(async () => {
      createdProductId = await createAndReturnProduct();
    });

    it('should update the product image', async () => {
      const updatedProduct = await productService.updateProductImage(createdProductId, 'new-image-url');
      expect(updatedProduct.product_image).to.equal('new-image-url');
    });

    it('should throw an error if product is not found', async () => {
      await expect(
        productService.updateProductImage(new mongoose.Types.ObjectId().toString(), 'new-image-url'),
      ).to.be.rejectedWith('Product doesn\'t exist');
    });
  });

  describe('deleteProduct', () => {
    let createdProductId: string;

    beforeEach(async () => {
      createdProductId = await createAndReturnProduct();
    });

    it('should delete a product', async () => {
      const deletedProduct = await productService.deleteProduct(createdProductId);
      expect(deletedProduct._id.toString()).to.equal(createdProductId);
    });

    it('should throw an error if product is not found', async () => {
      await expect(
        productService.deleteProduct(new mongoose.Types.ObjectId().toString()),
      ).to.be.rejectedWith('Product doesn\'t exist');
    });
  });
});
