# Flutter App: Kubernetes Resources Feature

This feature handles the management of core Kubernetes resources: Pods, Deployments, Services, and Namespaces.

## 1. Domain Models (`lib/features/resources/domain/models/k8s_resource.dart`)

Create a generic model to handle common fields.

```dart
class K8sResource {
  final String name;
  final String namespace;
  final String creationTimestamp;
  final Map<String, dynamic> raw;

  K8sResource({
    required this.name,
    required this.namespace,
    required this.creationTimestamp,
    required this.raw,
  });

  factory K8sResource.fromJson(Map<String, dynamic> json) {
    final metadata = json['metadata'] ?? {};
    return K8sResource(
      name: metadata['name'] ?? 'Unknown',
      namespace: metadata['namespace'] ?? 'default',
      creationTimestamp: metadata['creationTimestamp'] ?? '',
      raw: json,
    );
  }
}
```

## 2. Generic Resource Repository (`lib/features/resources/data/resource_repository.dart`)

A single repository can handle multiple resource types to reduce code duplication.

```dart
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../domain/models/k8s_resource.dart';

final resourceRepositoryProvider = Provider((ref) => ResourceRepository(ref.read(dioProvider)));

class ResourceRepository {
  final Dio _dio;

  ResourceRepository(this._dio);

  Future<List<K8sResource>> getResources(String type, {String? namespace}) async {
    try {
      final response = await _dio.get('/$type', queryParameters: {
        if (namespace != null) 'namespace': namespace,
      });
      
      final items = response.data['items'] as List? ?? [];
      // Handle responses that might be direct lists or k8s list objects
      final list = items.isEmpty && response.data is List ? response.data : items;
      
      return (list as List).map((e) => K8sResource.fromJson(e)).toList();
    } catch (e) {
      throw Exception('Failed to fetch $type: $e');
    }
  }

  Future<Map<String, dynamic>> getResourceDetails(String type, String namespace, String name) async {
    try {
      final response = await _dio.get('/$type/$namespace/$name');
      return response.data;
    } catch (e) {
      throw Exception('Failed to fetch details: $e');
    }
  }

  Future<void> deleteResource(String type, String namespace, String name) async {
    await _dio.delete('/$type/$namespace/$name');
  }
  
  // Specific method for scaling deployments
  Future<void> scaleDeployment(String namespace, String name, int replicas) async {
    await _dio.patch('/deployments/$namespace/$name/scale', data: {'replicas': replicas});
  }
}
```

## 3. Resource Providers (`lib/features/resources/presentation/providers/resource_providers.dart`)

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/resource_repository.dart';
import '../domain/models/k8s_resource.dart';

// Family provider to fetch resources dynamically based on type and namespace
final resourcesListProvider = FutureProvider.family<List<K8sResource>, String>((ref, type) async {
  final repository = ref.watch(resourceRepositoryProvider);
  return repository.getResources(type);
});

// Provider for resource details
final resourceDetailsProvider = FutureProvider.family<Map<String, dynamic>, ResourceParams>((ref, params) async {
  final repository = ref.watch(resourceRepositoryProvider);
  return repository.getResourceDetails(params.type, params.namespace, params.name);
});

class ResourceParams {
  final String type;
  final String namespace;
  final String name;
  
  ResourceParams(this.type, this.namespace, this.name);
  
  @override
  bool operator ==(Object other) =>
      other is ResourceParams &&
      other.type == type &&
      other.namespace == namespace &&
      other.name == name;

  @override
  int get hashCode => Object.hash(type, namespace, name);
}
```

## 4. Reusable Resource List Screen (`lib/features/resources/presentation/screens/resource_list_screen.dart`)

A single, powerful screen to display any list of resources (Pods, Services, etc.).

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../providers/resource_providers.dart';
import '../domain/models/k8s_resource.dart';

class ResourceListScreen extends ConsumerWidget {
  final String resourceType; // e.g., 'pods', 'deployments', 'services'
  final String title;

  const ResourceListScreen({
    super.key,
    required this.resourceType,
    required this.title,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final resourcesAsync = ref.watch(resourcesListProvider(resourceType));

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: resourcesAsync.when(
        data: (resources) => _buildList(context, resources),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Navigate to create screen
          ref.invalidate(resourcesListProvider(resourceType)); // Refresh mechanism
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildList(BuildContext context, List<K8sResource> resources) {
    if (resources.isEmpty) {
      return const Center(child: Text('No resources found'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: resources.length,
      itemBuilder: (context, index) {
        final item = resources[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: _getIconForType(resourceType),
            title: Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('Namespace: ${item.namespace}\nCreated: ${item.creationTimestamp}'),
            isThreeLine: true,
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              // Navigate to details
              // context.push('/resources/$resourceType/${item.namespace}/${item.name}');
              _showDetailBottomSheet(context, item);
            },
          ),
        ).animate().slideX(duration: 300.ms, begin: 0.2).fadeIn();
      },
    );
  }

  Icon _getIconForType(String type) {
    switch (type) {
      case 'pods': return const Icon(Icons.layers, color: Colors.green);
      case 'deployments': return const Icon(Icons.rocket_launch, color: Colors.orange);
      case 'services': return const Icon(Icons.hub, color: Colors.blue);
      case 'namespaces': return const Icon(Icons.folder, color: Colors.purple);
      default: return const Icon(Icons.extension);
    }
  }

  void _showDetailBottomSheet(BuildContext context, K8sResource item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (context) => DraggableScrollableSheet(
        expand: false,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(item.name, style: Theme.of(context).textTheme.headlineSmall),
              const Divider(),
              Text('Namespace: ${item.namespace}'),
              const SizedBox(height: 16),
              const Text('Raw JSON Spec:', style: TextStyle(fontWeight: FontWeight.bold)),
              Container(
                margin: const EdgeInsets.only(top: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surfaceVariant,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(item.raw.toString()),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.error,
                    foregroundColor: Colors.white,
                  ),
                  icon: const Icon(Icons.delete),
                  label: const Text('Delete Resource (Admin Only)'),
                  onPressed: () {
                    // Implement delete logic with ref.read(resourceRepositoryProvider).deleteResource(...)
                    Navigator.pop(context);
                  },
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
```

## 5. Router Update (`lib/config/routes/router.dart`)

Update your router to include these new dynamic routes.

```dart
// Add this inside your GoRouter routes list
GoRoute(
  path: '/resources/:type',
  builder: (context, state) {
    final type = state.pathParameters['type']!;
    final title = type.toUpperCase();
    return ResourceListScreen(resourceType: type, title: title);
  },
),
```

## 6. Dashboard Integration

Update your dashboard cards to link to these pages.

```dart
// Example navigation in DashboardScreen
_StatCard(
  onTap: () => context.push('/resources/pods'),
  // ...
)
```
