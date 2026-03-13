import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { UsersRepository, User } from './users.repository';

jest.mock('bcrypt');

const mockUser: User = {
  id: 'user-1',
  email: 'admin@devtools.local',
  password: '$2b$12$hashedpassword',
  name: 'Administrator',
  role: 'admin',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                'admin.email': 'admin@devtools.local',
                'admin.password': 'admin123',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should delegate to repository', async () => {
      repository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('admin@devtools.local');

      expect(repository.findByEmail).toHaveBeenCalledWith(
        'admin@devtools.local',
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      repository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('unknown@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should delegate to repository', async () => {
      repository.findById.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');

      expect(repository.findById).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('validatePassword', () => {
    it('should return true for matching password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword('admin123', 'hashed');

      expect(bcrypt.compare).toHaveBeenCalledWith('admin123', 'hashed');
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword('wrong', 'hashed');

      expect(result).toBe(false);
    });
  });

  describe('seedAdmin', () => {
    it('should skip seeding when admin already exists', async () => {
      repository.count.mockResolvedValue(1);

      await service.seedAdmin();

      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should create admin with hashed password when no users exist', async () => {
      repository.count.mockResolvedValue(0);
      repository.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$12$newhashedpassword');

      await service.seedAdmin();

      expect(bcrypt.hash).toHaveBeenCalledWith('admin123', 12);
      expect(repository.create).toHaveBeenCalledWith({
        email: 'admin@devtools.local',
        password: '$2b$12$newhashedpassword',
        name: 'Administrator',
        role: 'admin',
      });
    });
  });
});
