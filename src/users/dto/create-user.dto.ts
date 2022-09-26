import { IsString, Length, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  fullname: string;

  @IsEmail()
  email: string;

  @Length(4, 18)
  password: string;
}
