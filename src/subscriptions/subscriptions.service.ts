import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Subscription, SubscriptionStatus, SubscriptionType } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { RenewSubscriptionDto } from './dto/renew-subscription.dto';
import { PatientsService } from '../patients/patients.service';
import { PaymentsService } from '../payments/payments.service';
import { PaymentType, PaymentMethod } from '../payments/entities/payment.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly patientsService: PatientsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto, userId: number): Promise<{ subscription: Subscription; paymentUrl?: string }> {
    // Vérifier que le patient existe
    await this.patientsService.findOne(createSubscriptionDto.patientId);

    // Vérifier s'il n'y a pas déjà un abonnement actif
    const activeSubscription = await this.getActiveSubscription(createSubscriptionDto.patientId);
    if (activeSubscription) {
      throw new ConflictException('Le patient a déjà un abonnement actif');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + createSubscriptionDto.durationInDays);

    const subscription = this.subscriptionRepository.create({
      ...createSubscriptionDto,
      startDate,
      endDate,
      status: SubscriptionStatus.PENDING,
    });

    const savedSubscription = await this.subscriptionRepository.save(subscription);

    // Créer le paiement associé
    const paymentDto = {
      amount: createSubscriptionDto.price,
      currency: createSubscriptionDto.currency,
      method: PaymentMethod.CINETPAY,
      type: PaymentType.SUBSCRIPTION,
      description: `Abonnement ${createSubscriptionDto.type} - ${createSubscriptionDto.description || ''}`,
      patientId: createSubscriptionDto.patientId,
      subscriptionId: savedSubscription.id,
      metadata: {
        subscriptionType: createSubscriptionDto.type,
        features: createSubscriptionDto.features,
      },
    };

    const payment = await this.paymentsService.create(paymentDto, userId);

    return {
      subscription: savedSubscription,
      paymentUrl: payment.metadata?.cinetpayUrl,
    };
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: SubscriptionStatus,
    type?: SubscriptionType,
    patientId?: number
  ): Promise<{ data: Subscription[], total: number, page: number, totalPages: number }> {
    const offset = (page - 1) * limit;
    
    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;
    if (patientId) whereClause.patientId = patientId;

    const [data, total] = await this.subscriptionRepository.findAndCount({
      where: whereClause,
      relations: ['patient'],
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

  async findOne(id: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['patient'],
    });

    if (!subscription) {
      throw new NotFoundException('Abonnement non trouvé');
    }

    return subscription;
  }

  async getActiveSubscription(patientId: number): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: {
        patientId,
        status: SubscriptionStatus.ACTIVE,
        endDate: MoreThan(new Date()),
      },
      relations: ['patient'],
    });
  }

  async activateSubscription(id: number): Promise<Subscription> {
    const subscription = await this.findOne(id);
    
    if (subscription.status !== SubscriptionStatus.PENDING) {
      throw new BadRequestException('Seuls les abonnements en attente peuvent être activés');
    }

    subscription.status = SubscriptionStatus.ACTIVE;
    await this.subscriptionRepository.save(subscription);

    return this.findOne(id);
  }

  async renewSubscription(id: number, renewDto: RenewSubscriptionDto, userId: number): Promise<{ subscription: Subscription; paymentUrl?: string }> {
    const currentSubscription = await this.findOne(id);
    
    if (currentSubscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('Impossible de renouveler un abonnement annulé');
    }

    // Calculer les nouvelles dates
    const startDate = currentSubscription.status === SubscriptionStatus.ACTIVE && currentSubscription.endDate > new Date()
      ? currentSubscription.endDate // Commencer à la fin de l'abonnement actuel
      : new Date(); // Commencer maintenant si expiré

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (renewDto.durationInDays || currentSubscription.durationInDays));

    // Créer un nouvel abonnement (renouvellement)
    const renewalSubscription = this.subscriptionRepository.create({
      type: currentSubscription.type,
      price: renewDto.price || currentSubscription.price,
      currency: currentSubscription.currency,
      durationInDays: renewDto.durationInDays || currentSubscription.durationInDays,
      description: `Renouvellement - ${currentSubscription.description}`,
      features: currentSubscription.features,
      patientId: currentSubscription.patientId,
      startDate,
      endDate,
      status: SubscriptionStatus.PENDING,
    });

    const savedRenewalSubscription = await this.subscriptionRepository.save(renewalSubscription);

    // Marquer l'ancien abonnement comme expiré s'il est encore actif
    if (currentSubscription.status === SubscriptionStatus.ACTIVE) {
      currentSubscription.status = SubscriptionStatus.EXPIRED;
      await this.subscriptionRepository.save(currentSubscription);
    }

    // Créer le paiement pour le renouvellement
    const paymentDto = {
      amount: renewalSubscription.price,
      currency: renewalSubscription.currency,
      method: PaymentMethod.CINETPAY,
      type: PaymentType.SUBSCRIPTION,
      description: `Renouvellement abonnement ${renewalSubscription.type}`,
      patientId: renewalSubscription.patientId,
      subscriptionId: savedRenewalSubscription.id,
      metadata: {
        subscriptionType: renewalSubscription.type,
        isRenewal: true,
        previousSubscriptionId: currentSubscription.id,
      },
    };

    const payment = await this.paymentsService.create(paymentDto, userId);

    return {
      subscription: savedRenewalSubscription,
      paymentUrl: payment.metadata?.cinetpayUrl,
    };
  }

  async cancelSubscription(id: number): Promise<Subscription> {
    const subscription = await this.findOne(id);
    
    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('Abonnement déjà annulé');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    await this.subscriptionRepository.save(subscription);

    return this.findOne(id);
  }

  async checkExpiredSubscriptions(): Promise<void> {
    const expiredSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: MoreThan(new Date()),
      },
    });

    for (const subscription of expiredSubscriptions) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await this.subscriptionRepository.save(subscription);
    }
  }

  async getSubscriptionStats(): Promise<any> {
    const totalSubscriptions = await this.subscriptionRepository.count();
    
    const statusStats = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .select('subscription.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('subscription.status')
      .getRawMany();

    const typeStats = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .select('subscription.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(subscription.price)', 'totalRevenue')
      .groupBy('subscription.type')
      .getRawMany();

    const activeSubscriptions = await this.subscriptionRepository.count({
      where: { status: SubscriptionStatus.ACTIVE },
    });

    const monthlyRevenue = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .select('SUM(subscription.price)', 'total')
      .where('subscription.status = :status', { status: SubscriptionStatus.ACTIVE })
      .andWhere('MONTH(subscription.createdAt) = MONTH(CURRENT_DATE())')
      .andWhere('YEAR(subscription.createdAt) = YEAR(CURRENT_DATE())')
      .getRawOne();

    return {
      totalSubscriptions,
      activeSubscriptions,
      monthlyRevenue: monthlyRevenue?.total || 0,
      statusStats,
      typeStats,
    };
  }

  async getSubscriptionPlans(): Promise<any[]> {
    return [
      {
        type: SubscriptionType.BASIC,
        name: 'Plan Basic',
        price: 25000,
        currency: 'XOF',
        durationInDays: 30,
        features: [
          '3 consultations par mois',
          'Suivi médical de base',
          'Accès aux dossiers médicaux',
        ],
        description: 'Idéal pour un suivi médical régulier',
      },
      {
        type: SubscriptionType.PREMIUM,
        name: 'Plan Premium',
        price: 45000,
        currency: 'XOF',
        durationInDays: 30,
        features: [
          'Consultations illimitées',
          'Suivi médical avancé',
          'Accès aux spécialistes',
          'Analyses de laboratoire incluses',
          'Support téléphonique 24h/7j',
        ],
        description: 'Pour une prise en charge complète',
      },
      {
        type: SubscriptionType.VIP,
        name: 'Plan VIP',
        price: 75000,
        currency: 'XOF',
        durationInDays: 30,
        features: [
          'Tout du plan Premium',
          'Consultations à domicile',
          'Médecin personnel dédié',
          'Urgences prioritaires',
          'Examens spécialisés inclus',
          'Concierge médical',
        ],
        description: 'Service premium avec accompagnement personnalisé',
      },
    ];
  }
}
