import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeploymentDto {
  @ApiProperty({ description: 'Name of the deployment' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Namespace for the deployment' })
  @IsString()
  namespace: string;

  @ApiProperty({ description: 'Container image' })
  @IsString()
  image: string;

  @ApiProperty({ description: 'Number of replicas', default: 1 })
  @IsOptional()
  @IsNumber()
  replicas?: number;

  @ApiProperty({ description: 'Container port', required: false })
  @IsOptional()
  @IsNumber()
  port?: number;

  @ApiProperty({ description: 'Labels for the deployment', required: false })
  @IsOptional()
  @IsObject()
  labels?: Record<string, string>;
}
