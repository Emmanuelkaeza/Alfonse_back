import { IsNotEmpty, IsNumber, IsEnum, IsString, IsOptional, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SubscriptionType } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @ApiProperty({
    example: SubscriptionType.BASIC,
    enum: SubscriptionType,
    description: 'Type d\'abonnement',
  })
  @IsEnum(SubscriptionType)
  @IsNotEmpty()
  type: SubscriptionType;

  @ApiProperty({
    example: 50.00,
    description: 'Prix de l\'abonnement',
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  price: number;

  @ApiProperty({
    example: 'XOF',
    description: 'Code de la devise',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    example: 30,
    description: 'Durée en jours',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  durationInDays: number;

  @ApiProperty({
    example: 1,
    description: 'ID du patient',
  })
  @IsNumber()
  @Type(() => Number)
  patientId: number;

  @ApiProperty({
    example: 'Abonnement mensuel avec consultations illimitées',
    description: 'Description de l\'abonnement',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: ['Consultations illimitées', 'Suivi médical', 'Urgences 24h/24'],
    description: 'Liste des fonctionnalités incluses',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];
}
