import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePodDto {
  @ApiProperty({ description: 'Name of the pod' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Namespace for the pod' })
  @IsString()
  namespace: string;

  @ApiProperty({ description: 'Container image' })
  @IsString()
  image: string;

  @ApiProperty({ description: 'Container name', required: false })
  @IsOptional()
  @IsString()
  containerName?: string;

  @ApiProperty({ description: 'Labels for the pod', required: false })
  @IsOptional()
  @IsObject()
  labels?: Record<string, string>;

  @ApiProperty({ description: 'Environment variables', required: false })
  @IsOptional()
  @IsArray()
  env?: Array<{ name: string; value: string }>;
}
