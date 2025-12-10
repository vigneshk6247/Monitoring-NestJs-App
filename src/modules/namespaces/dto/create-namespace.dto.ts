import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNamespaceDto {
  @ApiProperty({ description: 'Name of the namespace' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Labels for the namespace', required: false })
  @IsOptional()
  @IsObject()
  labels?: Record<string, string>;

  @ApiProperty({ description: 'Annotations for the namespace', required: false })
  @IsOptional()
  @IsObject()
  annotations?: Record<string, string>;
}
