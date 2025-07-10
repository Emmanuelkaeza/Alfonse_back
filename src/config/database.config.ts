import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';  

export const createDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'sqlite',
  database: configService.get('database.database'),
  entities: [User, Patient, Payment, Subscription],
  synchronize: configService.get('database.synchronize'),
  logging: configService.get('database.logging'),
});

// Configuration par défaut pour le développement
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [User, Patient, Payment, Subscription],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
};
