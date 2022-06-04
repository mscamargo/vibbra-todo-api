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
    const passwordMatch = user.comparePassword(body.password);
    if (!passwordMatch) {
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
