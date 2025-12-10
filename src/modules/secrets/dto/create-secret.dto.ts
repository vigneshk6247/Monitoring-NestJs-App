import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSecretDto {
  @ApiProperty({ description: 'Name of the secret' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Namespace for the secret' })
  @IsString()
  namespace: string;

  @ApiProperty({ description: 'Secret type', enum: ['Opaque', 'kubernetes.io/tls'] })
  @IsEnum(['Opaque', 'kubernetes.io/tls'])
  type: string;

  @ApiProperty({ description: 'Secret data (key-value pairs, will be base64 encoded)' })
  @IsObject()
  data: Record<string, string>;

  @ApiProperty({ description: 'Labels for the secret', required: false })
  @IsOptional()
  @IsObject()
  labels?: Record<string, string>;
}
