import { Request } from 'express';
import { User } from './users.interface';

export interface MulterRequest extends Request {
  file: any; // Adjust the type of 'file' based on your needs
  user: User;
}
