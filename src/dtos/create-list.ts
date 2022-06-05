import { IsNotEmpty, IsString } from 'class-validator';

export class CreateListDTO {
  @IsString()
  @IsNotEmpty()
  title: string;
}
