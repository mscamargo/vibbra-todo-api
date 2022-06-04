import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import * as jwt from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as crypto from 'node:crypto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/v1/sign-up')
  async signUp(@Body() body: any) {
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
