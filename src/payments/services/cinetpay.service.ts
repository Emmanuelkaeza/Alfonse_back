import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CinetPayConfig {
  apiKey: string;
  siteId: string;
  baseUrl: string;
}

export interface CinetPayPaymentRequest {
  amount: number;
  currency: string;
  transactionId: string;
  description: string;
  returnUrl?: string;
  notifyUrl?: string;
  customerName?: string;
  customerEmail?: string;
}

export interface CinetPayPaymentResponse {
  success: boolean;
  transactionId: string;
  paymentUrl?: string;
  errorMessage?: string;
}

@Injectable()
export class CinetPayService {
  private readonly config: CinetPayConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      apiKey: this.configService.get<string>('cinetpay.apiKey') || '',
      siteId: this.configService.get<string>('cinetpay.siteId') || '',
      baseUrl: this.configService.get<string>('cinetpay.baseUrl') || '',
    };

    if (!this.config.apiKey || !this.config.siteId) {
      console.warn('⚠️  Configuration CinetPay manquante. Mode simulation activé.');
    }
  }

  async createPayment(request: CinetPayPaymentRequest): Promise<CinetPayPaymentResponse> {
    if (!this.config.apiKey || !this.config.siteId) {
      // Mode simulation pour le développement
      return this.simulatePayment(request);
    }

    try {
      // Implémentation réelle de l'API CinetPay
      const payload = {
        apikey: this.config.apiKey,
        site_id: this.config.siteId,
        transaction_id: request.transactionId,
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        return_url: request.returnUrl,
        notify_url: request.notifyUrl,
        customer_name: request.customerName,
        customer_email: request.customerEmail,
      };

      const response = await fetch(`${this.config.baseUrl}/v2/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.code === '201') {
        return {
          success: true,
          transactionId: request.transactionId,
          paymentUrl: data.data.payment_url,
        };
      } else {
        return {
          success: false,
          transactionId: request.transactionId,
          errorMessage: data.message || 'Erreur lors de la création du paiement',
        };
      }
    } catch (error) {
      console.error('Erreur CinetPay:', error);
      return {
        success: false,
        transactionId: request.transactionId,
        errorMessage: 'Erreur de communication avec CinetPay',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<{ status: string; verified: boolean }> {
    if (!this.config.apiKey || !this.config.siteId) {
      // Mode simulation
      return { status: 'ACCEPTED', verified: true };
    }

    try {
      const payload = {
        apikey: this.config.apiKey,
        site_id: this.config.siteId,
        transaction_id: transactionId,
      };

      const response = await fetch(`${this.config.baseUrl}/v2/payment/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      return {
        status: data.data?.status || 'PENDING',
        verified: data.code === '00',
      };
    } catch (error) {
      console.error('Erreur vérification CinetPay:', error);
      return { status: 'ERROR', verified: false };
    }
  }

  private simulatePayment(request: CinetPayPaymentRequest): CinetPayPaymentResponse {
    // Simulation pour le développement
    console.log('🎭 Mode simulation CinetPay activé');
    console.log('💰 Montant:', request.amount, request.currency);
    console.log('📝 Description:', request.description);
    
    return {
      success: true,
      transactionId: request.transactionId,
      paymentUrl: `http://localhost:3000/mock-payment/${request.transactionId}`,
    };
  }

  validateWebhook(signature: string, payload: string): boolean {
    if (!this.config.apiKey) {
      return true; // Mode simulation
    }

    // Implémentation de la validation de signature webhook
    // Cette logique dépend de la documentation CinetPay
    const expectedSignature = this.generateSignature(payload);
    return signature === expectedSignature;
  }

  private generateSignature(payload: string): string {
    // Implémentation de la génération de signature selon CinetPay
    // Remplacer par la logique réelle
    return 'mock-signature';
  }
}
