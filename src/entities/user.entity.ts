import * as crypto from 'node:crypto';

import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

type Initial = {
  name?: string;
  email?: string;
  password?: string;
};

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  passwordSalt: string = crypto.randomBytes(16).toString('hex');

  constructor(initial?: Initial) {
    if (initial) {
      this.name = initial.name;
      this.email = initial.email;
      this.password = initial.password;
    }
  }

  @BeforeInsert()
  hashPassword(): void {
    this.password = this.hash(this.password, this.passwordSalt);
  }

  private hash(value: string, salt: string): string {
    return crypto.pbkdf2Sync(value, salt, 1000, 64, 'sha512').toString('hex');
  }
}
