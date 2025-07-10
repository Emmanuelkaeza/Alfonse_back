import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@ApiTags('Gestion des utilisateurs')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Créer un nouvel utilisateur',
    description: 'Permet à un administrateur de créer un nouveau réceptionniste ou administrateur',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
  })
  @ApiResponse({
    status: 409,
    description: 'Un utilisateur avec cet email existe déjà',
  })
  @ApiResponse({
    status: 403,
    description: 'Permissions insuffisantes - Seuls les administrateurs peuvent créer des utilisateurs',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Récupérer tous les utilisateurs',
    description: 'Récupère la liste de tous les utilisateurs du système',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs récupérée avec succès',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Récupérer un utilisateur par ID',
    description: 'Récupère les détails d\'un utilisateur spécifique',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID de l\'utilisateur',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur trouvé',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Mettre à jour un utilisateur',
    description: 'Met à jour les informations d\'un utilisateur existant',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID de l\'utilisateur à modifier',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur mis à jour avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  @ApiResponse({
    status: 409,
    description: 'Un utilisateur avec cet email existe déjà',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un utilisateur',
    description: 'Supprime définitivement un utilisateur du système',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID de l\'utilisateur à supprimer',
  })
  @ApiResponse({
    status: 204,
    description: 'Utilisateur supprimé avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Patch(':id/toggle-status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Activer/Désactiver un utilisateur',
    description: 'Change le statut actif/inactif d\'un utilisateur',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID de l\'utilisateur',
  })
  @ApiResponse({
    status: 200,
    description: 'Statut de l\'utilisateur modifié avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.toggleStatus(id);
  }
}
