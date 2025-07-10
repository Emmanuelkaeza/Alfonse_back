import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Payment } from '../../payments/entities/payment.entity';

export enum UserRole {
  ADMIN = 'admin',
  RECEPTIONIST = 'receptionist',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'simple-enum',
    enum: UserRole,
    default: UserRole.RECEPTIONIST,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Payment, payment => payment.createdBy)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
