import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { Subscription } from './entities/subscription.entity';
import { PatientsModule } from '../patients/patients.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    PatientsModule,
    forwardRef(() => PaymentsModule),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
