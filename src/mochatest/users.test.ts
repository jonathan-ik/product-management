import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import { before, after } from 'mocha';
import mongoose from 'mongoose';
import { UserService } from '../services/users.service';
import { UserModel } from '../models/users.model';
import { CreateUserDto } from '../dtos/users.dto';
import dotenv from 'dotenv';
import {CONNECTION_URL} from '../config';

chai.use(chaiAsPromised);
dotenv.config();

let userService: UserService;

const userData: CreateUserDto = {
  email: 'newuser@example.com',
  password: 'password',
  first_name: 'John',
  last_name: 'Doe',
  phone_number: '08034729633',
  image: 'test_image_url',
};

describe('UserService', function () {
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
    // Initialize user service before each test
    userService = new UserService();
  });

  describe('findAllUser', () => {
    let createdUser1;
    let createdUser2;
  
    beforeEach(async () => {
      // Create two users before each test
      createdUser1 = await userService.createUser({
        email: `newuser-findall-1-${Math.random()}@example.com`,
        password: 'password',
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '08034729633',
        image: 'test_image_url',
      });
  
      createdUser2 = await userService.createUser({
        email: `newuser-findall-2-${Math.random()}@example.com`,
        password: 'password',
        first_name: 'Jane',
        last_name: 'Doe',
        phone_number: '08034729634',
        image: 'test_image_url',
      });
    });
  
    it('should find all users', async () => {
      const users = await userService.findAllUser();
      expect(users).to.be.an('array').with.lengthOf(2);
      expect(users.some((user) => user._id.toString() === createdUser1._id.toString())).to.be.true;
      expect(users.some((user) => user._id.toString() === createdUser2._id.toString())).to.be.true;
    });
  
    it('should return an empty array if no users exist', async () => {
      // Delete all users
      await UserModel.deleteMany({});
  
      const users = await userService.findAllUser();
      expect(users).to.be.an('array').that.is.empty;
    });
  });
  describe('findUserById', () => {
    let createdUser;
  
    beforeEach(async () => {
      // Generate a random email address
      const randomEmail = `newuser-findbyid-${Math.random()}@example.com`;
      createdUser = await userService.createUser({
        email: randomEmail,
        password: 'password',
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '08034729633',
        image: 'test_image_url',
      });
    });
  
    it('should find a user by id', async () => {
      const foundUser = await userService.findUserById(createdUser._id.toString());
      expect(foundUser._id.toString()).to.equal(createdUser._id.toString());
    });
  
    it('should throw an error if user does not exist', async () => {
      // Generate a valid MongoDB ObjectId
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      await expect(userService.findUserById(nonExistentId)).to.be.rejectedWith('User doesn\'t exist');
    });
  });
  
  describe('createUser', () => {
    it('should create a new user', async () => {
      const createdUser = await userService.createUser(userData);
      expect(createdUser).to.have.property('email', 'newuser@example.com');
      expect(createdUser).to.have.property('password').that.is.a('string');
    });

    it('should throw an error if the email already exists', async () => {
      
    
      try {
        // Create the user for the first time
        await userService.createUser(userData);
    
        // Attempt to create the user again, which should throw an error
        await expect(userService.createUser(userData)).to.be.rejectedWith('This email newuser@example.com already exists');
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    });    
  });
  describe('updateUser', () => {
    let createdUser;
    let anotherUser;
  
    beforeEach(async () => {
      createdUser = await userService.createUser({
        email: `newuser-update-${Math.random()}@example.com`,
        password: 'password',
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '08034729633',
        image: 'test_image_url',
      });
  
      anotherUser = await userService.createUser({
        email: `another-email-${Math.random()}@example.com`,
        password: 'password',
        first_name: 'Jane',
        last_name: 'Doe',
        phone_number: '08034729634',
        image: 'test_image_url',
      });
    });
  
    afterEach(async () => {
      await UserModel.deleteMany({});
    });
  
    it('should update a user\'s details', async () => {
      const updatedUserData = {
        email: createdUser.email,
        first_name: 'Updated Name',
        last_name: 'Updated Last Name',
        phone_number: '08034729635',
        image: 'updated-image-url',
      };
      const updatedUser = await userService.updateUser(createdUser._id.toString(), updatedUserData);
      expect(updatedUser).to.have.property('first_name', 'Updated Name');
      expect(updatedUser).to.have.property('last_name', 'Updated Last Name');
      expect(updatedUser).to.have.property('phone_number', '08034729635');
      expect(updatedUser).to.have.property('image', 'updated-image-url');
    });
  
    it('should throw an error when attempting to update with an existing email address', async () => {
      await expect(userService.updateUser(createdUser._id.toString(), { 
        email: anotherUser.email, 
        first_name: createdUser.first_name, 
        last_name: createdUser.last_name, 
        phone_number: createdUser.phone_number, 
        image: createdUser.image, 
      })).to.be.rejectedWith(`This email ${anotherUser.email} already exists`);
    });
  
    it('should throw an error when updating a non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      await expect(userService.updateUser(nonExistentId, { 
        email: 'non-existent-email@example.com', 
        first_name: 'Non Existent', 
        last_name: 'User', 
        phone_number: '08034729635', 
        image: 'non-existent-image-url', 
      })).to.be.rejectedWith('User doesn\'t exist');
    });
  }); 
  
  describe('updateUserImage', () => {
    let createdUser;
  
    beforeEach(async () => {
      createdUser = await userService.createUser({
        email: `newuser-updateimage-${Math.random()}@example.com`,
        password: 'password',
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '08034729633',
        image: 'test_image_url',
      });
    });
  
    afterEach(async () => {
      await UserModel.deleteMany({});
    });
  
    it('should update a user image', async () => {
      const newImageUrl = 'new-image-url';
      const updatedUser = await userService.updateUserImage(createdUser._id.toString(), newImageUrl);
      expect(updatedUser).to.have.property('image', newImageUrl);
    });
  
    it('should throw an error if user does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      await expect(userService.updateUserImage(nonExistentId, 'new-image-url')).to.be.rejectedWith('User doesn\'t exist');
    });
  });
  describe('deleteUser', () => {
  let createdUser;

  beforeEach(async () => {
    createdUser = await userService.createUser({
      email: `newuser-delete-${Math.random()}@example.com`,
      password: 'password',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '08034729633',
      image: 'test_image_url',
    });
  });

  afterEach(async () => {
    await UserModel.deleteMany({});
  });

  it('should delete a user', async () => {
    await userService.deleteUser(createdUser._id.toString());
    await expect(userService.findUserById(createdUser._id.toString())).to.be.rejectedWith('User doesn\'t exist');
  });

  it('should throw an error if user does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    await expect(userService.deleteUser(nonExistentId)).to.be.rejectedWith('User doesn\'t exist');
  });
});

});
