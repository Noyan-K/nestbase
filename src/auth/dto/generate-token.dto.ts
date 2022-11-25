import { IsEmail, IsNumber, IsString } from 'class-validator';

export class GenerateTokenDto {
  @IsNumber()
  id: number;

  @IsString()
  fullName: string;

  @IsEmail()
  email: string;
}
