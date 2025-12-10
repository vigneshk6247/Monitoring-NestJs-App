import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { K8sService } from '../../core/k8s/k8s.service';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import * as k8s from '@kubernetes/client-node';

@Injectable()
export class DeploymentsService {
  private readonly logger = new Logger(DeploymentsService.name);

  constructor(private readonly k8sService: K8sService) {}

  async findAll(namespace?: string) {
    try {
      let response;
      if (namespace) {
        response = await this.k8sService.appsV1Api.listNamespacedDeployment({ namespace });
      } else {
        response = await this.k8sService.appsV1Api.listDeploymentForAllNamespaces();
      }
      return {
        items: response.items,
        count: response.items.length,
      };
    } catch (error) {
      this.logger.error('Failed to list deployments', error);
      throw error;
    }
  }

  async findOne(namespace: string, name: string) {
    try {
      const response = await this.k8sService.appsV1Api.readNamespacedDeployment({ name, namespace });
      return response;
    } catch (error) {
      if (error.response?.statusCode === 404) {
        throw new NotFoundException(`Deployment ${name} not found in namespace ${namespace}`);
      }
      this.logger.error(`Failed to get deployment ${name}`, error);
      throw error;
    }
  }

  async create(createDeploymentDto: CreateDeploymentDto) {
    try {
      const deployment: k8s.V1Deployment = {
        metadata: {
          name: createDeploymentDto.name,
          namespace: createDeploymentDto.namespace,
          labels: createDeploymentDto.labels || { app: createDeploymentDto.name },
        },
        spec: {
          replicas: createDeploymentDto.replicas || 1,
          selector: {
            matchLabels: createDeploymentDto.labels || { app: createDeploymentDto.name },
          },
          template: {
            metadata: {
              labels: createDeploymentDto.labels || { app: createDeploymentDto.name },
            },
            spec: {
              containers: [
                {
                  name: createDeploymentDto.name,
                  image: createDeploymentDto.image,
                  ports: createDeploymentDto.port
                    ? [{ containerPort: createDeploymentDto.port }]
                    : undefined,
                },
              ],
            },
          },
        },
      };

      const response = await this.k8sService.appsV1Api.createNamespacedDeployment({
        namespace: createDeploymentDto.namespace,
        body: deployment,
      });
      this.logger.log(`Deployment ${createDeploymentDto.name} created successfully`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to create deployment ${createDeploymentDto.name}`, error);
      throw error;
    }
  }

  async remove(namespace: string, name: string) {
    try {
      await this.k8sService.appsV1Api.deleteNamespacedDeployment({ name, namespace });
      this.logger.log(`Deployment ${name} deleted successfully`);
      return { message: `Deployment ${name} deleted successfully` };
    } catch (error) {
      if (error.response?.statusCode === 404) {
        throw new NotFoundException(`Deployment ${name} not found in namespace ${namespace}`);
      }
      this.logger.error(`Failed to delete deployment ${name}`, error);
      throw error;
    }
  }

  async scale(namespace: string, name: string, replicas: number) {
    try {
      const patch = {
        spec: {
          replicas: replicas,
        },
      };

      const options = { headers: { 'Content-Type': 'application/merge-patch+json' } };
      const response = await this.k8sService.appsV1Api.patchNamespacedDeployment({
        name,
        namespace,
        body: patch,
      });

      this.logger.log(`Deployment ${name} scaled to ${replicas} replicas`);
      return response;
    } catch (error) {
      if (error.response?.statusCode === 404) {
        throw new NotFoundException(`Deployment ${name} not found in namespace ${namespace}`);
      }
      this.logger.error(`Failed to scale deployment ${name}`, error);
      throw error;
    }
  }

  async getStatus(namespace: string, name: string) {
    try {
      const response = await this.k8sService.appsV1Api.readNamespacedDeploymentStatus({
        name,
        namespace,
      });
      return {
        name: response.metadata!.name,
        namespace: response.metadata!.namespace,
        replicas: response.status!.replicas,
        availableReplicas: response.status!.availableReplicas,
        readyReplicas: response.status!.readyReplicas,
        updatedReplicas: response.status!.updatedReplicas,
        conditions: response.status!.conditions,
      };
    } catch (error) {
      if (error.response?.statusCode === 404) {
        throw new NotFoundException(`Deployment ${name} not found in namespace ${namespace}`);
      }
      this.logger.error(`Failed to get status for deployment ${name}`, error);
      throw error;
    }
  }
}
