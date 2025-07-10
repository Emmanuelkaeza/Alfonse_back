import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: 'Opération réussie' })
  message: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Une erreur est survenue' })
  message: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/endpoint' })
  path: string;

  @ApiProperty({ example: 'POST' })
  method: string;
}

export class PaginatedResponseDto<T = any> {
  @ApiProperty()
  data: T[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: 10 })
  limit?: number;
}
