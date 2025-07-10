import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { RenewSubscriptionDto } from './dto/renew-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SubscriptionStatus, SubscriptionType } from './entities/subscription.entity';

@ApiTags('Abonnements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ 
    summary: 'Créer un nouvel abonnement',
    description: 'Crée un nouvel abonnement pour un patient et génère le paiement associé'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Abonnement créé avec succès' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Le patient a déjà un abonnement actif' 
  })
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto, @Request() req) {
    return this.subscriptionsService.create(createSubscriptionDto, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ 
    summary: 'Lister tous les abonnements',
    description: 'Récupère la liste paginée de tous les abonnements avec filtres optionnels'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'éléments par page' })
  @ApiQuery({ name: 'status', required: false, enum: SubscriptionStatus, description: 'Filtrer par statut' })
  @ApiQuery({ name: 'type', required: false, enum: SubscriptionType, description: 'Filtrer par type' })
  @ApiQuery({ name: 'patientId', required: false, type: Number, description: 'Filtrer par patient' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Liste des abonnements récupérée avec succès' 
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: SubscriptionStatus,
    @Query('type') type?: SubscriptionType,
    @Query('patientId') patientId?: number,
  ) {
    return this.subscriptionsService.findAll(page, limit, status, type, patientId);
  }

  @Get('plans')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ 
    summary: 'Obtenir les plans d\'abonnement disponibles',
    description: 'Récupère la liste des plans d\'abonnement avec leurs caractéristiques et prix'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Plans d\'abonnement récupérés avec succès' 
  })
  async getPlans() {
    return this.subscriptionsService.getSubscriptionPlans();
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Statistiques des abonnements',
    description: 'Récupère les statistiques détaillées sur les abonnements'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Statistiques récupérées avec succès' 
  })
  async getStats() {
    return this.subscriptionsService.getSubscriptionStats();
  }

  @Get('patient/:patientId/active')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ 
    summary: 'Obtenir l\'abonnement actif d\'un patient',
    description: 'Récupère l\'abonnement actuellement actif pour un patient donné'
  })
  @ApiParam({ name: 'patientId', type: Number, description: 'ID du patient' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Abonnement actif récupéré avec succès' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Aucun abonnement actif trouvé' 
  })
  async getActiveSubscription(@Param('patientId', ParseIntPipe) patientId: number) {
    return this.subscriptionsService.getActiveSubscription(patientId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ 
    summary: 'Obtenir un abonnement par ID',
    description: 'Récupère les détails d\'un abonnement spécifique'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de l\'abonnement' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Abonnement récupéré avec succès' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Abonnement non trouvé' 
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ 
    summary: 'Activer un abonnement',
    description: 'Active un abonnement en attente (généralement après confirmation du paiement)'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de l\'abonnement' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Abonnement activé avec succès' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Seuls les abonnements en attente peuvent être activés' 
  })
  async activate(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.activateSubscription(id);
  }

  @Post(':id/renew')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ 
    summary: 'Renouveler un abonnement',
    description: 'Crée un renouvellement d\'abonnement et génère le paiement associé'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de l\'abonnement à renouveler' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Renouvellement créé avec succès' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Impossible de renouveler un abonnement annulé' 
  })
  async renew(
    @Param('id', ParseIntPipe) id: number,
    @Body() renewDto: RenewSubscriptionDto,
    @Request() req,
  ) {
    return this.subscriptionsService.renewSubscription(id, renewDto, req.user.id);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ 
    summary: 'Annuler un abonnement',
    description: 'Annule un abonnement (il ne pourra plus être réactivé)'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de l\'abonnement' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Abonnement annulé avec succès' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Abonnement déjà annulé' 
  })
  async cancel(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.cancelSubscription(id);
  }
}
