import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { controllers } from './controllers';
import { entities } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'vibbra_test',
      entities,
      synchronize: true,
    }),
    TypeOrmModule.forFeature(entities),
  ],
  controllers,
  providers: [],
})
export class AppModule {}
