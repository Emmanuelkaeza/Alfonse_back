import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PaymentStatus, PaymentMethod, PaymentType } from './entities/payment.entity';

@ApiTags('Gestion des paiements')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({
    summary: 'Initier un nouveau paiement',
    description: 'Crée un nouveau paiement pour un patient. Si la méthode est CinetPay, initie la transaction de paiement en ligne.',
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: 'Paiement créé avec succès',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        transactionId: { type: 'string', example: 'TXN-1672531200000-A1B2C3D4' },
        amount: { type: 'number', example: 150.00 },
        currency: { type: 'string', example: 'XOF' },
        method: { type: 'string', example: 'cinetpay' },
        status: { type: 'string', example: 'pending' },
        description: { type: 'string', example: 'Consultation médicale' },
        metadata: {
          type: 'object',
          example: { cinetpayUrl: 'https://checkout.cinetpay.com/payment/...' },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erreur lors de l\'initiation du paiement CinetPay',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient non trouvé',
  })
  create(@Body() createPaymentDto: CreatePaymentDto, @CurrentUser() user: any) {
    return this.paymentsService.create(createPaymentDto, user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({
    summary: 'Récupérer la liste des paiements',
    description: 'Récupère la liste paginée des paiements avec filtres optionnels',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Numéro de page',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Nombre d\'éléments par page',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: PaymentStatus,
    description: 'Filtrer par statut de paiement',
  })
  @ApiQuery({
    name: 'method',
    required: false,
    enum: PaymentMethod,
    description: 'Filtrer par méthode de paiement',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: PaymentType,
    description: 'Filtrer par type de paiement',
  })
  @ApiQuery({
    name: 'patientId',
    required: false,
    description: 'Filtrer par ID du patient',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des paiements récupérée avec succès',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 10 },
      },
    },
  })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('status') status?: PaymentStatus,
    @Query('method') method?: PaymentMethod,
    @Query('type') type?: PaymentType,
    @Query('patientId', new ParseIntPipe({ optional: true })) patientId?: number,
  ) {
    return this.paymentsService.findAll(page, limit, status, method, type, patientId);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Statistiques des paiements',
    description: 'Récupère les statistiques générales des paiements et revenus',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        totalPayments: { type: 'number', example: 500 },
        totalRevenue: { type: 'number', example: 75000.00 },
        statusStats: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'completed' },
              count: { type: 'number', example: 450 },
              totalAmount: { type: 'number', example: 67500.00 },
            },
          },
        },
        methodStats: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              method: { type: 'string', example: 'cinetpay' },
              count: { type: 'number', example: 300 },
              totalAmount: { type: 'number', example: 45000.00 },
            },
          },
        },
      },
    },
  })
  getStats() {
    return this.paymentsService.getPaymentStats();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({
    summary: 'Récupérer un paiement par ID',
    description: 'Récupère les détails complets d\'un paiement spécifique',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID du paiement',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Paiement trouvé',
  })
  @ApiResponse({
    status: 404,
    description: 'Paiement non trouvé',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  @Get('transaction/:transactionId')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({
    summary: 'Récupérer un paiement par ID de transaction',
    description: 'Récupère un paiement en utilisant son ID de transaction unique',
  })
  @ApiParam({
    name: 'transactionId',
    type: 'string',
    description: 'ID de transaction du paiement',
    example: 'TXN-1672531200000-A1B2C3D4',
  })
  @ApiResponse({
    status: 200,
    description: 'Paiement trouvé',
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction non trouvée',
  })
  findByTransactionId(@Param('transactionId') transactionId: string) {
    return this.paymentsService.findByTransactionId(transactionId);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Mettre à jour le statut d\'un paiement',
    description: 'Met à jour manuellement le statut d\'un paiement (réservé aux administrateurs)',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID du paiement',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(PaymentStatus),
          example: PaymentStatus.COMPLETED,
        },
        cinetpayTransactionId: {
          type: 'string',
          example: 'CP-1672531200000',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Statut du paiement mis à jour avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Paiement non trouvé',
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: { status: PaymentStatus; cinetpayTransactionId?: string },
  ) {
    return this.paymentsService.updatePaymentStatus(
      id,
      updateData.status,
      updateData.cinetpayTransactionId,
    );
  }

  @Post('cinetpay/callback')
  @ApiOperation({
    summary: 'Callback CinetPay',
    description: 'Endpoint de callback pour recevoir les notifications de statut de CinetPay',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        transactionId: { type: 'string', example: 'TXN-1672531200000-A1B2C3D4' },
        status: { type: 'string', example: 'completed' },
        cinetpayTransactionId: { type: 'string', example: 'CP-1672531200000' },
      },
      required: ['transactionId', 'status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Callback traité avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction non trouvée',
  })
  async handleCinetPayCallback(
    @Body() callbackData: { transactionId: string; status: string; cinetpayTransactionId?: string },
  ) {
    return this.paymentsService.handleCinetPayCallback(
      callbackData.transactionId,
      callbackData.status,
    );
  }
}
