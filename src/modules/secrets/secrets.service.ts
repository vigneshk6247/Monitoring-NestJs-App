import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { K8sService } from '../../core/k8s/k8s.service';
import { CreateSecretDto } from './dto/create-secret.dto';
import * as k8s from '@kubernetes/client-node';

@Injectable()
export class SecretsService {
  private readonly logger = new Logger(SecretsService.name);

  constructor(private readonly k8sService: K8sService) {}

  async findAll(namespace?: string) {
    try {
      let response;
      if (namespace) {
        response = await this.k8sService.coreV1Api.listNamespacedSecret({ namespace });
      } else {
        response = await this.k8sService.coreV1Api.listSecretForAllNamespaces();
      }
      return {
        items: response.items.map((secret) => ({
          ...secret,
          data: secret.data ? Object.keys(secret.data) : [], // Don't expose actual secret values
        })),
        count: response.items.length,
      };
    } catch (error) {
      this.logger.error('Failed to list secrets', error);
      throw error;
    }
  }

  async findOne(namespace: string, name: string) {
    try {
      const response = await this.k8sService.coreV1Api.readNamespacedSecret({ name, namespace });
      // Return keys only, not actual values for security
      return {
        ...response,
        data: response.data ? Object.keys(response.data) : [],
      };
    } catch (error) {
      if (error.response?.statusCode === 404) {
        throw new NotFoundException(`Secret ${name} not found in namespace ${namespace}`);
      }
      this.logger.error(`Failed to get secret ${name}`, error);
      throw error;
    }
  }

  async create(createSecretDto: CreateSecretDto) {
    try {
      // Base64 encode the data
      const encodedData: Record<string, string> = {};
      for (const [key, value] of Object.entries(createSecretDto.data)) {
        encodedData[key] = Buffer.from(value).toString('base64');
      }

      const secret: k8s.V1Secret = {
        metadata: {
          name: createSecretDto.name,
          namespace: createSecretDto.namespace,
          labels: createSecretDto.labels || {},
        },
        type: createSecretDto.type,
        data: encodedData,
      };

      const response = await this.k8sService.coreV1Api.createNamespacedSecret({
        namespace: createSecretDto.namespace,
        body: secret,
      });
      this.logger.log(`Secret ${createSecretDto.name} created successfully`);
      return {
        ...response,
        data: Object.keys(encodedData),
      };
    } catch (error) {
      this.logger.error(`Failed to create secret ${createSecretDto.name}`, error);
      throw error;
    }
  }

  async remove(namespace: string, name: string) {
    try {
      await this.k8sService.coreV1Api.deleteNamespacedSecret({ name, namespace });
      this.logger.log(`Secret ${name} deleted successfully`);
      return { message: `Secret ${name} deleted successfully` };
    } catch (error) {
      if (error.response?.statusCode === 404) {
        throw new NotFoundException(`Secret ${name} not found in namespace ${namespace}`);
      }
      this.logger.error(`Failed to delete secret ${name}`, error);
      throw error;
    }
  }

  async getTLSSecrets(namespace?: string) {
    try {
      const secrets = await this.findAll(namespace);
      return {
        items: secrets.items.filter((secret: any) => secret.type === 'kubernetes.io/tls'),
      };
    } catch (error) {
      this.logger.error('Failed to get TLS secrets', error);
      throw error;
    }
  }

  async getSecretDetails(namespace: string, name: string) {
    try {
      const response = await this.k8sService.coreV1Api.readNamespacedSecret({ name, namespace });
      
      const decodedData: Record<string, string> = {};
      if (response.data) {
        for (const [key, value] of Object.entries(response.data)) {
          decodedData[key] = Buffer.from(value, 'base64').toString('utf-8');
        }
      }

      return {
        ...response,
        data: decodedData,
      };
    } catch (error) {
      if (error.response?.statusCode === 404) {
        throw new NotFoundException(`Secret ${name} not found in namespace ${namespace}`);
      }
      this.logger.error(`Failed to get secret details for ${name}`, error);
      throw error;
    }
  }
}
