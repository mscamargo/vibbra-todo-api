import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserID } from '@/decorators';
import { CreateListDTO } from '@/dtos';
import { List } from '@/entities/list';
import { JwtAuthGuard } from '@/jwt-auth-guard';

@UseGuards(JwtAuthGuard)
@Controller('/v1/lists')
export class CreateListController {
  constructor(
    @InjectRepository(List) private readonly listRepository: Repository<List>,
  ) {}

  @Post()
  async handle(@Body() body: CreateListDTO, @UserID() userId: string) {
    return this.listRepository.save({ title: body.title, ownerId: userId });
  }
}
