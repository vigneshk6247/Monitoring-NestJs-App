# Flutter App: Core Layer

This section sets up the foundational networking and utility classes.

## 1. Constants (`lib/config/constants.dart`)

Replace the IP address with your computer's local IP.
**Note for Android Emulator**: Use `10.0.2.2` to access localhost.
**Note for Physical Device**: Use your machine's LAN IP (e.g., `192.168.68.103`).

```dart
class AppConstants {
  // Update this with your actual backend URL
  static const String baseUrl = 'http://192.168.68.103:3000/api/v1';
  
  static const String tokenKey = 'access_token';
  static const String userKey = 'user_data';
}
```

## 2. API Client Provider (`lib/core/network/api_client.dart`)

```dart
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../config/constants.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: AppConstants.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  ));

  // Add Interceptor for Auth Token
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(AppConstants.tokenKey);
      
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      
      return handler.next(options);
    },
    onError: (DioException e, handler) {
      // Create a global error handling mechanism here if needed
      return handler.next(e);
    },
  ));

  return dio;
});
```

## 3. Router Configuration (`lib/config/routes/router.dart`)

```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Import your screens here
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/dashboard/presentation/screens/dashboard_screen.dart';
import '../../features/settings/presentation/screens/settings_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/login',
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardScreen(),
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
      ),
    ],
  );
});
```
