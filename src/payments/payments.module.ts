import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    PatientsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
