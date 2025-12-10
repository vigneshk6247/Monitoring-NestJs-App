import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NamespacesService } from './namespaces.service';
import { CreateNamespaceDto } from './dto/create-namespace.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('namespaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('namespaces')
export class NamespacesController {
  constructor(private readonly namespacesService: NamespacesService) {}

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'List all namespaces' })
  @ApiResponse({ status: 200, description: 'Returns all namespaces' })
  findAll() {
    return this.namespacesService.findAll();
  }

  @Get(':name')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a specific namespace' })
  @ApiResponse({ status: 200, description: 'Returns the namespace' })
  @ApiResponse({ status: 404, description: 'Namespace not found' })
  findOne(@Param('name') name: string) {
    return this.namespacesService.findOne(name);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new namespace' })
  @ApiResponse({ status: 201, description: 'Namespace created successfully' })
  create(@Body() createNamespaceDto: CreateNamespaceDto) {
    return this.namespacesService.create(createNamespaceDto);
  }

  @Delete(':name')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a namespace' })
  @ApiResponse({ status: 200, description: 'Namespace deleted successfully' })
  @ApiResponse({ status: 404, description: 'Namespace not found' })
  remove(@Param('name') name: string) {
    return this.namespacesService.remove(name);
  }
}
