import * as crypto from 'node:crypto';

import { Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';

import { User } from '@/entities';

@Controller()
export class SignUpController {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  @Post('/v1/sign-up')
  async handle(@Body() body: any) {
    const passwordSalt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto
      .pbkdf2Sync(body.password, passwordSalt, 1000, 64, 'sha512')
      .toString('hex');
    const { id, name, email } = await this.userRepository.save({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      passwordSalt,
    });
    return {
      accessToken: jwt.sign(
        { id, name, email },
        process.env.ACCESS_TOKEN_SECRET,
      ),
      name: body.name,
    };
  }
}
