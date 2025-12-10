import { Injectable, Logger } from '@nestjs/common';
import { K8sService } from '../../core/k8s/k8s.service';

@Injectable()
export class PodLogsService {
  private readonly logger = new Logger(PodLogsService.name);

  constructor(private readonly k8sService: K8sService) {}

  async aggregateLogs(namespace: string, labelSelector?: string, tailLines: number = 100) {
    try {
      const podsResponse = await this.k8sService.coreV1Api.listNamespacedPod({
        namespace,
        pretty: undefined,
        allowWatchBookmarks: undefined,
        fieldSelector: undefined,
        labelSelector,
      });

      const logsPromises = podsResponse.items.map(async (pod) => {
        try {
          const logsResponse = await this.k8sService.coreV1Api.readNamespacedPodLog({
            name: pod.metadata!.name!,
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
            podName: pod.metadata!.name,
            namespace: namespace,
            logs: logsResponse,
          };
        } catch (error) {
          return {
            podName: pod.metadata!.name,
            namespace: namespace,
            error: 'Failed to fetch logs',
          };
        }
      });

      const logs = await Promise.all(logsPromises);

      return {
        logs,
        podCount: logs.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to aggregate logs for namespace ${namespace}`, error);
      throw error;
    }
  }

  async getErrorLogs(namespace: string, tailLines: number = 100) {
    try {
      const allLogs = await this.aggregateLogs(namespace, undefined, tailLines);

      const errorLogs = allLogs.logs
        .map((podLog: any) => {
          if (podLog.error) return null;

          const errorLines = podLog.logs
            .split('\n')
            .filter(
              (line: string) =>
                line.toLowerCase().includes('error') ||
                line.toLowerCase().includes('exception') ||
                line.toLowerCase().includes('fatal'),
            );

          if (errorLines.length === 0) return null;

          return {
            podName: podLog.podName,
            namespace: podLog.namespace,
            errorCount: errorLines.length,
            errors: errorLines,
          };
        })
        .filter((log) => log !== null);

      return {
        errorLogs,
        podsWithErrors: errorLogs.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get error logs for namespace ${namespace}`, error);
      throw error;
    }
  }
}
