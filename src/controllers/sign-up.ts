import * as crypto from 'node:crypto';

import { Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';

import { SignUpDTO } from '@/dtos';
import { User } from '@/entities';

@Controller('/v1/sign-up')
export class SignUpController {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  @Post()
  async handle(@Body() body: SignUpDTO) {
    const { id, name, email } = await this.userRepository.save(
      new User({
        name: body.name,
        email: body.email,
        password: body.password,
      }),
    );
    return {
      accessToken: jwt.sign(
        { id, name, email },
        process.env.ACCESS_TOKEN_SECRET,
      ),
    };
  }
}
