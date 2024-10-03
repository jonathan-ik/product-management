import { Product } from '@/interfaces/product.interface';
import { Document, Schema, model } from 'mongoose';

// Define the product schema
const ProductSchema: Schema = new Schema({
  product_name: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  product_image: {
    type: String,
  },
  product_model: {
    type: String,
    required: true,
  },
  reviews: [
    {
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      review: {
        type: String,
        required: true,
      },
    },
  ],
});

// Export the Mongoose model with Product & Document types
export const ProductModel = model<Product & Document>('Product', ProductSchema);
