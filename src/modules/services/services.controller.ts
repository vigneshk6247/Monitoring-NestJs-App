import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'List all services' })
  @ApiQuery({ name: 'namespace', required: false })
  @ApiResponse({ status: 200, description: 'Returns all services' })
  findAll(@Query('namespace') namespace?: string) {
    return this.servicesService.findAll(namespace);
  }

  @Get(':namespace/:name')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a specific service' })
  @ApiResponse({ status: 200, description: 'Returns the service' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  findOne(@Param('namespace') namespace: string, @Param('name') name: string) {
    return this.servicesService.findOne(namespace, name);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Delete(':namespace/:name')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a service' })
  @ApiResponse({ status: 200, description: 'Service deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  remove(@Param('namespace') namespace: string, @Param('name') name: string) {
    return this.servicesService.remove(namespace, name);
  }

  @Get(':namespace/:name/endpoints')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get service endpoints' })
  @ApiResponse({ status: 200, description: 'Returns service endpoints' })
  getEndpoints(@Param('namespace') namespace: string, @Param('name') name: string) {
    return this.servicesService.getEndpoints(namespace, name);
  }
}
