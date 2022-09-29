import { IsString, IsEmail, IsNumber } from 'class-validator';
import { User } from '../entities/user.entity';

export class GetUserDto {
  @IsNumber()
  id: number;

  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  constructor(model: User) {
    this.id = model.id;
    this.email = model.email;
    this.fullName = model.fullName;
  }
}
