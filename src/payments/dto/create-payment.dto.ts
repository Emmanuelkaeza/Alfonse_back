import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentType } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({
    example: 150.00,
    description: 'Montant du paiement',
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    example: 'XOF',
    description: 'Code de la devise (ex: XOF, EUR, USD)',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    example: PaymentMethod.CINETPAY,
    enum: PaymentMethod,
    description: 'Méthode de paiement',
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;

  @ApiProperty({
    example: PaymentType.SUBSCRIPTION,
    enum: PaymentType,
    description: 'Type de paiement',
  })
  @IsEnum(PaymentType)
  @IsNotEmpty()
  type: PaymentType;

  @ApiProperty({
    example: 'Abonnement mensuel - Plan Basic',
    description: 'Description du paiement',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 1,
    description: 'ID du patient',
  })
  @IsNumber()
  @Type(() => Number)
  patientId: number;

  @ApiProperty({
    example: 'REF-2024-001',
    description: 'Référence externe (optionnel)',
    required: false,
  })
  @IsOptional()
  @IsString()
  externalReference?: string;

  @ApiProperty({
    example: 1,
    description: 'ID de l\'abonnement (pour les paiements d\'abonnement)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  subscriptionId?: number;

  @ApiProperty({
    example: { serviceType: 'consultation', doctorId: 5 },
    description: 'Métadonnées additionnelles (optionnel)',
    required: false,
  })
  @IsOptional()
  metadata?: any;
}
