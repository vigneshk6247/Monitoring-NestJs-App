import { IsString, IsNumber, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ description: 'Name of the service' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Namespace for the service' })
  @IsString()
  namespace: string;

  @ApiProperty({ description: 'Service type', enum: ['ClusterIP', 'NodePort', 'LoadBalancer'] })
  @IsEnum(['ClusterIP', 'NodePort', 'LoadBalancer'])
  type: string;

  @ApiProperty({ description: 'Service port' })
  @IsNumber()
  port: number;

  @ApiProperty({ description: 'Target port', required: false })
  @IsOptional()
  @IsNumber()
  targetPort?: number;

  @ApiProperty({ description: 'Selector labels', required: false })
  @IsOptional()
  @IsObject()
  selector?: Record<string, string>;
}
