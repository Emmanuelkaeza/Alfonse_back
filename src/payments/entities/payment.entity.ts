import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { User } from '../../users/entities/user.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  MOBILE_MONEY = 'mobile_money',
  CINETPAY = 'cinetpay',
}

export enum PaymentType {
  SUBSCRIPTION = 'subscription',
  CONSULTATION = 'consultation',
  TREATMENT = 'treatment',
  OTHER = 'other',
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  transactionId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({
    type: 'simple-enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column({
    type: 'simple-enum',
    enum: PaymentType,
    default: PaymentType.OTHER,
  })
  type: PaymentType;

  @Column({
    type: 'simple-enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column()
  description: string;

  @Column({ nullable: true })
  cinetpayTransactionId: string;

  @Column({ nullable: true })
  externalReference: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @ManyToOne(() => Patient, patient => patient.payments)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  patientId: number;

  @ManyToOne(() => User, user => user.payments)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column()
  createdById: number;

  @ManyToOne(() => Subscription, { nullable: true })
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription;

  @Column({ nullable: true })
  subscriptionId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
