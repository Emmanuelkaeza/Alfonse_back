import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
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
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Gestion des patients')
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({
    summary: 'Enregistrer un nouveau patient',
    description: 'Permet d\'enregistrer un nouveau patient dans le système',
  })
  @ApiBody({ type: CreatePatientDto })
  @ApiResponse({
    status: 201,
    description: 'Patient enregistré avec succès',
  })
  @ApiResponse({
    status: 409,
    description: 'Un patient avec cet email existe déjà',
  })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({
    summary: 'Récupérer la liste des patients',
    description: 'Récupère la liste paginée des patients avec possibilité de recherche',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Terme de recherche (nom, prénom, email, téléphone)',
    example: 'Marie',
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
  @ApiResponse({
    status: 200,
    description: 'Liste des patients récupérée avec succès',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 5 },
      },
    },
  })
  findAll(
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.patientsService.findAll(search, page, limit);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Statistiques des patients',
    description: 'Récupère les statistiques générales des patients',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        totalPatients: { type: 'number', example: 150 },
        activePatients: { type: 'number', example: 145 },
        inactivePatients: { type: 'number', example: 5 },
        genderStats: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              gender: { type: 'string', example: 'female' },
              count: { type: 'number', example: 80 },
            },
          },
        },
      },
    },
  })
  getStats() {
    return this.patientsService.getPatientStats();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({
    summary: 'Récupérer un patient par ID',
    description: 'Récupère les détails complets d\'un patient, incluant l\'historique des paiements',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID du patient',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Patient trouvé',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient non trouvé',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({
    summary: 'Mettre à jour un patient',
    description: 'Met à jour les informations d\'un patient existant',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID du patient à modifier',
  })
  @ApiBody({ type: UpdatePatientDto })
  @ApiResponse({
    status: 200,
    description: 'Patient mis à jour avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient non trouvé',
  })
  @ApiResponse({
    status: 409,
    description: 'Un patient avec cet email existe déjà',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un patient',
    description: 'Supprime définitivement un patient du système',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID du patient à supprimer',
  })
  @ApiResponse({
    status: 204,
    description: 'Patient supprimé avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient non trouvé',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.remove(id);
  }

  @Patch(':id/toggle-status')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({
    summary: 'Activer/Désactiver un patient',
    description: 'Change le statut actif/inactif d\'un patient',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID du patient',
  })
  @ApiResponse({
    status: 200,
    description: 'Statut du patient modifié avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient non trouvé',
  })
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.toggleStatus(id);
  }
}
