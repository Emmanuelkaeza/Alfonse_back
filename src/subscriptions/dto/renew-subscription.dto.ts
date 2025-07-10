import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RenewSubscriptionDto {
  @ApiProperty({
    example: 30,
    description: 'Durée de renouvellement en jours',
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  durationInDays?: number;

  @ApiProperty({
    example: 50.00,
    description: 'Prix du renouvellement (si différent)',
    minimum: 0.01,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  price?: number;
}
