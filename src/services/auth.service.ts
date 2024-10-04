import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { SALT, SECRET_KEY } from '../config';
import { HttpException } from '../exceptions/HttpException';
import { DataStoredInToken, TokenData } from '../interfaces/auth.interface';
import { User } from '../interfaces/users.interface';
import { UserModel } from '../models/users.model';

const createToken = (user: User): TokenData => {
  const dataStoredInToken: DataStoredInToken = { _id: user._id };
  const expiresIn: number = 60 * 60 * 24;

  return { expiresIn, token: sign(dataStoredInToken, SECRET_KEY, { expiresIn }) };
};

const createCookie = (tokenData: TokenData): string => {
  return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
};

export class AuthService {
  public userModel = UserModel;
  
  public async login(userData: User): Promise<{ cookie: string; findUser: User }> {
    const findUser: User = await this.userModel.findOne({ email: userData.email });
    if (!findUser) throw new HttpException(409, `This email ${userData.email} was not found`);

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, 'Password is not matching');

    const tokenData = createToken(findUser);
    const cookie = createCookie(tokenData);

    return { cookie, findUser };
  }

  public async logout(tokenData: DataStoredInToken): Promise<User> {
    const findUser: User = await this.userModel.findOne({ _id: tokenData._id });
    if (!findUser) throw new HttpException(409, `User doesn't exist`);
    return findUser;
  }
  
}
