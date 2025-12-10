import { Controller, Get, Post, Delete, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DeploymentsService } from './deployments.service';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('deployments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('deployments')
export class DeploymentsController {
  constructor(private readonly deploymentsService: DeploymentsService) {}

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'List all deployments' })
  @ApiQuery({ name: 'namespace', required: false })
  @ApiResponse({ status: 200, description: 'Returns all deployments' })
  findAll(@Query('namespace') namespace?: string) {
    return this.deploymentsService.findAll(namespace);
  }

  @Get(':namespace/:name')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a specific deployment' })
  @ApiResponse({ status: 200, description: 'Returns the deployment' })
  @ApiResponse({ status: 404, description: 'Deployment not found' })
  findOne(@Param('namespace') namespace: string, @Param('name') name: string) {
    return this.deploymentsService.findOne(namespace, name);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new deployment' })
  @ApiResponse({ status: 201, description: 'Deployment created successfully' })
  create(@Body() createDeploymentDto: CreateDeploymentDto) {
    return this.deploymentsService.create(createDeploymentDto);
  }

  @Delete(':namespace/:name')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a deployment' })
  @ApiResponse({ status: 200, description: 'Deployment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Deployment not found' })
  remove(@Param('namespace') namespace: string, @Param('name') name: string) {
    return this.deploymentsService.remove(namespace, name);
  }

  @Patch(':namespace/:name/scale')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Scale a deployment' })
  @ApiResponse({ status: 200, description: 'Deployment scaled successfully' })
  scale(
    @Param('namespace') namespace: string,
    @Param('name') name: string,
    @Body('replicas') replicas: number,
  ) {
    return this.deploymentsService.scale(namespace, name, replicas);
  }

  @Get(':namespace/:name/status')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get deployment status' })
  @ApiResponse({ status: 200, description: 'Returns deployment status' })
  getStatus(@Param('namespace') namespace: string, @Param('name') name: string) {
    return this.deploymentsService.getStatus(namespace, name);
  }
}
