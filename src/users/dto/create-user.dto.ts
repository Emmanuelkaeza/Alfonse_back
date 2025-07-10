import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Adresse email de l\'utilisateur',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'Prénom de l\'utilisateur',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Nom de famille de l\'utilisateur',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'password123',
    description: 'Mot de passe (minimum 6 caractères)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: UserRole.RECEPTIONIST,
    enum: UserRole,
    description: 'Rôle de l\'utilisateur',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
