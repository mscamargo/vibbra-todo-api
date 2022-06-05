import { faker } from '@faker-js/faker';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import * as request from 'supertest';

import { AppModule } from '@/app.module';

process.env.ACCESS_TOKEN_SECRET = 'abc123';

describe('/v1/lists (POST)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    accessToken = await request(app.getHttpServer())
      .post('/v1/sign-up')
      .send({
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      })
      .then((r) => r.body.accessToken);
  });

  afterAll(() => {
    app.close();
  });

  describe('When no authorization is provided', () => {
    const data = {
      title: faker.datatype.string(),
    };

    let response: request.Response;

    beforeEach(async () => {
      response = await request(app.getHttpServer())
        .post('/v1/lists')
        .send(data);
    });

    it('Should return status code 401', () => {
      expect(response.statusCode).toBe(401);
    });
  });

  describe('When invalid authorization is provided', () => {
    const data = {
      title: faker.datatype.string(),
    };

    let response: request.Response;

    beforeEach(async () => {
      response = await request(app.getHttpServer())
        .post('/v1/lists')
        .set('Authorization', 'invalid')
        .send(data);
    });

    it('Should return status code 401', () => {
      expect(response.statusCode).toBe(401);
    });
  });

  describe('When title is not provided', () => {
    const data = {};

    let response: request.Response;

    beforeEach(async () => {
      response = await request(app.getHttpServer())
        .post('/v1/lists')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(data);
    });

    it('Should return status code 400', () => {
      expect(response.statusCode).toBe(400);
    });

    it('Should return the correct response body', () => {
      expect(response.body).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: expect.arrayContaining(['title must be a string']),
      });
    });
  });

  describe('When title is empty', () => {
    const data = {
      title: '',
    };

    let response: request.Response;

    beforeEach(async () => {
      response = await request(app.getHttpServer())
        .post('/v1/lists')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(data);
    });

    it('Should return status code 400', () => {
      expect(response.statusCode).toBe(400);
    });

    it('Should return the correct response body', () => {
      expect(response.body).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: expect.arrayContaining(['title should not be empty']),
      });
    });
  });

  describe('When valid data is provided', () => {
    const data = {
      title: faker.datatype.string(),
    };

    let response: request.Response;

    beforeEach(async () => {
      response = await request(app.getHttpServer())
        .post('/v1/lists')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(data);
    });

    it('Should return status code 201', () => {
      expect(response.statusCode).toBe(201);
    });

    it('Should return the correct response body', () => {
      expect(response.body).toHaveProperty('id');
      expect(response.body).toEqual(
        expect.objectContaining({
          ownerId: (jwt.decode(accessToken) as any).id,
          title: data.title,
        }),
      );
    });
  });
});
