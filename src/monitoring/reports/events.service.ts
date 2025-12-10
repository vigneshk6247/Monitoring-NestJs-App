import { Injectable, Logger } from '@nestjs/common';
import { K8sService } from '../../core/k8s/k8s.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly k8sService: K8sService) {}

  async getEvents(namespace?: string, type?: string) {
    try {
      let response;
      if (namespace) {
        response = await this.k8sService.coreV1Api.listNamespacedEvent({ namespace });
      } else {
        response = await this.k8sService.coreV1Api.listEventForAllNamespaces();
      }

      let events = response.items.map((event) => ({
        namespace: event.metadata!.namespace,
        name: event.metadata!.name,
        type: event.type,
        reason: event.reason,
        message: event.message,
        involvedObject: {
          kind: event.involvedObject!.kind,
          name: event.involvedObject!.name,
        },
        count: event.count,
        firstTimestamp: event.firstTimestamp,
        lastTimestamp: event.lastTimestamp,
      }));

      // Filter by type if specified
      if (type) {
        events = events.filter((event) => event.type === type);
      }

      // Sort by last timestamp (most recent first)
      events.sort(
        (a, b) =>
          new Date(b.lastTimestamp!).getTime() - new Date(a.lastTimestamp!).getTime(),
      );

      return {
        events,
        count: events.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get events', error);
      throw error;
    }
  }

  async getWarningEvents(namespace?: string) {
    return this.getEvents(namespace, 'Warning');
  }

  async getRecentEvents(namespace?: string, hours: number = 1) {
    try {
      const allEvents = await this.getEvents(namespace);
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hours);

      const recentEvents = allEvents.events.filter(
        (event: any) => new Date(event.lastTimestamp!) > cutoffTime,
      );

      return {
        events: recentEvents,
        count: recentEvents.length,
        timeRange: `Last ${hours} hour(s)`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get recent events', error);
      throw error;
    }
  }
}
