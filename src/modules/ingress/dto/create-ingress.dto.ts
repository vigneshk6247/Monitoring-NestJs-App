import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class IngressRuleDto {
  @ApiProperty()
  @IsString()
  host: string;

  @ApiProperty()
  @IsString()
  path: string;

  @ApiProperty()
  @IsString()
  serviceName: string;

  @ApiProperty()
  @IsNumber()
  servicePort: number;
}

export class CreateIngressDto {
  @ApiProperty({ description: 'Name of the ingress' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Namespace for the ingress' })
  @IsString()
  namespace: string;

  @ApiProperty({ description: 'Ingress rules' })
  @IsArray()
  rules: IngressRuleDto[];

  @ApiProperty({ description: 'TLS secret name', required: false })
  @IsOptional()
  @IsString()
  tlsSecretName?: string;
}
