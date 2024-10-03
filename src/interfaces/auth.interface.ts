import { Request } from 'express';
import { User } from '@interfaces/users.interface';
import { Product } from '@interfaces/product.interface';

export interface DataStoredInToken {
  _id: string;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
}

export interface RequestWithProduct extends Request {
  Product: Product;
}

