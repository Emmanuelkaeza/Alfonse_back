import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Payment } from '../../payments/entities/payment.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity()
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({
    type: 'simple-enum',
    enum: Gender,
  })
  gender: Gender;

  @Column()
  address: string;

  @Column({ nullable: true })
  emergencyContact: string;

  @Column({ nullable: true })
  emergencyPhone: string;

  @Column({ nullable: true })
  medicalHistory: string;

  @Column({ nullable: true })
  allergies: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Payment, payment => payment.patient)
  payments: Payment[];

  @OneToMany(() => Subscription, subscription => subscription.patient)
  subscriptions: Subscription[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
