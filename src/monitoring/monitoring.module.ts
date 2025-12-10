import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { ClusterHealthService } from './reports/cluster-health.service';
import { ResourceUtilizationService } from './reports/resource-utilization.service';
import { EventsService } from './reports/events.service';
import { PodLogsService } from './reports/pod-logs.service';

@Module({
  controllers: [MonitoringController],
  providers: [
    ClusterHealthService,
    ResourceUtilizationService,
    EventsService,
    PodLogsService,
  ],
  exports: [
    ClusterHealthService,
    ResourceUtilizationService,
    EventsService,
    PodLogsService,
  ],
})
export class MonitoringModule {}
