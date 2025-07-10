import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration de la validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuration CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:4200'], // Ajoutez vos domaines frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configuration Swagger
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

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application démarrée sur : http://localhost:${port}`);
  console.log(`📚 Documentation Swagger : http://localhost:${port}/api/docs`);
}
bootstrap();
