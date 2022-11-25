import { IsEmail, Length } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @Length(4, 18)
  password: string;
}
