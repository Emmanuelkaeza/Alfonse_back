import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { PatientsService } from '../patients/patients.service';
import { UserRole } from '../users/entities/user.entity';
import { Gender } from '../patients/entities/patient.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const patientsService = app.get(PatientsService);

  try {
    console.log('🌱 Initialisation de la base de données...\n');

    // Créer un administrateur par défaut
    const adminExists = await usersService.findByEmail('admin@clinic.com');
    
    if (!adminExists) {
      await usersService.create({
        email: 'admin@clinic.com',
        firstName: 'Admin',
        lastName: 'System',
        password: 'admin123',
        role: UserRole.ADMIN,
      });
      console.log('✅ Administrateur créé avec succès');
      console.log('📧 Email: admin@clinic.com');
      console.log('🔑 Mot de passe: admin123\n');
    } else {
      console.log('ℹ️  Administrateur existe déjà\n');
    }

    // Créer un réceptionniste par défaut
    const receptionistExists = await usersService.findByEmail('receptionist@clinic.com');
    
    if (!receptionistExists) {
      await usersService.create({
        email: 'receptionist@clinic.com',
        firstName: 'Marie',
        lastName: 'Dupont',
        password: 'receptionist123',
        role: UserRole.RECEPTIONIST,
      });
      console.log('✅ Réceptionniste créé avec succès');
      console.log('📧 Email: receptionist@clinic.com');
      console.log('🔑 Mot de passe: receptionist123\n');
    } else {
      console.log('ℹ️  Réceptionniste existe déjà\n');
    }

    // Créer quelques patients de test
    const testPatients = [
      {
        firstName: 'Alice',
        lastName: 'Martin',
        email: 'alice.martin@example.com',
        phone: '+225 07 12 34 56 78',
        dateOfBirth: '1985-03-15',
        gender: Gender.FEMALE,
        address: '123 Rue de la Paix, Abidjan',
        emergencyContact: 'Pierre Martin',
        emergencyPhone: '+225 05 98 76 54 32',
        medicalHistory: 'Diabète de type 2',
        allergies: 'Pénicilline',
      },
      {
        firstName: 'Jean',
        lastName: 'Kouassi',
        email: 'jean.kouassi@example.com',
        phone: '+225 01 23 45 67 89',
        dateOfBirth: '1992-07-22',
        gender: Gender.MALE,
        address: '456 Boulevard de la République, Yamoussoukro',
        emergencyContact: 'Aya Kouassi',
        emergencyPhone: '+225 09 87 65 43 21',
        medicalHistory: 'Hypertension',
        allergies: 'Aucune',
      },
      {
        firstName: 'Fatou',
        lastName: 'Traoré',
        email: 'fatou.traore@example.com',
        phone: '+225 02 34 56 78 90',
        dateOfBirth: '1988-11-08',
        gender: Gender.FEMALE,
        address: '789 Avenue de l\'Indépendance, San Pedro',
        emergencyContact: 'Mamadou Traoré',
        emergencyPhone: '+225 08 76 54 32 10',
        medicalHistory: 'Asthme',
        allergies: 'Fruits de mer',
      },
    ];

    for (const patientData of testPatients) {
      const existingPatient = await patientsService.findAll(patientData.email, 1, 1);
      if (existingPatient.total === 0) {
        await patientsService.create(patientData);
        console.log(`✅ Patient créé: ${patientData.firstName} ${patientData.lastName}`);
      } else {
        console.log(`ℹ️  Patient existe déjà: ${patientData.firstName} ${patientData.lastName}`);
      }
    }

    console.log('\n🎉 Initialisation terminée avec succès!');
    console.log('\n📊 Plans d\'abonnement disponibles:');
    console.log('• Basic: 25,000 XOF/mois - 3 consultations');
    console.log('• Premium: 45,000 XOF/mois - Consultations illimitées + analyses');
    console.log('• VIP: 75,000 XOF/mois - Service complet + consultations à domicile');
    
    console.log('\n🚀 Pour démarrer l\'application:');
    console.log('npm run start:dev');
    console.log('\n📚 Documentation API:');
    console.log('http://localhost:3000/api/docs');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
  } finally {
    await app.close();
  }
}

seed();
