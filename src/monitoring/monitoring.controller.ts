import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ClusterHealthService } from './reports/cluster-health.service';
import { ResourceUtilizationService } from './reports/resource-utilization.service';
import { EventsService } from './reports/events.service';
import { PodLogsService } from './reports/pod-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../modules/users/entities/user.entity';

@ApiTags('monitoring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER, UserRole.ADMIN)
@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly clusterHealthService: ClusterHealthService,
    private readonly resourceUtilizationService: ResourceUtilizationService,
    private readonly eventsService: EventsService,
    private readonly podLogsService: PodLogsService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get comprehensive monitoring dashboard' })
  @ApiResponse({ status: 200, description: 'Returns dashboard data' })
  async getDashboard() {
    const [health, utilization, warnings, recentEvents] = await Promise.all([
      this.clusterHealthService.getClusterHealth(),
      this.resourceUtilizationService.getResourceUtilization(),
      this.eventsService.getWarningEvents(),
      this.eventsService.getRecentEvents(undefined, 1),
    ]);

    return {
      clusterHealth: health,
      resourceUtilization: utilization.summary,
      warnings: {
        count: warnings.count,
        recentWarnings: warnings.events.slice(0, 5),
      },
      recentEvents: {
        count: recentEvents.count,
        events: recentEvents.events.slice(0, 10),
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Get cluster health status' })
  @ApiResponse({ status: 200, description: 'Returns cluster health' })
  getHealth() {
    return this.clusterHealthService.getClusterHealth();
  }

  @Get('resources')
  @ApiOperation({ summary: 'Get resource utilization' })
  @ApiQuery({ name: 'namespace', required: false })
  @ApiResponse({ status: 200, description: 'Returns resource utilization' })
  getResourceUtilization(@Query('namespace') namespace?: string) {
    return this.resourceUtilizationService.getResourceUtilization(namespace);
  }

  @Get('resources/top')
  @ApiOperation({ summary: 'Get top resource consumers' })
  @ApiQuery({ name: 'namespace', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns top resource consumers' })
  getTopConsumers(@Query('namespace') namespace?: string, @Query('limit') limit?: number) {
    return this.resourceUtilizationService.getTopResourceConsumers(namespace, limit);
  }

  @Get('events')
  @ApiOperation({ summary: 'Get cluster events' })
  @ApiQuery({ name: 'namespace', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiResponse({ status: 200, description: 'Returns events' })
  getEvents(@Query('namespace') namespace?: string, @Query('type') type?: string) {
    return this.eventsService.getEvents(namespace, type);
  }

  @Get('events/warnings')
  @ApiOperation({ summary: 'Get warning events' })
  @ApiQuery({ name: 'namespace', required: false })
  @ApiResponse({ status: 200, description: 'Returns warning events' })
  getWarnings(@Query('namespace') namespace?: string) {
    return this.eventsService.getWarningEvents(namespace);
  }

  @Get('events/recent')
  @ApiOperation({ summary: 'Get recent events' })
  @ApiQuery({ name: 'namespace', required: false })
  @ApiQuery({ name: 'hours', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns recent events' })
  getRecentEvents(@Query('namespace') namespace?: string, @Query('hours') hours?: number) {
    return this.eventsService.getRecentEvents(namespace, hours);
  }

  @Get('logs/:namespace')
  @ApiOperation({ summary: 'Aggregate logs from namespace' })
  @ApiQuery({ name: 'labelSelector', required: false })
  @ApiQuery({ name: 'tailLines', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns aggregated logs' })
  aggregateLogs(
    @Param('namespace') namespace: string,
    @Query('labelSelector') labelSelector?: string,
    @Query('tailLines') tailLines?: number,
  ) {
    return this.podLogsService.aggregateLogs(namespace, labelSelector, tailLines);
  }

  @Get('logs/:namespace/errors')
  @ApiOperation({ summary: 'Get error logs from namespace' })
  @ApiQuery({ name: 'tailLines', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns error logs' })
  getErrorLogs(@Param('namespace') namespace: string, @Query('tailLines') tailLines?: number) {
    return this.podLogsService.getErrorLogs(namespace, tailLines);
  }
}
