import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Sécurité et performance pour la production
  app.use(helmet());
  app.use(compression());

  // Configuration de la validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: configService.get('nodeEnv') === 'production',
    }),
  );

  // Configuration CORS dynamique
  const corsOrigins = configService.get('cors.origins');
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configuration Swagger (seulement en développement)
  if (configService.get('nodeEnv') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API de Gestion de Clinique')
      .setDescription(`
        API complète pour la gestion d'une clinique médicale.
        
        Cette API permet de :
        - Gérer les utilisateurs (administrateurs et réceptionnistes)
        - Enregistrer et gérer les patients
        - Traiter les paiements via CinetPay ou autres méthodes
        - Suivre les statistiques et générer des rapports
        
        **Authentification :** Cette API utilise JWT Bearer Token pour l'authentification.
        
        **Rôles :**
        - **Admin :** Accès complet à toutes les fonctionnalités
        - **Réceptionniste :** Gestion des patients et des paiements (lecture/écriture)
      `)
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Entrez votre token JWT',
          in: 'header',
        },
        'JWT-auth', // Nom de référence
      )
      .addTag('Authentification', 'Endpoints pour la connexion et l\'authentification')
      .addTag('Gestion des utilisateurs', 'CRUD pour les utilisateurs (admin/réceptionniste)')
      .addTag('Gestion des patients', 'CRUD pour les patients et leurs informations médicales')
      .addTag('Abonnements', 'Gestion des abonnements patients avec plans et renouvellements')
      .addTag('Gestion des paiements', 'Traitement des paiements et intégration CinetPay')
      .addServer('http://localhost:3000', 'Serveur de développement')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  const port = configService.get('port') || 3000;
  await app.listen(port);
  
  const nodeEnv = configService.get('nodeEnv');
  console.log(`🚀 Application démarrée sur : http://localhost:${port}`);
  console.log(`🌍 Environnement : ${nodeEnv}`);
  
  if (nodeEnv !== 'production') {
    console.log(`📚 Documentation Swagger : http://localhost:${port}/api/docs`);
  }
}
bootstrap();
