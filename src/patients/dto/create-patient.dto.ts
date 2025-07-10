import { IsEmail, IsNotEmpty, IsString, IsPhoneNumber, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../entities/patient.entity';

export class CreatePatientDto {
  @ApiProperty({
    example: 'Marie',
    description: 'Prénom du patient',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Dupont',
    description: 'Nom de famille du patient',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'marie.dupont@example.com',
    description: 'Adresse email du patient',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '+33123456789',
    description: 'Numéro de téléphone du patient',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: '1990-05-15',
    description: 'Date de naissance (format YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({
    example: Gender.FEMALE,
    enum: Gender,
    description: 'Genre du patient',
  })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({
    example: '123 Rue de la Paix, 75001 Paris',
    description: 'Adresse du patient',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: 'Jean Dupont',
    description: 'Contact d\'urgence',
    required: false,
  })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiProperty({
    example: '+33987654321',
    description: 'Téléphone du contact d\'urgence',
    required: false,
  })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiProperty({
    example: 'Diabète de type 2, Hypertension',
    description: 'Antécédents médicaux',
    required: false,
  })
  @IsOptional()
  @IsString()
  medicalHistory?: string;

  @ApiProperty({
    example: 'Pénicilline, Arachides',
    description: 'Allergies connues',
    required: false,
  })
  @IsOptional()
  @IsString()
  allergies?: string;
}
