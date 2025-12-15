# Flutter App: Docker Images Feature (CRUD with Role-Based Access)

This guide provides complete implementation for Docker Images management with full CRUD operations and role-based access control.

## Overview

The Docker Images feature allows:
- **All users**: View Docker images from Kubernetes cluster and Docker Hub repositories
- **Admin users**: Create, update, and delete Docker image records

## Features

✨ **Modern UI/UX**
- Gradient backgrounds with glassmorphism effects
- Smooth animations using `flutter_animate`
- Pull-to-refresh functionality
- Search and filter capabilities
- Hero animations between screens

🔐 **Role-Based Access Control**
- Admin: Full CRUD operations
- User: Read-only access

📱 **Responsive Design**
- Adapts to different screen sizes
- Dark mode support
- Tablet-optimized layouts

## Architecture

```
features/docker_images/
├── data/
│   ├── dto/
│   │   ├── create_docker_image_request.dart
│   │   └── update_docker_image_request.dart
│   └── services/
│       └── docker_image_service.dart
├── domain/
│   └── models/
│       ├── docker_image.dart
│       └── docker_repository.dart
└── presentation/
    ├── providers/
    │   ├── docker_image_provider.dart
    │   └── docker_image_form_provider.dart
    ├── screens/
    │   ├── docker_images_screen.dart
    │   ├── docker_image_detail_screen.dart
    │   ├── create_docker_image_screen.dart
    │   └── edit_docker_image_screen.dart
    └── widgets/
        ├── docker_image_card.dart
        ├── docker_image_form.dart
        └── delete_confirmation_dialog.dart
```

## Installation & Setup

### Step 1: Copy Code Files

All code files are located in the `docs/flutter/code/` directory. Copy the entire `features/docker_images/` folder to your Flutter project's `lib/` directory.

Also copy these core files:
- `core/errors/exceptions.dart`
- `core/network/api_client.dart`
- `features/auth/domain/models/user.dart`
- `features/auth/presentation/providers/auth_provider.dart`

### Step 2: Generate JSON Serialization Code

Run the build_runner to generate the `.g.dart` files:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### Step 3: Update API Base URL

In [api_client.dart](file:///c:/projects/Monitor-Mobile-App/docs/flutter/code/core/network/api_client.dart), update the base URL:

```dart
baseUrl: 'http://your-api-url:3000/api',  // Update this
```

### Step 4: Add Routes

Add these routes to your `go_router` configuration:

```dart
import 'package:go_router/go_router.dart';
import 'package:your_app/features/docker_images/presentation/screens/docker_images_screen.dart';
import 'package:your_app/features/docker_images/presentation/screens/docker_image_detail_screen.dart';
import 'package:your_app/features/docker_images/presentation/screens/create_docker_image_screen.dart';
import 'package:your_app/features/docker_images/presentation/screens/edit_docker_image_screen.dart';

final router = GoRouter(
  routes: [
    // ... your other routes
    
    GoRoute(
      path: '/docker-images',
      builder: (context, state) => const DockerImagesScreen(),
      routes: [
        GoRoute(
          path: 'detail/:imageName',
          builder: (context, state) {
            final imageName = state.pathParameters['imageName']!;
            return DockerImageDetailScreen(imageName: imageName);
          },
        ),
        GoRoute(
          path: 'create',
          builder: (context, state) => const CreateDockerImageScreen(),
        ),
        GoRoute(
          path: 'edit/:id',
          builder: (context, state) {
            final imageId = state.pathParameters['id']!;
            final image = state.extra as DockerImage;
            return EditDockerImageScreen(
              imageId: imageId,
              image: image,
            );
          },
        ),
      ],
    ),
  ],
);
```

## API Integration

### Backend Endpoints

The feature expects these endpoints:

**Read Operations (All Users)**
- `GET /images` - List all Docker images from cluster
  - Query param: `namespace` (optional)
  - Response: `{ images: DockerImage[], count: number }`

- `GET /images/dockerhub` - Get Docker Hub repositories
  - Response: `{ username: string, repositoryCount: number, repositories: DockerRepository[], authenticated: boolean }`

- `GET /images/details/:imageName` - Get specific image details
  - Response: `DockerImage`

**Write Operations (Admin Only)**
- `POST /images` - Create new Docker image
  - Body: `{ repository: string, tag: string, description?: string }`
  - Response: `DockerImage`

- `PUT /images/:id` - Update Docker image
  - Body: `{ repository?: string, tag?: string, description?: string }`
  - Response: `DockerImage`

- `DELETE /images/:id` - Delete Docker image
  - Response: `204 No Content`

### Authentication

The API client automatically adds the JWT token from secure storage to all requests:

```dart
headers['Authorization'] = 'Bearer $token';
```

Make sure your auth flow stores the token in secure storage:

```dart
final storage = FlutterSecureStorage();
await storage.write(key: 'auth_token', value: jwtToken);
```

## Usage Examples

### Navigate to Docker Images Screen

```dart
import 'package:go_router/go_router.dart';

// From anywhere in your app
context.push('/docker-images');
```

### Check User Role

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

class MyWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isAdmin = ref.watch(isAdminProvider);
    
    return Column(
      children: [
        Text('Welcome!'),
        if (isAdmin) 
          ElevatedButton(
            onPressed: () => context.push('/docker-images/create'),
            child: Text('Create Image'),
          ),
      ],
    );
  }
}
```

### Refresh Images List

```dart
// From within any widget
ref.read(dockerImagesNotifierProvider.notifier).refresh();

