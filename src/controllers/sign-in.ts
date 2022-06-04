import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SignInDTO } from '@/dtos';
import { User } from '@/entities';

@Controller('/v1/sign-in')
export class SignInController {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
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
    const accessToken = this.jwtService.sign({ id, name, email });
    return {
      accessToken,
    };
  }
}
