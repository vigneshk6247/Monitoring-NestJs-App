import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { K8sService } from '../../core/k8s/k8s.service';
import { CreateIngressDto } from './dto/create-ingress.dto';
import * as k8s from '@kubernetes/client-node';

@Injectable()
export class IngressService {
  private readonly logger = new Logger(IngressService.name);

  constructor(private readonly k8sService: K8sService) {}

  async findAll(namespace?: string) {
    try {
      let response;
      if (namespace) {
        response = await this.k8sService.networkingV1Api.listNamespacedIngress({ namespace });
      } else {
        response = await this.k8sService.networkingV1Api.listIngressForAllNamespaces();
      }
      return {
        items: response.items,
        count: response.items.length,
      };
    } catch (error) {
      this.logger.error('Failed to list ingresses', error);
      throw error;
    }
  }

  async findOne(namespace: string, name: string) {
    try {
      const response = await this.k8sService.networkingV1Api.readNamespacedIngress({
        name,
        namespace,
      });
      return response;
    } catch (error) {
      if (error.response?.statusCode === 404) {
        throw new NotFoundException(`Ingress ${name} not found in namespace ${namespace}`);
      }
      this.logger.error(`Failed to get ingress ${name}`, error);
      throw error;
    }
  }

  async create(createIngressDto: CreateIngressDto) {
    try {
      const ingress: k8s.V1Ingress = {
        metadata: {
          name: createIngressDto.name,
          namespace: createIngressDto.namespace,
        },
        spec: {
          rules: createIngressDto.rules.map((rule) => ({
            host: rule.host,
            http: {
              paths: [
                {
                  path: rule.path,
                  pathType: 'Prefix',
                  backend: {
                    service: {
                      name: rule.serviceName,
                      port: {
                        number: rule.servicePort,
                      },
                    },
                  },
                },
              ],
            },
          })),
          tls: createIngressDto.tlsSecretName
            ? [
                {
                  secretName: createIngressDto.tlsSecretName,
                  hosts: createIngressDto.rules.map((r) => r.host),
                },
              ]
            : undefined,
        },
      };

      const response = await this.k8sService.networkingV1Api.createNamespacedIngress({
        namespace: createIngressDto.namespace,
        body: ingress,
      });
      this.logger.log(`Ingress ${createIngressDto.name} created successfully`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to create ingress ${createIngressDto.name}`, error);
      throw error;
    }
  }

  async remove(namespace: string, name: string) {
    try {
      await this.k8sService.networkingV1Api.deleteNamespacedIngress({ name, namespace });
      this.logger.log(`Ingress ${name} deleted successfully`);
      return { message: `Ingress ${name} deleted successfully` };
    } catch (error) {
      if (error.response?.statusCode === 404) {
        throw new NotFoundException(`Ingress ${name} not found in namespace ${namespace}`);
      }
      this.logger.error(`Failed to delete ingress ${name}`, error);
      throw error;
    }
  }
}
