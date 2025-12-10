import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { K8sService } from '../../core/k8s/k8s.service';
import { CreateServiceDto } from './dto/create-service.dto';
import * as k8s from '@kubernetes/client-node';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(private readonly k8sService: K8sService) {}

  async findAll(namespace?: string) {
    try {
      let response;
      if (namespace) {
        response = await this.k8sService.coreV1Api.listNamespacedService({ namespace });
      } else {
        response = await this.k8sService.coreV1Api.listServiceForAllNamespaces();
      }
      return {
        items: response.items,
        count: response.items.length,
      };
    } catch (error) {
      this.logger.error('Failed to list services', error);
      throw error;
    }
  }

  async findOne(namespace: string, name: string) {
    try {
      const response = await this.k8sService.coreV1Api.readNamespacedService({ name, namespace });
      return response;
    } catch (error) {
      if (error.response?.statusCode === 404) {
        throw new NotFoundException(`Service ${name} not found in namespace ${namespace}`);
      }
      this.logger.error(`Failed to get service ${name}`, error);
      throw error;
    }
  }

  async create(createServiceDto: CreateServiceDto) {
    try {
      const service: k8s.V1Service = {
        metadata: {
          name: createServiceDto.name,
          namespace: createServiceDto.namespace,
        },
        spec: {
          type: createServiceDto.type,
          selector: createServiceDto.selector || { app: createServiceDto.name },
          ports: [
            {
              port: createServiceDto.port,
              targetPort: createServiceDto.targetPort || createServiceDto.port as any,
            },
          ],
        },
      };

      const response = await this.k8sService.coreV1Api.createNamespacedService({
        namespace: createServiceDto.namespace,
        body: service,
      });
      this.logger.log(`Service ${createServiceDto.name} created successfully`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to create service ${createServiceDto.name}`, error);
      throw error;
    }
  }

  async remove(namespace: string, name: string) {
    try {
      await this.k8sService.coreV1Api.deleteNamespacedService({ name, namespace });
      this.logger.log(`Service ${name} deleted successfully`);
      return { message: `Service ${name} deleted successfully` };
    } catch (error) {
      if (error.response?.statusCode === 404) {
        throw new NotFoundException(`Service ${name} not found in namespace ${namespace}`);
      }
      this.logger.error(`Failed to delete service ${name}`, error);
      throw error;
    }
  }

  async getEndpoints(namespace: string, name: string) {
    try {
      const response = await this.k8sService.coreV1Api.readNamespacedEndpoints({ name, namespace });
      return response;
    } catch (error) {
      if (error.response?.statusCode === 404) {
        throw new NotFoundException(`Endpoints for service ${name} not found`);
      }
      this.logger.error(`Failed to get endpoints for service ${name}`, error);
      throw error;
    }
  }
}
