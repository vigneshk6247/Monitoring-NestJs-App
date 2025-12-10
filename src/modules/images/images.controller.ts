import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('images')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER, UserRole.ADMIN)
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  @ApiOperation({ summary: 'List all Docker images used in the cluster' })
  @ApiQuery({ name: 'namespace', required: false })
  @ApiResponse({ status: 200, description: 'Returns all images' })
  findAll(@Query('namespace') namespace?: string) {
    return this.imagesService.findAll(namespace);
  }

  @Get('details/:imageName')
  @ApiOperation({ summary: 'Get details about a specific image' })
  @ApiResponse({ status: 200, description: 'Returns image details' })
  getImageDetails(@Param('imageName') imageName: string) {
    // Decode the image name (it might contain special characters)
    const decodedImageName = decodeURIComponent(imageName);
    return this.imagesService.getImageDetails(decodedImageName);
  }
}
