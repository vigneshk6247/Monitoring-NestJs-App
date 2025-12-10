import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { K8sService } from '../../core/k8s/k8s.service';
import { CreateNamespaceDto } from './dto/create-namespace.dto';
import * as k8s from '@kubernetes/client-node';

@Injectable()
export class NamespacesService {
  private readonly logger = new Logger(NamespacesService.name);

  constructor(private readonly k8sService: K8sService) {}

  async findAll() {
    try {
      const response = await this.k8sService.coreV1Api.listNamespace();
      return {
        items: response.items,
        count: response.items.length,
      };
    } catch (error) {
      this.logger.error('Failed to list namespaces', error);
      throw error;
    }
  }

  async findOne(name: string) {
    try {
      const response = await this.k8sService.coreV1Api.readNamespace({ name });
      return response;
    } catch (error) {
      if (error.response?.statusCode === 404) {
        throw new NotFoundException(`Namespace ${name} not found`);
      }
      this.logger.error(`Failed to get namespace ${name}`, error);
      throw error;
    }
  }

  async create(createNamespaceDto: CreateNamespaceDto) {
    try {
      const namespace: k8s.V1Namespace = {
        metadata: {
          name: createNamespaceDto.name,
          labels: createNamespaceDto.labels || {},
          annotations: createNamespaceDto.annotations || {},
        },
      };

      const response = await this.k8sService.coreV1Api.createNamespace({ body: namespace });
      this.logger.log(`Namespace ${createNamespaceDto.name} created successfully`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to create namespace ${createNamespaceDto.name}`, error);
      throw error;
    }
  }

  async remove(name: string) {
    try {
      await this.k8sService.coreV1Api.deleteNamespace({ name });
      this.logger.log(`Namespace ${name} deleted successfully`);
      return { message: `Namespace ${name} deleted successfully` };
    } catch (error) {
      if (error.response?.statusCode === 404) {
        throw new NotFoundException(`Namespace ${name} not found`);
      }
      this.logger.error(`Failed to delete namespace ${name}`, error);
      throw error;
    }
  }
}
