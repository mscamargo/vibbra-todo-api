import { Body, Controller, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SignUpDTO } from '@/dtos';
import { User } from '@/entities';

@Controller('/v1/sign-up')
export class SignUpController {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
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
    const accessToken = this.jwtService.sign({ id, name, email });
    return {
      accessToken,
    };
  }
}
