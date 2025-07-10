import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { PaymentsModule } from './payments/payments.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig),
    UsersModule,
    PatientsModule,
    PaymentsModule,
    SubscriptionsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
