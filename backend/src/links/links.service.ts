import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { Link, LinksRepository } from './links.repository';

const SEED_LINKS: Omit<Link, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Grafana',
    url: 'https://grafana.internal.io',
    description: 'Application monitoring and observability dashboards',
    icon: 'activity',
    category: 'Monitoring',
    sortOrder: 0,
    isActive: true,
    tags: ['production', 'critical'],
    environment: 'production',
    createdBy: 'seed',
  },
  {
    title: 'Prometheus',
    url: 'https://prometheus.internal.io',
    description: 'Metrics collection and alerting toolkit',
    icon: 'bell',
    category: 'Monitoring',
    sortOrder: 1,
    isActive: true,
    tags: ['production'],
    environment: 'production',
    createdBy: 'seed',
  },
  {
    title: 'Kibana',
    url: 'https://kibana.internal.io',
    description: 'Log exploration and visualization',
    icon: 'search',
    category: 'Logging',
    sortOrder: 0,
    isActive: true,
    tags: ['production', 'critical'],
    environment: 'production',
    createdBy: 'seed',
  },
  {
    title: 'ArgoCD',
    url: 'https://argocd.internal.io',
    description: 'GitOps continuous delivery for Kubernetes',
    icon: 'git-branch',
    category: 'CI/CD',
    sortOrder: 0,
    isActive: true,
    tags: ['production', 'deployment'],
    environment: 'production',
    createdBy: 'seed',
  },
  {
    title: 'Jenkins',
    url: 'https://jenkins.internal.io',
    description: 'Build automation and CI pipeline management',
    icon: 'hammer',
    category: 'CI/CD',
    sortOrder: 1,
    isActive: true,
    tags: ['production'],
    environment: 'production',
    createdBy: 'seed',
  },
  {
    title: 'Swagger API Docs',
    url: 'https://api-docs.internal.io',
    description: 'Interactive REST API documentation and testing',
    icon: 'book-open',
    category: 'Documentation',
    sortOrder: 0,
    isActive: true,
    tags: ['development'],
    environment: 'development',
    createdBy: 'seed',
  },
  {
    title: 'Confluence',
    url: 'https://confluence.internal.io',
    description: 'Team knowledge base and project documentation',
    icon: 'file-text',
    category: 'Documentation',
    sortOrder: 1,
    isActive: true,
    tags: ['development'],
    environment: 'production',
    createdBy: 'seed',
  },
  {
    title: 'pgAdmin',
    url: 'https://pgadmin.internal.io',
    description: 'PostgreSQL database administration and management',
    icon: 'database',
    category: 'Database',
    sortOrder: 0,
    isActive: true,
    tags: ['production', 'staging'],
    environment: 'production',
    createdBy: 'seed',
  },
  {
    title: 'Elasticsearch HQ',
    url: 'https://es-hq.internal.io',
    description: 'Elasticsearch cluster monitoring and management',
    icon: 'server',
    category: 'Database',
    sortOrder: 1,
    isActive: true,
    tags: ['production'],
    environment: 'production',
    createdBy: 'seed',
  },
  {
    title: 'AWS Console',
    url: 'https://console.aws.amazon.com',
    description: 'Cloud infrastructure management and monitoring',
    icon: 'cloud',
    category: 'Infrastructure',
    sortOrder: 0,
    isActive: true,
    tags: ['production', 'critical'],
    environment: 'production',
    createdBy: 'seed',
  },
  {
    title: 'PagerDuty',
    url: 'https://pagerduty.internal.io',
    description: 'Incident management and on-call scheduling',
    icon: 'alert-triangle',
    category: 'Operations',
    sortOrder: 0,
    isActive: true,
    tags: ['production', 'critical'],
    environment: 'production',
    createdBy: 'seed',
  },
  {
    title: 'SonarQube',
    url: 'https://sonarqube.internal.io',
    description: 'Code quality analysis and security scanning',
    icon: 'shield',
    category: 'Quality',
    sortOrder: 0,
    isActive: true,
    tags: ['development'],
    environment: 'development',
    createdBy: 'seed',
  },
];

@Injectable()
export class LinksService {
  private readonly logger = new Logger(LinksService.name);

  constructor(private readonly linksRepository: LinksRepository) {}

  async getPublicLinks(): Promise<Link[]> {
    return this.linksRepository.findAll(true);
  }

  async getAllLinks(): Promise<Link[]> {
    return this.linksRepository.findAll(false);
  }

  async getLinkById(id: string): Promise<Link> {
    const link = await this.linksRepository.findById(id);
    if (!link) throw new NotFoundException(`Link with id "${id}" not found`);
    return link;
  }

  async createLink(dto: CreateLinkDto, userId: string): Promise<Link> {
    return this.linksRepository.create({
      title: dto.title,
      url: dto.url,
      description: dto.description,
      icon: dto.icon,
      category: dto.category ?? 'Uncategorized',
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
      tags: dto.tags,
      environment: dto.environment,
      createdBy: userId,
    });
  }

  async updateLink(id: string, dto: UpdateLinkDto): Promise<Link> {
    const updated = await this.linksRepository.update(id, dto);
    if (!updated) throw new NotFoundException(`Link with id "${id}" not found`);
    return updated;
  }

  async deleteLink(id: string): Promise<void> {
    const deleted = await this.linksRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Link with id "${id}" not found`);
  }

  async seed(): Promise<void> {
    const existingCount = await this.linksRepository.count();
    if (existingCount > 0) {
      this.logger.log('Links already seeded, skipping');
      return;
    }

    for (const link of SEED_LINKS) {
      await this.linksRepository.create(link);
    }
    this.logger.log(`Seeded ${SEED_LINKS.length} developer tool links`);
  }
}
