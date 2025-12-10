import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SecretsService } from './secrets.service';
import { CreateSecretDto } from './dto/create-secret.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('secrets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('secrets')
export class SecretsController {
  constructor(private readonly secretsService: SecretsService) {}

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'List all secrets' })
  @ApiQuery({ name: 'namespace', required: false })
  @ApiResponse({ status: 200, description: 'Returns all secrets (keys only)' })
  findAll(@Query('namespace') namespace?: string) {
    return this.secretsService.findAll(namespace);
  }

  @Get('tls')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'List all TLS secrets' })
  @ApiQuery({ name: 'namespace', required: false })
  @ApiResponse({ status: 200, description: 'Returns all TLS type secrets' })
  getTLSSecrets(@Query('namespace') namespace?: string) {
    return this.secretsService.getTLSSecrets(namespace);
  }

  @Get(':namespace/:name')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a specific secret' })
  @ApiResponse({ status: 200, description: 'Returns the secret (keys only)' })
  @ApiResponse({ status: 404, description: 'Secret not found' })
  findOne(@Param('namespace') namespace: string, @Param('name') name: string) {
    return this.secretsService.findOne(namespace, name);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new secret' })
  @ApiResponse({ status: 201, description: 'Secret created successfully' })
  create(@Body() createSecretDto: CreateSecretDto) {
    return this.secretsService.create(createSecretDto);
  }

  @Delete(':namespace/:name')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a secret' })
  @ApiResponse({ status: 200, description: 'Secret deleted successfully' })
  @ApiResponse({ status: 404, description: 'Secret not found' })
  remove(@Param('namespace') namespace: string, @Param('name') name: string) {
    return this.secretsService.remove(namespace, name);
  }

  @Get(':namespace/:name/details')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a specific secret details' })
  @ApiResponse({ status: 200, description: 'Returns the secret with decoded values' })
  @ApiResponse({ status: 404, description: 'Secret not found' })
  getDetails(@Param('namespace') namespace: string, @Param('name') name: string) {
    return this.secretsService.getSecretDetails(namespace, name);
  }
}
