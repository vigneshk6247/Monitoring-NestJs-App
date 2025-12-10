import { Module } from '@nestjs/common';
import { IngressController } from './ingress.controller';
import { IngressService } from './ingress.service';

@Module({
  controllers: [IngressController],
  providers: [IngressService],
  exports: [IngressService],
})
export class IngressModule {}
