import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { controllers } from './controllers';
import { entities } from './entities';
import { JwtStrategy } from './jwt-passport-strategy';

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
    JwtModule.register({
      secret: 'abc123',
    }),
  ],
  controllers,
  providers: [JwtStrategy],
})
export class AppModule {}