// Or invalidate the provider
ref.invalidate(dockerImagesNotifierProvider);
```

### Search Images

```dart
// Update search query - filtering happens automatically
ref.read(dockerImageSearchQueryProvider.notifier).state = 'nginx';
```

## Code Examples

### Domain Model Example

```dart
// DockerImage model with all properties
final image = DockerImage(
  image: 'nginx:latest',
  repository: 'nginx',
  tag: 'latest',
  usedBy: [
    DockerImageUsage(
      pod: 'my-pod',
      namespace: 'default',
      container: 'nginx-container',
    ),
  ],
  description: 'Official Nginx image',
  pullCount: 1000000,
  starCount: 5000,
  isPrivate: false,
  lastUpdated: DateTime.now(),
  fullName: 'library/nginx',
  id: '1',
);
```

### Service Usage Example

```dart
final service = ref.read(dockerImageServiceProvider);

// Get all images
final images = await service.getAllImages();

// Get images filtered by namespace
final namespaceImages = await service.getAllImages(namespace: 'default');

// Create image (admin only)
final request = CreateDockerImageRequest(
  repository: 'myuser/myapp',
  tag: 'v1.0.0',
  description: 'My application',
);
final newImage = await service.createImage(request);

// Update image (admin only)
final updateRequest = UpdateDockerImageRequest(
  description: 'Updated description',
);
final updated = await service.updateImage('imageId', updateRequest);

// Delete image (admin only)
await service.deleteImage('imageId');
```

### Provider Usage Example

```dart
// Watch images list
final imagesAsync = ref.watch(dockerImagesNotifierProvider);

imagesAsync.when(
  loading: () => CircularProgressIndicator(),
  error: (error, stack) => Text('Error: $error'),
  data: (images) => ListView.builder(
    itemCount: images.length,
    itemBuilder: (context, index) {
      return DockerImageCard(image: images[index]);
    },
  ),
);

// Watch filtered images (with search)
final filteredImages = ref.watch(filteredDockerImagesProvider);

// Watch Docker Hub repositories
final repos = ref.watch(dockerHubRepositoriesProvider);
```

## Customization

### Change Colors

Update the gradient colors in screens:

```dart
// In docker_images_screen.dart
colors: isDark
  ? [
      const Color(0xFF1a1a2e),  // Change this
      const Color(0xFF16213e),  // Change this
    ]
  : [
      const Color(0xFFf0f4f8),  // Change this
      const Color(0xFFe8eef5),  // Change this
    ],
