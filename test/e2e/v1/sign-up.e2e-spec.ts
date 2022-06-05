import * as crypto from 'node:crypto';

import { faker } from '@faker-js/faker';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import * as request from 'supertest';
import { Repository } from 'typeorm';

import { AppModule } from '@/app.module';
import { User } from '@/entities';

process.env.ACCESS_TOKEN_SECRET = 'abc123';

describe('/v1/sign-up (POST)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  });

  beforeEach(async () => {
    await userRepository.query('DELETE FROM "user";');
  });

  afterAll(() => {
    app.close();
  });

  describe('When name is not provided', () => {
    const data = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    let response: request.Response;

    beforeEach(async () => {
      response = await request(app.getHttpServer())
        .post('/v1/sign-up')
        .send(data);
    });

    it('Should return status code 400', () => {
      expect(response.statusCode).toBe(400);
    });

    it('Should return a correct response body', async () => {
      expect(response.body).toEqual({
        statusCode: 400,
        message: expect.arrayContaining(['name must be a string']),
        error: 'Bad Request',
      });
    });
  });

  describe('When name is empty', () => {
    const data = {
      name: '',
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    let response: request.Response;

    beforeEach(async () => {
      response = await request(app.getHttpServer())
        .post('/v1/sign-up')
        .send(data);
    });

    it('Should return status code 400', () => {
      expect(response.statusCode).toBe(400);
    });

    it('Should return a correct response body', async () => {
      expect(response.body).toEqual({
        statusCode: 400,
        message: expect.arrayContaining(['name should not be empty']),
        error: 'Bad Request',
      });
    });
  });

  describe('When email is not provided', () => {
    const data = {
      name: faker.name.findName(),
      password: faker.internet.password(),
    };

    let response: request.Response;

    beforeEach(async () => {
      response = await request(app.getHttpServer())
        .post('/v1/sign-up')
        .send(data);
    });

    it('Should return status code 400', () => {
      expect(response.statusCode).toBe(400);
    });

    it('Should return a correct response body', async () => {
      expect(response.body).toEqual({
        statusCode: 400,
        message: ['email must be an email'],
        error: 'Bad Request',
      });
    });
  });

  describe('When an invalid email is provided', () => {
    const data = {
      name: faker.name.findName(),
      email: 'invalid',
      password: faker.internet.password(),
    };

    let response: request.Response;

    beforeEach(async () => {
      response = await request(app.getHttpServer())
        .post('/v1/sign-up')
        .send(data);
    });

    it('Should return status code 400', () => {
      expect(response.statusCode).toBe(400);
    });

    it('Should return a correct response body', async () => {
      expect(response.body).toEqual({
        statusCode: 400,
        message: ['email must be an email'],
        error: 'Bad Request',
      });
    });
  });

  describe('When password is not provided', () => {
    const data = {
      name: faker.name.findName(),
      email: faker.internet.email(),
    };

    let response: request.Response;

    beforeEach(async () => {
      response = await request(app.getHttpServer())
        .post('/v1/sign-up')
        .send(data);
    });

    it('Should return status code 400', () => {
      expect(response.statusCode).toBe(400);
    });

    it('Should return a correct response body', async () => {
      expect(response.body).toEqual({
        statusCode: 400,
        message: expect.arrayContaining(['password must be a string']),
        error: 'Bad Request',
      });
    });
  });

  describe('When password is empty', () => {
    const data = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: '',
    };

    let response: request.Response;

    beforeEach(async () => {
      response = await request(app.getHttpServer())
        .post('/v1/sign-up')
        .send(data);
    });

    it('Should return status code 400', () => {
      expect(response.statusCode).toBe(400);
    });

    it('Should return a correct response body', async () => {
      expect(response.body).toEqual({
        statusCode: 400,
        message: expect.arrayContaining(['password should not be empty']),
        error: 'Bad Request',
      });
    });
  });

  describe('When valid data is provided', () => {
    const data = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    let response: request.Response;
    let createdUser: User;

    beforeEach(async () => {
      response = await request(app.getHttpServer())
        .post('/v1/sign-up')
        .send(data);
      createdUser = await userRepository.find().then(([user]) => user);
    });

    it('Should return status code 201', () => {
      expect(response.statusCode).toBe(201);
    });

    it('Should return a valid accessToken in the response body', () => {
      expect(response.body).toHaveProperty('accessToken');
      const { accessToken } = response.body;
      const decoded = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
      ) as any;
      expect(decoded.id).toBe(createdUser.id);
      expect(decoded.name).toBe(data.name);
      expect(decoded.email).toBe(data.email);
    });

    it('Should insert a new user in the database with correct values', () => {
      expect(createdUser.name).toEqual(data.name);
      expect(createdUser.email).toEqual(data.email);
      expect(createdUser.password).toEqual(
        crypto
          .pbkdf2Sync(
            data.password,
            createdUser.passwordSalt,
            1000,
            64,
            'sha512',
          )
          .toString('hex'),
      );
    });
  });
});
