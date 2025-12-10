import { Injectable, Logger } from '@nestjs/common';
import { K8sService } from '../../core/k8s/k8s.service';

@Injectable()
export class ClusterHealthService {
  private readonly logger = new Logger(ClusterHealthService.name);

  constructor(private readonly k8sService: K8sService) {}

  async getClusterHealth() {
    try {
      const [nodes, componentStatuses] = await Promise.all([
        this.k8sService.coreV1Api.listNode(),
        this.getComponentStatuses(),
      ]);

      const nodeStatuses = nodes.items.map((node) => ({
        name: node.metadata!.name,
        status: this.getNodeStatus(node),
        conditions: node.status!.conditions,
        capacity: node.status!.capacity,
        allocatable: node.status!.allocatable,
      }));

      const healthyNodes = nodeStatuses.filter((n) => n.status === 'Ready').length;
      const totalNodes = nodeStatuses.length;

      return {
        overall: healthyNodes === totalNodes ? 'Healthy' : 'Degraded',
        nodes: {
          total: totalNodes,
          healthy: healthyNodes,
          details: nodeStatuses,
        },
        components: componentStatuses,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get cluster health', error);
      throw error;
    }
  }

  private getNodeStatus(node: any): string {
    const readyCondition = node.status!.conditions!.find((c: any) => c.type === 'Ready');
    return readyCondition?.status === 'True' ? 'Ready' : 'NotReady';
  }

  private async getComponentStatuses() {
    try {
      // Component status API is deprecated in newer K8s versions
      // We'll return a status based on namespace system pods
      const systemPods = await this.k8sService.coreV1Api.listNamespacedPod({ namespace: 'kube-system' });

      const components = systemPods.items
        .filter((pod) =>
          ['kube-apiserver', 'kube-scheduler', 'kube-controller-manager', 'etcd'].some((comp) =>
            pod.metadata!.name!.includes(comp),
          ),
        )
        .map((pod) => ({
          name: pod.metadata!.name,
          status: pod.status!.phase,
          ready: pod.status!.containerStatuses?.every((c) => c.ready) || false,
        }));

      return components;
    } catch (error) {
      this.logger.warn('Could not fetch component statuses', error.message);
      return [];
    }
  }
}
