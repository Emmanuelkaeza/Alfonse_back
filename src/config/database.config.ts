import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';  


export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [User, Patient, Payment, Subscription],
  synchronize: true, // À désactiver en production
  logging: true,
};
