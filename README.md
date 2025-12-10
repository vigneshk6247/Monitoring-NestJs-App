# Kubernetes Monitor with NestJS Backend

A comprehensive Kubernetes monitoring and management application built with NestJS, providing full CRUD operations for K8s resources and advanced monitoring capabilities.

## Features

### K8s Resource Management
- **Namespaces**: Create, read, update, delete namespaces
- **Pods**: Full pod lifecycle management, logs, and status monitoring
- **Deployments**: Deployment management with scaling and rollback
- **Services**: Service management with endpoint monitoring
- **Ingress**: Ingress configuration and management
- **Secrets**: Secure secret management including TLS certificates
- **Images**: Docker image monitoring across the cluster

### Advanced Monitoring
- **Cluster Health Dashboard**: Real-time cluster health status
- **Resource Utilization**: CPU and memory tracking per namespace
- **Event Monitoring**: Cluster event tracking with filtering
- **Pod Logs Aggregation**: Centralized log viewing and error detection
- **Top Resource Consumers**: Identify resource-heavy namespaces
- **Warning Detection**: Automatic warning event filtering

## Prerequisites

- Node.js >= 16
- npm >= 8
- Kubernetes cluster (minikube, or any K8s cluster)
- kubectl configured with cluster access

## Installation

1. Clone the repository:
```bash
cd c:\projects\Monitor-Mobile-App
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
# Copy .env.example to .env and update with your K8s configuration
cp .env.example .env
```

4. Update the `.env` file with your Kubernetes configuration:
```env
PORT=3000
NODE_ENV=development

# Your K8s cluster configuration
K8S_CA_PATH=C:\Users\Dell\.minikube\ca.crt
K8S_CLIENT_CERT_PATH=C:\Users\Dell\.minikube\profiles\minikube\client.crt
K8S_CLIENT_KEY_PATH=C:\Users\Dell\.minikube\profiles\minikube\client.key
K8S_SERVER=https://127.0.0.1:62543
K8S_CLUSTER_NAME=minikube
```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

The application will start on `http://localhost:3000`

## API Documentation

Once the application is running, access the Swagger documentation at:
```
http://localhost:3000/api
```

The API base URL is:
```
http://localhost:3000/api/v1
```

## API Endpoints

### Monitoring Dashboard
- `GET /api/v1/monitoring/dashboard` - Comprehensive monitoring dashboard
- `GET /api/v1/monitoring/health` - Cluster health status
- `GET /api/v1/monitoring/resources` - Resource utilization
- `GET /api/v1/monitoring/resources/top` - Top resource consumers
- `GET /api/v1/monitoring/events` - All cluster events
- `GET /api/v1/monitoring/events/warnings` - Warning events only
- `GET /api/v1/monitoring/events/recent` - Recent events
- `GET /api/v1/monitoring/logs/:namespace` - Aggregate logs from namespace
- `GET /api/v1/monitoring/logs/:namespace/errors` - Error logs from namespace

### Namespaces
- `GET /api/v1/namespaces` - List all namespaces
- `GET /api/v1/namespaces/:name` - Get namespace details
- `POST /api/v1/namespaces` - Create namespace
- `DELETE /api/v1/namespaces/:name` - Delete namespace

### Pods
- `GET /api/v1/pods` - List all pods
- `GET /api/v1/pods?namespace=default` - List pods in namespace
- `GET /api/v1/pods/:namespace/:name` - Get pod details
- `GET /api/v1/pods/:namespace/:name/logs` - Get pod logs
- `GET /api/v1/pods/:namespace/:name/status` - Get pod status
- `POST /api/v1/pods` - Create pod
- `DELETE /api/v1/pods/:namespace/:name` - Delete pod

### Deployments
- `GET /api/v1/deployments` - List all deployments
- `GET /api/v1/deployments/:namespace/:name` - Get deployment details
- `GET /api/v1/deployments/:namespace/:name/status` - Get deployment status
- `POST /api/v1/deployments` - Create deployment
- `PATCH /api/v1/deployments/:namespace/:name/scale` - Scale deployment
- `DELETE /api/v1/deployments/:namespace/:name` - Delete deployment

### Services
- `GET /api/v1/services` - List all services
- `GET /api/v1/services/:namespace/:name` - Get service details
- `GET /api/v1/services/:namespace/:name/endpoints` - Get service endpoints
- `POST /api/v1/services` - Create service
- `DELETE /api/v1/services/:namespace/:name` - Delete service

### Ingress
- `GET /api/v1/ingress` - List all ingresses
- `GET /api/v1/ingress/:namespace/:name` - Get ingress details
- `POST /api/v1/ingress` - Create ingress
- `DELETE /api/v1/ingress/:namespace/:name` - Delete ingress

### Secrets
- `GET /api/v1/secrets` - List all secrets (keys only)
- `GET /api/v1/secrets/tls` - List TLS secrets
- `GET /api/v1/secrets/:namespace/:name` - Get secret details
- `POST /api/v1/secrets` - Create secret
- `DELETE /api/v1/secrets/:namespace/:name` - Delete secret

### Images
- `GET /api/v1/images` - List all Docker images in use
- `GET /api/v1/images/details/:imageName` - Get image details

## Architecture

```
src/
├── config/                 # Configuration files
│   ├── app.config.ts      # Application config
│   └── k8s.config.ts      # Kubernetes config
├── core/                   # Core modules
│   └── k8s/               # Kubernetes client
│       ├── k8s.module.ts
│       └── k8s.service.ts
├── modules/               # Feature modules
│   ├── namespaces/
│   ├── pods/
│   ├── deployments/
│   ├── services/
│   ├── ingress/
│   ├── secrets/
│   └── images/
├── monitoring/            # Monitoring module
│   ├── reports/
│   │   ├── cluster-health.service.ts
│   │   ├── resource-utilization.service.ts
│   │   ├── events.service.ts
│   │   └── pod-logs.service.ts
│   ├── monitoring.controller.ts
│   └── monitoring.module.ts
├── common/                # Shared utilities
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── interceptors/
│       └── logging.interceptor.ts
├── app.module.ts          # Root module
└── main.ts                # Bootstrap file
```

## Development

### Project Structure
- Each module follows NestJS best practices with controllers, services, and DTOs
- Global K8s module provides API clients to all modules
- Exception filters handle K8s API errors gracefully
- Logging interceptors track request/response times

### Testing

Run unit tests:
```bash
npm run test
```

Run e2e tests:
```bash
npm run test:e2e
```

Run test coverage:
```bash
npm run test:cov
```

## Built With

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [@kubernetes/client-node](https://github.com/kubernetes-client/javascript) - Official Kubernetes client
- [Swagger](https://swagger.io/) - API documentation
- [class-validator](https://github.com/typestack/class-validator) - Validation decorators
- [class-transformer](https://github.com/typestack/class-transformer) - Object transformation

## License

MIT

## Author

Built with ❤️ for Kubernetes monitoring
