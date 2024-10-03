import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import request from 'supertest';
import { App } from '@/app';
import { CreateUserDto } from '@dtos/users.dto';
import { UserRoute } from '@routes/users.route';

jest.mock('mongoose');
jest.mock('bcrypt');

const mockedBcryptHash = bcrypt.hash as jest.Mock;
const mockedMongooseFind = mongoose.Model.find as jest.Mock;
const mockedMongooseFindOne = mongoose.Model.findOne as jest.Mock;
const mockedMongooseCreate = mongoose.Model.create as jest.Mock;
const mockedMongooseFindByIdAndUpdate = mongoose.Model.findByIdAndUpdate as jest.Mock;
const mockedMongooseFindByIdAndDelete = mongoose.Model.findByIdAndDelete as jest.Mock;

const mockUsersData = [
  { _id: '1', email: 'a@email.com', password: 'hashedPassword1' },
  { _id: '2', email: 'b@email.com', password: 'hashedPassword2' },
  { _id: '3', email: 'c@email.com', password: 'hashedPassword3' },
];

const userData: CreateUserDto = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'test@email.com',
  password: 'q1w2e3r4',
  phone_number: '1234567890',
  image: 'default.png', 
};

let app;

beforeAll(async () => {
  mockedBcryptHash.mockResolvedValue('hashedPassword');
  app = new App([new UserRoute()]);
});

afterAll(async () => {
  jest.clearAllMocks();
});

describe('Testing Users Service', () => {
  describe('[GET] /users', () => {
    it('should return all users', async () => {
      mockedMongooseFind.mockResolvedValueOnce(mockUsersData);

      const response = await request(app.getServer()).get('/users');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
      expect(response.body[0].email).toBe('a@email.com');
    });
  });

  describe('[GET] /users/:id', () => {
    it('should return a user by ID', async () => {
      const userId = '1';
      mockedMongooseFindOne.mockResolvedValueOnce(mockUsersData[0]);

      const response = await request(app.getServer()).get(`/users/${userId}`);
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(userId);
    });

    it('should return 409 when user not found', async () => {
      const userId = 'nonexistent';
      mockedMongooseFindOne.mockResolvedValueOnce(null);

      const response = await request(app.getServer()).get(`/users/${userId}`);
      expect(response.status).toBe(409);
      expect(response.body.message).toBe("User doesn't exist");
    });
  });

  describe('[POST] /users', () => {
    it('should create a user', async () => {
      mockedMongooseFindOne.mockResolvedValueOnce(null); // No user with that email
      mockedMongooseCreate.mockResolvedValueOnce({ ...userData, _id: '4', password: 'hashedPassword' });

      const response = await request(app.getServer()).post('/users').send(userData);
      expect(response.status).toBe(201);
      expect(response.body.email).toBe(userData.email);
    });

    it('should return 409 when email already exists', async () => {
      mockedMongooseFindOne.mockResolvedValueOnce(mockUsersData[0]); // User exists with that email

      const response = await request(app.getServer()).post('/users').send(userData);
      expect(response.status).toBe(409);
      expect(response.body.message).toBe(`This email ${userData.email} already exists`);
    });
  });

  describe('[PUT] /users/:id', () => {
    it('should update a user', async () => {
      const userId = '1';
      mockedMongooseFindOne.mockResolvedValueOnce(null); // No other user with the same email
      mockedMongooseFindByIdAndUpdate.mockResolvedValueOnce({ ...userData, _id: userId });

      const response = await request(app.getServer()).put(`/users/${userId}`).send(userData);
      expect(response.status).toBe(200);
      expect(response.body.email).toBe(userData.email);
    });

    it('should return 409 when updating to an existing email', async () => {
      const userId = '2'; // Trying to update user 2's email to an existing one
      mockedMongooseFindOne.mockResolvedValueOnce(mockUsersData[0]); // Email belongs to user 1

      const response = await request(app.getServer()).put(`/users/${userId}`).send(userData);
      expect(response.status).toBe(409);
      expect(response.body.message).toBe(`This email ${userData.email} already exists`);
    });
  });

  describe('[DELETE] /users/:id', () => {
    it('should delete a user', async () => {
      const userId = '1';
      mockedMongooseFindByIdAndDelete.mockResolvedValueOnce(mockUsersData[0]);

      const response = await request(app.getServer()).delete(`/users/${userId}`);
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(userId);
    });

    it('should return 409 when user not found', async () => {
      const userId = 'nonexistent';
      mockedMongooseFindByIdAndDelete.mockResolvedValueOnce(null);

      const response = await request(app.getServer()).delete(`/users/${userId}`);
      expect(response.status).toBe(409);
      expect(response.body.message).toBe("User doesn't exist");
    });
  });
});
