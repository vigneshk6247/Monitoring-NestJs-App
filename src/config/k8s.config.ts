import { registerAs } from '@nestjs/config';

export default registerAs('k8s', () => ({
  server: process.env.K8S_SERVER || 'https://127.0.0.1:62543',
  caPath: process.env.K8S_CA_PATH || 'C:\\Users\\Dell\\.minikube\\ca.crt',
  clientCertPath: process.env.K8S_CLIENT_CERT_PATH || 'C:\\Users\\Dell\\.minikube\\profiles\\minikube\\client.crt',
  clientKeyPath: process.env.K8S_CLIENT_KEY_PATH || 'C:\\Users\\Dell\\.minikube\\profiles\\minikube\\client.key',
  clusterName: process.env.K8S_CLUSTER_NAME || 'minikube',
}));
