import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@clinic.com',
    description: 'Adresse email de l\'utilisateur',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Mot de passe',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
