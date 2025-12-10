import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { K8sService } from '../../core/k8s/k8s.service';
import { CreatePodDto } from './dto/create-pod.dto';
import * as k8s from '@kubernetes/client-node';

@Injectable()
export class PodsService {
  private readonly logger = new Logger(PodsService.name);

  constructor(private readonly k8sService: K8sService) {}

  async findAll(namespace?: string) {
    try {
      let response;
      if (namespace) {
        response = await this.k8sService.coreV1Api.listNamespacedPod({ namespace });
      } else {
        response = await this.k8sService.coreV1Api.listPodForAllNamespaces();
      }
      return {
        items: response.items,
        count: response.items.length,
      };
    } catch (error) {
      this.logger.error('Failed to list pods', error);
      throw error;
    }
  }

  async findOne(namespace: string, name: string) {
    try {
      const response = await this.k8sService.coreV1Api.readNamespacedPod({ name, namespace });
      return response;
    } catch (error) {
      if (error.response?.statusCode === 404) {
        throw new NotFoundException(`Pod ${name} not found in namespace ${namespace}`);
      }
      this.logger.error(`Failed to get pod ${name}`, error);
      throw error;
    }
  }

  async create(createPodDto: CreatePodDto) {
    try {
      const pod: k8s.V1Pod = {
        metadata: {
          name: createPodDto.name,
          namespace: createPodDto.namespace,
          labels: createPodDto.labels || {},
        },
        spec: {
          containers: [
            {
              name: createPodDto.containerName || 'container',
              image: createPodDto.image,
              env: createPodDto.env || [],
            },
          ],
        },
      };

      const response = await this.k8sService.coreV1Api.createNamespacedPod({
        namespace: createPodDto.namespace,
        body: pod,
      });
      this.logger.log(`Pod ${createPodDto.name} created successfully`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to create pod ${createPodDto.name}`, error);
      throw error;
    }
  }

  async remove(namespace: string, name: string) {
    try {
      await this.k8sService.coreV1Api.deleteNamespacedPod({ name, namespace });
      this.logger.log(`Pod ${name} deleted successfully`);
      return { message: `Pod ${name} deleted successfully` };
    } catch (error) {
      if (error.response?.statusCode === 404) {
        throw new NotFoundException(`Pod ${name} not found in namespace ${namespace}`);
      }
      this.logger.error(`Failed to delete pod ${name}`, error);
      throw error;
    }
  }

  async getLogs(namespace: string, name: string, tailLines?: number) {
    try {
      const response = await this.k8sService.coreV1Api.readNamespacedPodLog({
        name,
        namespace,
        container: undefined,
        follow: false,
        insecureSkipTLSVerifyBackend: undefined,
        limitBytes: undefined,
        pretty: undefined,
        previous: undefined,
        sinceSeconds: undefined,
        tailLines,
      });
      return {
        podName: name,
        namespace,
        logs: response,
      };
    } catch (error) {
      if (error.response?.statusCode === 404) {
        throw new NotFoundException(`Pod ${name} not found in namespace ${namespace}`);
      }
      this.logger.error(`Failed to get logs for pod ${name}`, error);
      throw error;
    }
  }

  async getStatus(namespace: string, name: string) {
    try {
      const response = await this.k8sService.coreV1Api.readNamespacedPodStatus({ name, namespace });
      return {
        name: response.metadata!.name,
        namespace: response.metadata!.namespace,
        phase: response.status!.phase,
        conditions: response.status!.conditions,
        containerStatuses: response.status!.containerStatuses,
      };
    } catch (error) {
      if (error.response?.statusCode === 404) {
        throw new NotFoundException(`Pod ${name} not found in namespace ${namespace}`);
      }
      this.logger.error(`Failed to get status for pod ${name}`, error);
      throw error;
    }
  }
}
