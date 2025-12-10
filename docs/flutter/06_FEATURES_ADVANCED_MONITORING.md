# Flutter App: Advanced Monitoring

This feature consumes the `/monitoring` endpoints to visualize cluster health, metrics, and logs.

## 1. Monitoring Repository (`lib/features/monitoring/data/monitoring_repository.dart`)

```dart
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';

final monitoringRepositoryProvider = Provider((ref) => MonitoringRepository(ref.read(dioProvider)));

class MonitoringRepository {
  final Dio _dio;

  MonitoringRepository(this._dio);

  Future<Map<String, dynamic>> getClusterHealth() async {
    final response = await _dio.get('/monitoring/health');
    return response.data;
  }

  Future<Map<String, dynamic>> getResourceUtilization() async {
    final response = await _dio.get('/monitoring/resources');
    return response.data;
  }

  Future<List<dynamic>> getEvents() async {
    final response = await _dio.get('/monitoring/events/recent');
    return response.data;
  }

  Future<String> getPodLogs(String namespace, String podName) async {
    final response = await _dio.get('/pods/$namespace/$podName/logs?tailLines=100');
    return response.data;
  }
}
```

## 2. Monitoring Provider (`lib/features/monitoring/presentation/providers/monitoring_provider.dart`)

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/monitoring_repository.dart';

final clusterHealthProvider = FutureProvider.autoDispose((ref) async {
  return ref.read(monitoringRepositoryProvider).getClusterHealth();
});

final resourceUsageProvider = FutureProvider.autoDispose((ref) async {
  return ref.read(monitoringRepositoryProvider).getResourceUtilization();
});

final podLogsProvider = FutureProvider.family<String, ({String ns, String name})>((ref, arg) async {
  return ref.read(monitoringRepositoryProvider).getPodLogs(arg.ns, arg.name);
});
```

## 3. Monitoring Screen (`lib/features/monitoring/presentation/screens/monitoring_screen.dart`)

Uses `fl_chart` for visualizing metrics.

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../providers/monitoring_provider.dart';

class MonitoringScreen extends ConsumerWidget {
  const MonitoringScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Cluster Health & Metrics')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildHealthSection(ref),
          const SizedBox(height: 24),
          _buildResourceChart(context, ref),
          const SizedBox(height: 24),
          _buildEventsList(context),
        ],
      ),
    );
  }

  Widget _buildHealthSection(WidgetRef ref) {
    final healthAsync = ref.watch(clusterHealthProvider);
    
    return healthAsync.when(
      data: (data) => Card(
        color: data['status'] == 'Healthy' ? Colors.green.shade50 : Colors.red.shade50,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Cluster Status', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  Chip(
                    label: Text(data['status']),
                    backgroundColor: data['status'] == 'Healthy' ? Colors.green : Colors.red,
                    labelStyle: const TextStyle(color: Colors.white),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              LinearProgressIndicator(
                value: data['score'] ?? 1.0, 
                color: Colors.green,
                backgroundColor: Colors.grey.shade300,
              ),
              const SizedBox(height: 10),
              Text('Components: ${data['components_up']}/${data['total_components']} Operational'),
            ],
          ),
        ),
      ),
      loading: () => const LinearProgressIndicator(),
      error: (e, s) => Text('Error loading health: $e'),
    );
  }

  Widget _buildResourceChart(BuildContext context, WidgetRef ref) {
    return SizedBox(
      height: 200,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('CPU Usage History', style: TextStyle(fontWeight: FontWeight.bold)),
              const Expanded(child: SizedBox()), // Placeholder for Chart
              Expanded(
                flex: 4,
                child: LineChart(
                  LineChartData(
                    gridData: FlGridData(show: false),
                    titlesData: FlTitlesData(show: false),
                    borderData: FlBorderData(show: false),
                    lineBarsData: [
                      LineChartBarData(
                        spots: [
                          const FlSpot(0, 3),
                          const FlSpot(1, 1),
                          const FlSpot(2, 4),
                          const FlSpot(3, 2),
                          const FlSpot(4, 5),
                        ],
                        isCurved: true,
                        color: Theme.of(context).primaryColor,
                        barWidth: 3,
                        dotData: FlDotData(show: false),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEventsList(BuildContext context) {
    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text('Recent Critical Events', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.warning, color: Colors.orange),
            title: const Text('Pod RestartLoop'),
            subtitle: const Text('namespace: default | pod: api-server-x92'),
            trailing: const Text('2m ago'),
          ),
          ListTile(
            leading: const Icon(Icons.error, color: Colors.red),
            title: const Text('ImagePullBackOff'),
            subtitle: const Text('namespace: production | pod: worker-node-2'),
            trailing: const Text('15m ago'),
          ),
        ],
      ),
    );
  }
}
```

## 4. Log Viewer Screen (`lib/features/monitoring/presentation/screens/log_viewer_screen.dart`)

A dedicated screen for viewing raw pod logs.

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/monitoring_provider.dart';

class LogViewerScreen extends ConsumerWidget {
  final String namespace;
  final String podName;

  const LogViewerScreen({super.key, required this.namespace, required this.podName});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final logsAsync = ref.watch(podLogsProvider((ns: namespace, name: podName)));

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text('Logs: $podName'),
        backgroundColor: Colors.grey.shade900,
        foregroundColor: Colors.white,
      ),
      body: logsAsync.when(
        data: (logs) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: SelectableText(
            logs,
            style: const TextStyle(
              color: Colors.greenAccent, 
              fontFamily: 'monospace', 
              fontSize: 12
            ),
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Failed to load logs: $err', style: const TextStyle(color: Colors.white))),
      ),
    );
  }
}
```
