import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { IngressService } from './ingress.service';
import { CreateIngressDto } from './dto/create-ingress.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('ingress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ingress')
export class IngressController {
  constructor(private readonly ingressService: IngressService) {}

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'List all ingresses' })
  @ApiQuery({ name: 'namespace', required: false })
  @ApiResponse({ status: 200, description: 'Returns all ingresses' })
  findAll(@Query('namespace') namespace?: string) {
    return this.ingressService.findAll(namespace);
  }

  @Get(':namespace/:name')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a specific ingress' })
  @ApiResponse({ status: 200, description: 'Returns the ingress' })
  @ApiResponse({ status: 404, description: 'Ingress not found' })
  findOne(@Param('namespace') namespace: string, @Param('name') name: string) {
    return this.ingressService.findOne(namespace, name);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new ingress' })
  @ApiResponse({ status: 201, description: 'Ingress created successfully' })
  create(@Body() createIngressDto: CreateIngressDto) {
    return this.ingressService.create(createIngressDto);
  }

  @Delete(':namespace/:name')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an ingress' })
  @ApiResponse({ status: 200, description: 'Ingress deleted successfully' })
  @ApiResponse({ status: 404, description: 'Ingress not found' })
  remove(@Param('namespace') namespace: string, @Param('name') name: string) {
    return this.ingressService.remove(namespace, name);
  }
}
