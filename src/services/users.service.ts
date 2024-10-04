import { hash } from 'bcrypt';
import { HttpException } from '../exceptions/HttpException';;
import { User } from '../interfaces/users.interface';
import { UserModel } from '../models/users.model';

export class UserService {
  public userModel = UserModel;
  public async findAllUser(): Promise<User[]> {
    const users: User[] = await this.userModel.find();
    return users;
  }

  public async findUserById(userId: string): Promise<User> {
    const findUser: User = await this.userModel.findOne({ _id: userId });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async createUser(userData: User): Promise<User> {
    const findUser: User = await this.userModel.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await this.userModel.create({ ...userData, password: hashedPassword });

    return createUserData;
  }

  public async updateUser(userId: string, userData: User): Promise<User> {
    if (userData.email) {
      const findUser: User = await this.userModel.findOne({ email: userData.email });
      if (findUser && findUser._id.toString() != userId.toString()) throw new HttpException(409, `This email ${userData.email} already exists`);
    }

    const updateUserById: User = await this.userModel.findByIdAndUpdate(userId, userData, { new: true, runValidators: true });
    if (!updateUserById) throw new HttpException(409, "User doesn't exist");

    return updateUserById;
  }

  public async updateUserImage(userId: string, image: string): Promise<User> {
    const updateUserById: User = await this.userModel.findByIdAndUpdate(userId, {image: image}, {new: true, runValidators: true})
    if (!updateUserById) throw new HttpException(409, "User doesn't exist")

    return updateUserById;
  }

  public async deleteUser(userId: string): Promise<User> {
    const deleteUserById: User = await this.userModel.findByIdAndDelete(userId);
    if (!deleteUserById) throw new HttpException(409, "User doesn't exist");

    return deleteUserById;
  }
}
