import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '@/app.module';
import { Repository } from 'typeorm';
import { User } from '@/entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as crypto from 'node:crypto';
process.env.ACCESS_TOKEN_SECRET = 'abc123';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    await userRepository.clear();
  });

  afterAll(() => {
    app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/v1/sign-up (POST)', async () => {
    const data = {
      name: 'any',
      email: 'any',
      password: 'any123',
    };
    const response = await request(app.getHttpServer())
      .post('/v1/sign-up')
      .send(data);

    const createdUsers = await userRepository.find();
    const [createdUser] = createdUsers;

    expect(response.statusCode).toBe(201);
    expect(response.body.accessToken).toBeDefined();

    const decoded = jwt.verify(
      response.body.accessToken,
      process.env.ACCESS_TOKEN_SECRET,
    ) as any;
    expect(decoded.id).toBe(createdUser.id);
    expect(decoded.name).toBe(data.name);
    expect(decoded.email).toBe(data.email);

    expect(createdUsers).toHaveLength(1);
    expect(createdUser.name).toEqual(data.name);
    expect(createdUser.email).toEqual(data.email);
    expect(createdUser.password).toEqual(
      crypto
        .pbkdf2Sync(data.password, createdUser.passwordSalt, 1000, 64, 'sha512')
        .toString('hex'),
    );
  });
});
