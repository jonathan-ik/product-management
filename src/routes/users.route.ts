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
    this.router.get(`${this.path}`,AuthMiddleware, this.user.getUsers);//get all users
    this.router.get(`${this.path}/:id`, AuthMiddleware, this.user.getUserById);// get user by id
    this.router.post(`${this.path}`, ValidationMiddleware(CreateUserDto, 'body'), this.user.createUser);// create user
    this.router.put(`${this.path}/`, AuthMiddleware,ValidationMiddleware(UpdateUserDto, 'body'), this.user.updateUser);// update user
    this.router.delete(`${this.path}/:id`, AuthMiddleware,this.user.deleteUser);// delete user
    this.router.post(`${this.path}/upload`, AuthMiddleware, upload.single("file"), this.user.uploadUserPicture)//update user image
  }
}
