import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import { before, after, beforeEach, describe, it } from 'mocha';
import mongoose from 'mongoose';
import { AuthService } from '../services/auth.service';
import { UserModel } from '../models/users.model';
import { CreateUserDto } from '../dtos/users.dto';
import dotenv from 'dotenv';
import { CONNECTION_URL } from '../config';
import { DataStoredInToken, TokenData } from '../interfaces/auth.interface';
import bcrypt from 'bcrypt';
import { User } from '../interfaces/users.interface';

chai.use(chaiAsPromised);
dotenv.config();

let authService: AuthService;

describe('AuthService', function () {
  this.timeout(40000); // Extend test timeout to 40 seconds

  before(async () => {
    try {
      await mongoose.connect(CONNECTION_URL, {
        serverSelectionTimeoutMS: 30000,
      });
      await mongoose.connection.once('open', () => console.log('Connected to MongoDB'));
      await UserModel.deleteMany({}); // Clear the collection before running tests
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  });

  after(async () => {
    try {
      await UserModel.deleteMany({});
      await mongoose.connection.close();
    } catch (error) {
      console.error('Error cleaning up:', error);
    }
  });

  beforeEach(() => {
    // Initialize auth service before each test
    authService = new AuthService();
  });

  describe('login', () => {
    const email = `newuser-${Math.random()}@example.com`;
    const userData: CreateUserDto = {
      email,
      password: 'password',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '08034729633',
      image: 'test_image_url',
    };

    beforeEach(async () => {
      // Delete existing user
      await UserModel.deleteOne({ email });

      // Hash the password and create a user before each test
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await UserModel.create({
        email: userData.email,
        password: hashedPassword,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone_number: userData.phone_number,
        image: userData.image,
      });
    });

    it('should login successfully', async () => {
      const loginData: Partial<User> = { email: userData.email, password: userData.password };
      const result = await authService.login(loginData as User);
      expect(result).to.have.property('cookie');
      expect(result).to.have.property('findUser');
    });

    it('should throw an error if email is not found', async () => {
      const loginData: Partial<User> = { email: 'non-existent-email@example.com', password: userData.password };
      await expect(authService.login(loginData as User)).to.be.rejectedWith(`This email ${loginData.email} was not found`);
    });

    it('should throw an error if password is incorrect', async () => {
      const loginData: Partial<User> = { email: userData.email, password: 'incorrect-password' };
      await expect(authService.login(loginData as User)).to.be.rejectedWith('Password is not matching');
    });
  });

  describe('logout', () => {
    const email = `newuser-${Math.random()}@example.com`;
    const userData: CreateUserDto = {
      email,
      password: 'password',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '08034729633',
      image: 'test_image_url',
    };
  
    beforeEach(async () => {
      // Delete existing user
      await UserModel.deleteOne({ email });
  
      // Hash the password and create a user before each test
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await UserModel.create({
        email: userData.email,
        password: hashedPassword,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone_number: userData.phone_number,
        image: userData.image,
      });
    });
  
    it('should logout successfully', async () => {
      // Login first
      const loginData: Partial<User> = { email: userData.email, password: userData.password };
      const loginResult = await authService.login(loginData as User);
      const tokenData: DataStoredInToken = { _id: loginResult.findUser._id.toString() };
  
      // Then logout
      const result = await authService.logout(tokenData);
      expect(result).to.be.an('object');
      expect(result.email).to.equal(userData.email);
    });
  
    it('should throw an error if user is not found', async () => {
        const tokenData: DataStoredInToken = { _id: new mongoose.Types.ObjectId().toString() };
      await expect(authService.logout(tokenData)).to.be.rejectedWith('User doesn\'t exist');
    });
  });
  
});
