import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PodsService } from './pods.service';
import { CreatePodDto } from './dto/create-pod.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('pods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pods')
export class PodsController {
  constructor(private readonly podsService: PodsService) {}

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'List all pods' })
  @ApiQuery({ name: 'namespace', required: false })
  @ApiResponse({ status: 200, description: 'Returns all pods' })
  findAll(@Query('namespace') namespace?: string) {
    return this.podsService.findAll(namespace);
  }

  @Get(':namespace/:name')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a specific pod' })
  @ApiResponse({ status: 200, description: 'Returns the pod' })
  @ApiResponse({ status: 404, description: 'Pod not found' })
  findOne(@Param('namespace') namespace: string, @Param('name') name: string) {
    return this.podsService.findOne(namespace, name);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new pod' })
  @ApiResponse({ status: 201, description: 'Pod created successfully' })
  create(@Body() createPodDto: CreatePodDto) {
    return this.podsService.create(createPodDto);
  }

  @Delete(':namespace/:name')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a pod' })
  @ApiResponse({ status: 200, description: 'Pod deleted successfully' })
  @ApiResponse({ status: 404, description: 'Pod not found' })
  remove(@Param('namespace') namespace: string, @Param('name') name: string) {
    return this.podsService.remove(namespace, name);
  }

  @Get(':namespace/:name/logs')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get pod logs' })
  @ApiQuery({ name: 'tailLines', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns pod logs' })
  getLogs(
    @Param('namespace') namespace: string,
    @Param('name') name: string,
    @Query('tailLines') tailLines?: number,
  ) {
    return this.podsService.getLogs(namespace, name, tailLines);
  }

  @Get(':namespace/:name/status')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get pod status' })
  @ApiResponse({ status: 200, description: 'Returns pod status' })
  getStatus(@Param('namespace') namespace: string, @Param('name') name: string) {
    return this.podsService.getStatus(namespace, name);
  }
}
