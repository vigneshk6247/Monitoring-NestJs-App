import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as k8s from '@kubernetes/client-node';

@Injectable()
export class K8sService implements OnModuleInit {
  private readonly logger = new Logger(K8sService.name);
  private kubeConfig: k8s.KubeConfig;
  
  public coreV1Api: k8s.CoreV1Api;
  public appsV1Api: k8s.AppsV1Api;
  public networkingV1Api: k8s.NetworkingV1Api;
  public batchV1Api: k8s.BatchV1Api;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.kubeConfig = new k8s.KubeConfig();
      
      // Load from default kubeconfig file
      this.kubeConfig.loadFromDefault();
      
      // Initialize API clients
      this.coreV1Api = this.kubeConfig.makeApiClient(k8s.CoreV1Api);
      this.appsV1Api = this.kubeConfig.makeApiClient(k8s.AppsV1Api);
      this.networkingV1Api = this.kubeConfig.makeApiClient(k8s.NetworkingV1Api);
      this.batchV1Api = this.kubeConfig.makeApiClient(k8s.BatchV1Api);

      this.logger.log('Kubernetes client initialized successfully');
      
      // Test connection
      await this.healthCheck();
    } catch (error) {
      this.logger.error('Failed to initialize Kubernetes client', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.coreV1Api.listNamespace();
      this.logger.log('Kubernetes connection health check passed');
      return true;
    } catch (error) {
      this.logger.error('Kubernetes connection health check failed', error);
      throw error;
    }
  }

  getKubeConfig(): k8s.KubeConfig {
    return this.kubeConfig;
  }
}
