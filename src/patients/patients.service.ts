import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const existingPatient = await this.patientRepository.findOne({
      where: { email: createPatientDto.email },
    });

    if (existingPatient) {
      throw new ConflictException('Un patient avec cet email existe déjà');
    }

    const patient = this.patientRepository.create({
      ...createPatientDto,
      dateOfBirth: new Date(createPatientDto.dateOfBirth),
    });

    return this.patientRepository.save(patient);
  }

  async findAll(search?: string, page = 1, limit = 10): Promise<{ data: Patient[], total: number, page: number, totalPages: number }> {
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    if (search) {
      whereClause = [
        { firstName: Like(`%${search}%`) },
        { lastName: Like(`%${search}%`) },
        { email: Like(`%${search}%`) },
        { phone: Like(`%${search}%`) },
      ];
    }

    const [data, total] = await this.patientRepository.findAndCount({
      where: whereClause,
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

  async findOne(id: number): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['payments'],
    });

    if (!patient) {
      throw new NotFoundException('Patient non trouvé');
    }

    return patient;
  }

  async update(id: number, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);

    if (updatePatientDto.email && updatePatientDto.email !== patient.email) {
      const existingPatient = await this.patientRepository.findOne({
        where: { email: updatePatientDto.email },
      });

      if (existingPatient) {
        throw new ConflictException('Un patient avec cet email existe déjà');
      }
    }

    if (updatePatientDto.dateOfBirth) {
      updatePatientDto.dateOfBirth = new Date(updatePatientDto.dateOfBirth) as any;
    }

    await this.patientRepository.update(id, updatePatientDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientRepository.remove(patient);
  }

  async toggleStatus(id: number): Promise<Patient> {
    const patient = await this.findOne(id);
    patient.isActive = !patient.isActive;
    await this.patientRepository.save(patient);
    return this.findOne(id);
  }

  async getPatientStats(): Promise<any> {
    const totalPatients = await this.patientRepository.count();
    const activePatients = await this.patientRepository.count({ where: { isActive: true } });
    const inactivePatients = totalPatients - activePatients;

    const genderStats = await this.patientRepository
      .createQueryBuilder('patient')
      .select('patient.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .groupBy('patient.gender')
      .getRawMany();

    return {
      totalPatients,
      activePatients,
      inactivePatients,
      genderStats,
    };
  }
}
