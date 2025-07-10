import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

export enum SubscriptionType {
  BASIC = 'basic',
  PREMIUM = 'premium',
  VIP = 'vip',
}

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'simple-enum',
    enum: SubscriptionType,
  })
  type: SubscriptionType;

  @Column({
    type: 'simple-enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  status: SubscriptionStatus;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  currency: string;

  @Column({ default: 30 })
  durationInDays: number;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  features: string[];

  @ManyToOne(() => Patient, patient => patient.subscriptions)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  patientId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
