import { Injectable, Logger } from '@nestjs/common';
import { K8sService } from '../../core/k8s/k8s.service';

@Injectable()
export class ResourceUtilizationService {
  private readonly logger = new Logger(ResourceUtilizationService.name);

  constructor(private readonly k8sService: K8sService) {}

  async getResourceUtilization(namespace?: string) {
    try {
      let pods;
      if (namespace) {
        pods = await this.k8sService.coreV1Api.listNamespacedPod({ namespace });
      } else {
        pods = await this.k8sService.coreV1Api.listPodForAllNamespaces();
      }

      const namespaceStats = new Map<string, any>();

      pods.items.forEach((pod) => {
        const ns = pod.metadata!.namespace!;
        if (!namespaceStats.has(ns)) {
          namespaceStats.set(ns, {
            namespace: ns,
            podCount: 0,
            containers: 0,
            requestedCpu: 0,
            requestedMemory: 0,
            limitCpu: 0,
            limitMemory: 0,
            pods: [],
          });
        }

        const stats = namespaceStats.get(ns)!;
        stats.podCount++;
        stats.containers += pod.spec!.containers.length;

        pod.spec!.containers.forEach((container) => {
          if (container.resources?.requests) {
            stats.requestedCpu += this.parseCpu(container.resources.requests.cpu);
            stats.requestedMemory += this.parseMemory(container.resources.requests.memory);
          }
          if (container.resources?.limits) {
            stats.limitCpu += this.parseCpu(container.resources.limits.cpu);
            stats.limitMemory += this.parseMemory(container.resources.limits.memory);
          }
        });

        stats.pods.push({
          name: pod.metadata!.name,
          phase: pod.status!.phase,
          containers: pod.spec!.containers.length,
        });
      });

      return {
        byNamespace: Array.from(namespaceStats.values()),
        summary: {
          totalNamespaces: namespaceStats.size,
          totalPods: pods.items.length,
          totalContainers: Array.from(namespaceStats.values()).reduce(
            (sum, ns) => sum + ns.containers,
            0,
          ),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get resource utilization', error);
      throw error;
    }
  }

  private parseCpu(cpu: string | undefined): number {
    if (!cpu) return 0;
    if (cpu.endsWith('m')) {
      return parseInt(cpu.slice(0, -1)) / 1000;
    }
    return parseFloat(cpu);
  }

  private parseMemory(memory: string | undefined): number {
    if (!memory) return 0;
    const units: Record<string, number> = {
      Ki: 1024,
      Mi: 1024 * 1024,
      Gi: 1024 * 1024 * 1024,
      K: 1000,
      M: 1000 * 1000,
      G: 1000 * 1000 * 1000,
    };

    for (const [unit, multiplier] of Object.entries(units)) {
      if (memory.endsWith(unit)) {
        return parseInt(memory.slice(0, -unit.length)) * multiplier;
      }
    }

    return parseInt(memory);
  }

  async getTopResourceConsumers(namespace?: string, limit: number = 10) {
    try {
      const utilization = await this.getResourceUtilization(namespace);
      const sortedNamespaces = utilization.byNamespace
        .sort((a, b) => b.requestedCpu + b.requestedMemory - (a.requestedCpu + a.requestedMemory))
        .slice(0, limit);

      return {
        topNamespaces: sortedNamespaces,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get top resource consumers', error);
      throw error;
    }
  }
}
