import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UsersRepository } from './users.repository';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async seedAdmin(): Promise<void> {
    const existingCount = await this.usersRepository.count();
    if (existingCount > 0) {
      this.logger.log('Admin user already exists, skipping seed');
      return;
    }

    const email = this.configService.get<string>('admin.email')!;
    const password = this.configService.get<string>('admin.password')!;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await this.usersRepository.create({
      email,
      password: hashedPassword,
      name: 'Administrator',
      role: 'admin',
    });

    this.logger.log(`Admin user seeded: ${email}`);
  }
}
