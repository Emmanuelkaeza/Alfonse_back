import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        message: this.getSuccessMessage(request.method),
        timestamp: new Date().toISOString(),
      })),
    );
  }

  private getSuccessMessage(method: string): string {
    const messages = {
      GET: 'Données récupérées avec succès',
      POST: 'Ressource créée avec succès',
      PUT: 'Ressource mise à jour avec succès',
      PATCH: 'Ressource modifiée avec succès',
      DELETE: 'Ressource supprimée avec succès',
    };
    
    return messages[method] || 'Opération réussie';
  }
}
