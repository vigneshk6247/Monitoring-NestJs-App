import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import appConfig from './config/app.config';
import k8sConfig from './config/k8s.config';
import databaseConfig from './config/database.config';
import { K8sModule } from './core/k8s/k8s.module';
import { NamespacesModule } from './modules/namespaces/namespaces.module';
import { PodsModule } from './modules/pods/pods.module';
import { DeploymentsModule } from './modules/deployments/deployments.module';
import { ServicesModule } from './modules/services/services.module';
import { IngressModule } from './modules/ingress/ingress.module';
import { SecretsModule } from './modules/secrets/secrets.module';
import { ImagesModule } from './modules/images/images.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, k8sConfig, databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.get('database')!,
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    K8sModule,
    NamespacesModule,
    PodsModule,
    DeploymentsModule,
    ServicesModule,
    IngressModule,
    SecretsModule,
    ImagesModule,
    MonitoringModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
