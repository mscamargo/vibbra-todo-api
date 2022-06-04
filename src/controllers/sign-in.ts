import * as crypto from 'node:crypto';

import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';

import { SignInDTO } from '@/dtos';
import { User } from '@/entities';

@Controller('/v1/sign-in')
export class SignInController {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  @Post()
  async handle(@Body() body: SignInDTO) {
    const user = await this.userRepository.findOneBy({ email: body.email });
    if (!user) {
      throw new UnauthorizedException();
    }
    const hashedPassword = crypto
      .pbkdf2Sync(body.password, user.passwordSalt, 1000, 64, 'sha512')
      .toString('hex');
    if (user.password !== hashedPassword) {
      throw new UnauthorizedException();
    }
    const { id, name, email } = user;
    const accessToken = jwt.sign(
      { id, name, email },
      process.env.ACCESS_TOKEN_SECRET,
    );
    return {
      accessToken,
    };
  }
}
