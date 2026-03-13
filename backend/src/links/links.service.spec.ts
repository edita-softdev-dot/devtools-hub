import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LinksService } from './links.service';
import { LinksRepository, Link } from './links.repository';

const mockLink: Link = {
  id: 'test-id-1',
  title: 'Grafana',
  url: 'https://grafana.internal.io',
  description: 'Monitoring dashboards',
  icon: 'activity',
  category: 'Monitoring',
  sortOrder: 0,
  isActive: true,
  tags: ['production'],
  environment: 'production',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  createdBy: 'admin-1',
};

describe('LinksService', () => {
  let service: LinksService;
  let repository: jest.Mocked<LinksRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinksService,
        {
          provide: LinksRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LinksService>(LinksService);
    repository = module.get(LinksRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPublicLinks', () => {
    it('should fetch only active links', async () => {
      repository.findAll.mockResolvedValue([mockLink]);

      const result = await service.getPublicLinks();

      expect(repository.findAll).toHaveBeenCalledWith(true);
      expect(result).toEqual([mockLink]);
    });
  });

  describe('getAllLinks', () => {
    it('should fetch all links including inactive', async () => {
      repository.findAll.mockResolvedValue([mockLink]);

      const result = await service.getAllLinks();

      expect(repository.findAll).toHaveBeenCalledWith(false);
      expect(result).toEqual([mockLink]);
    });
  });

  describe('getLinkById', () => {
    it('should return the link when found', async () => {
      repository.findById.mockResolvedValue(mockLink);

      const result = await service.getLinkById('test-id-1');

      expect(repository.findById).toHaveBeenCalledWith('test-id-1');
      expect(result).toEqual(mockLink);
    });

    it('should throw NotFoundException when link does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getLinkById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createLink', () => {
    it('should create a link with provided fields', async () => {
      repository.create.mockResolvedValue(mockLink);

      const dto = {
        title: 'Grafana',
        url: 'https://grafana.internal.io',
        description: 'Monitoring dashboards',
        icon: 'activity',
        category: 'Monitoring',
        sortOrder: 0,
        isActive: true,
        tags: ['production'],
        environment: 'production',
      };

      const result = await service.createLink(dto, 'admin-1');

      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        createdBy: 'admin-1',
      });
      expect(result).toEqual(mockLink);
    });

    it('should apply defaults for optional fields', async () => {
      repository.create.mockResolvedValue(mockLink);

      const dto = {
        title: 'Minimal Link',
        url: 'https://example.com',
      };

      await service.createLink(dto as any, 'user-1');

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Uncategorized',
          sortOrder: 0,
          isActive: true,
        }),
      );
    });
  });

  describe('updateLink', () => {
    it('should update and return the link', async () => {
      const updated = { ...mockLink, title: 'Updated Grafana' };
      repository.update.mockResolvedValue(updated);

      const result = await service.updateLink('test-id-1', {
        title: 'Updated Grafana',
      });

      expect(repository.update).toHaveBeenCalledWith('test-id-1', {
        title: 'Updated Grafana',
      });
      expect(result.title).toBe('Updated Grafana');
    });

    it('should throw NotFoundException when link does not exist', async () => {
      repository.update.mockResolvedValue(null);

      await expect(
        service.updateLink('missing', { title: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteLink', () => {
    it('should delete the link', async () => {
      repository.delete.mockResolvedValue(true);

      await expect(service.deleteLink('test-id-1')).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith('test-id-1');
    });

    it('should throw NotFoundException when link does not exist', async () => {
      repository.delete.mockResolvedValue(false);

      await expect(service.deleteLink('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('seed', () => {
    it('should skip seeding when links already exist', async () => {
      repository.count.mockResolvedValue(5);

      await service.seed();

      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should create all seed links when database is empty', async () => {
      repository.count.mockResolvedValue(0);
      repository.create.mockResolvedValue(mockLink);

      await service.seed();

      expect(repository.create).toHaveBeenCalledTimes(12);
    });
  });
});
