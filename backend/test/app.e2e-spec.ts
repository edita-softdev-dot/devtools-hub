import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { ElasticsearchService } from '../src/elasticsearch';
import { LinksRepository } from '../src/links/links.repository';
import { UsersRepository } from '../src/users/users.repository';

const mockLinks = [
  {
    id: 'link-1',
    title: 'Grafana',
    url: 'https://grafana.internal.io',
    description: 'Monitoring',
    icon: 'activity',
    category: 'Monitoring',
    sortOrder: 0,
    isActive: true,
    tags: ['production'],
    environment: 'production',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'seed',
  },
];

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const mockAdmin = {
      id: 'admin-1',
      email: 'admin@devtools.local',
      password: hashedPassword,
      name: 'Administrator',
      role: 'admin' as const,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ElasticsearchService)
      .useValue({
        getClient: jest.fn(),
        isHealthy: jest.fn().mockResolvedValue(true),
        ensureIndex: jest.fn().mockResolvedValue(undefined),
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
      })
      .overrideProvider(LinksRepository)
      .useValue({
        findAll: jest.fn().mockResolvedValue(mockLinks),
        findById: jest.fn().mockResolvedValue(mockLinks[0]),
        create: jest.fn().mockResolvedValue(mockLinks[0]),
        update: jest.fn().mockResolvedValue(mockLinks[0]),
        delete: jest.fn().mockResolvedValue(true),
        count: jest.fn().mockResolvedValue(1),
        onModuleInit: jest.fn(),
      })
      .overrideProvider(UsersRepository)
      .useValue({
        findByEmail: jest.fn().mockResolvedValue(mockAdmin),
        findById: jest.fn().mockResolvedValue(mockAdmin),
        create: jest.fn().mockResolvedValue(mockAdmin),
        count: jest.fn().mockResolvedValue(1),
        onModuleInit: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('GET /api/health should return liveness status', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          const body = res.body as { status: string; timestamp: string };
          expect(body.status).toBe('ok');
          expect(body.timestamp).toBeDefined();
        });
    });

    it('GET /api/health/ready should check elasticsearch', () => {
      return request(app.getHttpServer())
        .get('/api/health/ready')
        .expect(200)
        .expect((res) => {
          const body = res.body as {
            status: string;
            checks: { elasticsearch: string };
          };
          expect(body.status).toBe('ok');
          expect(body.checks.elasticsearch).toBe('connected');
        });
    });
  });

  describe('Links (public)', () => {
    it('GET /api/links should return active links', () => {
      return request(app.getHttpServer())
        .get('/api/links')
        .expect(200)
        .expect((res) => {
          const body = res.body as Array<{ title: string }>;
          expect(Array.isArray(body)).toBe(true);
          expect(body[0].title).toBe('Grafana');
        });
    });
  });

  describe('Auth', () => {
    it('POST /api/auth/login should return a JWT token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@devtools.local', password: 'admin123' })
        .expect(201)
        .expect((res) => {
          const body = res.body as { accessToken: string };
          expect(body.accessToken).toBeDefined();
        });
    });

    it('POST /api/auth/login should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@devtools.local', password: 'wrongpassword' })
        .expect(401);
    });
  });

  describe('Links (protected)', () => {
    it('POST /api/links should require authentication', () => {
      return request(app.getHttpServer())
        .post('/api/links')
        .send({ title: 'Test', url: 'https://example.com' })
        .expect(401);
    });

    it('GET /api/links/admin should require authentication', () => {
      return request(app.getHttpServer()).get('/api/links/admin').expect(401);
    });
  });
});
