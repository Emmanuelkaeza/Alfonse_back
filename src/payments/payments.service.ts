import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod, PaymentType } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PatientsService } from '../patients/patients.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly patientsService: PatientsService,
    private readonly configService: ConfigService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, userId: number): Promise<Payment> {
    // Vérifier que le patient existe
    await this.patientsService.findOne(createPaymentDto.patientId);

    const transactionId = this.generateTransactionId();

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      transactionId,
      createdById: userId,
      status: createPaymentDto.method === PaymentMethod.CASH 
        ? PaymentStatus.COMPLETED 
        : PaymentStatus.PENDING,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Si c'est un paiement CinetPay, initier la transaction
    if (createPaymentDto.method === PaymentMethod.CINETPAY) {
      try {
        await this.initiateCinetPayTransaction(savedPayment);
      } catch (error) {
        // Marquer le paiement comme échoué si l'initiation échoue
        await this.updatePaymentStatus(savedPayment.id, PaymentStatus.FAILED);
        throw new BadRequestException('Erreur lors de l\'initiation du paiement CinetPay');
      }
    }

    return this.findOne(savedPayment.id);
  }

  async findAll(
    page = 1, 
    limit = 10, 
    status?: PaymentStatus, 
    method?: PaymentMethod,
    type?: PaymentType,
    patientId?: number
  ): Promise<{ data: Payment[], total: number, page: number, totalPages: number }> {
    const offset = (page - 1) * limit;
    
    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (method) whereClause.method = method;
    if (type) whereClause.type = type;
    if (patientId) whereClause.patientId = patientId;

    const [data, total] = await this.paymentRepository.findAndCount({
      where: whereClause,
      relations: ['patient', 'createdBy', 'subscription'],
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['patient', 'createdBy', 'subscription'],
    });

    if (!payment) {
      throw new NotFoundException('Paiement non trouvé');
    }

    return payment;
  }

  async findByTransactionId(transactionId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId },
      relations: ['patient', 'createdBy', 'subscription'],
    });

    if (!payment) {
      throw new NotFoundException('Transaction non trouvée');
    }

    return payment;
  }

  async updatePaymentStatus(id: number, status: PaymentStatus, cinetpayTransactionId?: string): Promise<Payment> {
    const payment = await this.findOne(id);
    
    payment.status = status;
    if (cinetpayTransactionId) {
      payment.cinetpayTransactionId = cinetpayTransactionId;
    }

    await this.paymentRepository.save(payment);
    return this.findOne(id);
  }

  async getPaymentStats(): Promise<any> {
    const totalPayments = await this.paymentRepository.count();
    
    const statusStats = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.amount)', 'totalAmount')
      .groupBy('payment.status')
      .getRawMany();

    const methodStats = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.method', 'method')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.amount)', 'totalAmount')
      .groupBy('payment.method')
      .getRawMany();

    const totalRevenue = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    return {
      totalPayments,
      totalRevenue: totalRevenue?.total || 0,
      statusStats,
      methodStats,
    };
  }

  private generateTransactionId(): string {
    return `TXN-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;
  }

  private async initiateCinetPayTransaction(payment: Payment): Promise<void> {
    // Simulation de l'intégration CinetPay
    // En production, vous devriez faire un appel API réel à CinetPay
    const cinetpayConfig = this.configService.get('cinetpay');
    
    if (!cinetpayConfig?.apiKey || !cinetpayConfig?.siteId) {
      throw new Error('Configuration CinetPay manquante');
    }

    // Simulation d'un appel API CinetPay
    const mockCinetPayResponse = {
      success: true,
      transaction_id: `CP-${Date.now()}`,
      payment_url: `https://checkout.cinetpay.com/payment/${payment.transactionId}`,
    };

    // Mettre à jour le paiement avec les informations CinetPay
    payment.cinetpayTransactionId = mockCinetPayResponse.transaction_id;
    payment.metadata = {
      ...payment.metadata,
      cinetpayUrl: mockCinetPayResponse.payment_url,
    };

    await this.paymentRepository.save(payment);
  }

  async handleCinetPayCallback(transactionId: string, status: string): Promise<Payment> {
    const payment = await this.findByTransactionId(transactionId);
    
    let paymentStatus: PaymentStatus;
    switch (status.toLowerCase()) {
      case 'completed':
      case 'accepted':
        paymentStatus = PaymentStatus.COMPLETED;
        break;
      case 'failed':
      case 'declined':
        paymentStatus = PaymentStatus.FAILED;
        break;
      case 'cancelled':
        paymentStatus = PaymentStatus.CANCELLED;
        break;
      default:
        paymentStatus = PaymentStatus.PENDING;
    }

    const updatedPayment = await this.updatePaymentStatus(payment.id, paymentStatus);

    // Si c'est un paiement d'abonnement réussi, activer l'abonnement
    if (updatedPayment.type === PaymentType.SUBSCRIPTION && 
        paymentStatus === PaymentStatus.COMPLETED && 
        updatedPayment.subscriptionId) {
      // Nous devrons appeler le service d'abonnement ici
      // Cela nécessite une injection circulaire, nous la gérerons dans le contrôleur
    }

    return updatedPayment;
  }
}