```

### Customize Animations

Modify animation durations and effects in any screen:

```dart
.animate()
  .fadeIn(duration: 500.ms)  // Change duration
  .slideY(begin: 0.2, end: 0)  // Change slide distance
```

### Add More Fields

To add more fields to the form:

1. Update the models (`docker_image.dart`)
2. Update the DTOs (`create_docker_image_request.dart`, `update_docker_image_request.dart`)
3. Update the form widget (`docker_image_form.dart`)
4. Update the form provider (`docker_image_form_provider.dart`)

## Troubleshooting

### JSON Serialization Errors

If you get errors about missing `.g.dart` files:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### Import Errors

Make sure all imports use the correct package name. Replace `your_app` with your actual app package name:

```dart
import 'package:your_app/features/docker_images/...';
```

### API Connection Issues

1. Check the base URL in `api_client.dart`
2. Verify the backend is running
3. Check CORS settings if running a web app
4. Verify JWT token is being stored and sent correctly

### Role-Based Access Not Working

1. Ensure user object has the correct `role` field ('admin' or 'user')
2. Check that `currentUserProvider` is being set after login
3. Verify the backend is enforcing role-based access on endpoints

## Testing

### Manual Testing Checklist

**As Regular User:**
- [ ] Can view Docker images list
- [ ] Can view Docker Hub repositories
- [ ] Can search and filter images
- [ ] Can view image details
- [ ] Cannot see Create button (FAB)
- [ ] Cannot see Edit/Delete buttons
- [ ] Pull-to-refresh works

**As Admin User:**
- [ ] All user features above work
- [ ] Can see Create button (FAB)
- [ ] Can create new images
- [ ] Can edit existing images
- [ ] Can delete images with confirmation
- [ ] Form validation works
- [ ] Error messages display correctly
- [ ] Success messages display correctly

## Performance Tips

1. **Use Pagination**: If you have many images, implement pagination in the backend and frontend
2. **Cache Images**: The providers cache data - use `ref.refresh()` only when needed
3. **Optimize Images**: If showing Docker image logos, optimize their size
4. **Lazy Loading**: Consider lazy loading for the Docker Hub tab if there are many repositories

## Next Steps

1. ✅ Copy all code files to your project
2. ✅ Run build_runner to generate serialization code
3. ✅ Update API base URL
4. ✅ Add routes to your router
5. ✅ Ensure authentication is working
6. ✅ Test with both admin and regular user accounts
7. 🎨 Customize colors and branding to match your app
8. 📱 Test on different devices and screen sizes

## Support

All code files are located in `c:\projects\Monitor-Mobile-App\docs\flutter\code\`

The complete file structure:
```
docs/flutter/code/
├── core/
│   ├── errors/
│   │   └── exceptions.dart
│   └── network/
│       └── api_client.dart
├── features/
│   ├── auth/
│   │   ├── domain/
│   │   │   └── models/
│   │   │       └── user.dart
│   │   └── presentation/
│   │       └── providers/
│   │           └── auth_provider.dart
│   └── docker_images/
│       ├── data/
│       │   ├── dto/
│       │   │   ├── create_docker_image_request.dart
│       │   │   └── update_docker_image_request.dart
│       │   └── services/
│       │       └── docker_image_service.dart
│       ├── domain/
│       │   └── models/
│       │       ├── docker_image.dart
│       │       └── docker_repository.dart
│       └── presentation/
│           ├── providers/
│           │   ├── docker_image_form_provider.dart
│           │   └── docker_image_provider.dart
│           ├── screens/
│           │   ├── create_docker_image_screen.dart
│           │   ├── docker_image_detail_screen.dart
│           │   ├── docker_images_screen.dart
│           │   └── edit_docker_image_screen.dart
│           └── widgets/
│               ├── delete_confirmation_dialog.dart
│               ├── docker_image_card.dart
│               └── docker_image_form.dart
```

Happy coding! 🚀

