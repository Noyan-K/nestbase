import { IsString, Length, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @Length(4, 18)
  password: string;
}
