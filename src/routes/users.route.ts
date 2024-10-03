import { Router } from 'express';
import { UserController } from '@controllers/users.controller';
import { CreateUserDto, UpdateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { upload } from '@/middlewares/multer.middleware';

export class UserRoute implements Routes {
  public path = '/users';
  public router = Router();
  public user = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.get(`${this.path}`, this.user.getUsers);
    this.router.get(`${this.path}`, AuthMiddleware, this.user.getUserById);
    this.router.post(`${this.path}`, ValidationMiddleware(CreateUserDto, 'body'), this.user.createUser);
    this.router.put(`${this.path}/`, AuthMiddleware, this.user.updateUser);
    this.router.delete(`${this.path}/:id`, this.user.deleteUser);
    this.router.post(`${this.path}/upload`, AuthMiddleware, upload.single("file"), this.user.uploadUserPicture)
  }
}
