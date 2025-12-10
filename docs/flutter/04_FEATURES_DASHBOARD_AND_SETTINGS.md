# Flutter App: Dashboard & Settings Features

These features display cluster data and manage app preference.

## 1. Dashboard Logic (`lib/features/dashboard/data/dashboard_provider.dart`)

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';

final dashboardStatsProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final dio = ref.watch(dioProvider);
  
  // Fetch multiple resources in parallel
  final responses = await Future.wait([
    dio.get('/namespaces'),
    dio.get('/pods'),
    dio.get('/deployments'),
  ]);
  
  return {
    'namespaces': responses[0].data,
    'pods': responses[1].data,
    'deployments': responses[2].data,
  };
});
```

## 2. Dashboard Screen (`lib/features/dashboard/presentation/screens/dashboard_screen.dart`)

Displays a grid of cluster resources with animations.

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../data/dashboard_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(dashboardStatsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cluster Overview'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: statsAsync.when(
        data: (data) => _buildDashboardGrid(context, data),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildDashboardGrid(BuildContext context, Map<String, dynamic> data) {
    final items = [
      _DashboardItem(
        title: 'Namespaces',
        count: (data['namespaces'] as List).length.toString(),
        icon: Icons.folder_copy,
        color: Colors.blue,
      ),
      _DashboardItem(
        title: 'Pods',
        count: (data['pods'] as List).length.toString(),
        icon: Icons.layers,
        color: Colors.green,
      ),
      _DashboardItem(
        title: 'Deployments',
        count: (data['deployments'] as List).length.toString(),
        icon: Icons.rocket_launch,
        color: Colors.orange,
      ),
      _DashboardItem(
        title: 'Services',
        count: 'Active',
        icon: Icons.hub,
        color: Colors.purple,
      ),
    ];

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.1,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return _StatCard(item: item)
            .animate(delay: (100 * index).ms)
            .scale()
            .fadeIn(duration: 400.ms);
      },
    );
  }
}

class _DashboardItem {
  final String title;
  final String count;
  final IconData icon;
  final Color color;

  _DashboardItem({
    required this.title,
    required this.count,
    required this.icon,
    required this.color,
  });
}

class _StatCard extends StatelessWidget {
  final _DashboardItem item;

  const _StatCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shadowColor: item.color.withOpacity(0.4),
      child: InkWell(
        onTap: () {},
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: item.color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(item.icon, size: 32, color: item.color),
              ),
              const SizedBox(height: 12),
              Text(
                item.count,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                item.title,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

## 3. Settings Feature

### Theme Provider (`lib/features/settings/presentation/providers/theme_provider.dart`)

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeMode>((ref) {
  return ThemeNotifier();
});

class ThemeNotifier extends StateNotifier<ThemeMode> {
  ThemeNotifier() : super(ThemeMode.system) {
    _loadTheme();
  }

  static const String _key = 'theme_mode';

  void _loadTheme() async {
    final prefs = await SharedPreferences.getInstance();
    final savedTheme = prefs.getString(_key);
    if (savedTheme == 'light') state = ThemeMode.light;
    if (savedTheme == 'dark') state = ThemeMode.dark;
  }

  void toggleTheme(bool isDark) async {
    state = isDark ? ThemeMode.dark : ThemeMode.light;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, isDark ? 'dark' : 'light');
  }
}
```

### Settings Screen (`lib/features/settings/presentation/screens/settings_screen.dart`)

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/theme_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeProvider);
    final isDark = themeMode == ThemeMode.dark;

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          SwitchListTile(
            title: const Text('Dark Mode'),
            subtitle: const Text('Enable dark theme for the app'),
            secondary: Icon(isDark ? Icons.dark_mode : Icons.light_mode),
            value: isDark,
            onChanged: (value) {
              ref.read(themeProvider.notifier).toggleTheme(value);
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('About'),
            subtitle: const Text('K8s Monitor App v1.0.0'),
          ),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Logout', style: TextStyle(color: Colors.red)),
            onTap: () {
              // Handle logout logic here
            },
          ),
        ],
      ),
    );
  }
}
```
