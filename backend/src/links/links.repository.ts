import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';
import { ElasticsearchService } from '../elasticsearch';

export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  category?: string;
  sortOrder: number;
  isActive: boolean;
  tags?: string[];
  environment?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const INDEX = 'devtools-links';

const MAPPINGS: MappingTypeMapping = {
  properties: {
    title: { type: 'text', fields: { keyword: { type: 'keyword' } } },
    url: { type: 'keyword' },
    description: { type: 'text' },
    icon: { type: 'keyword' },
    category: { type: 'keyword' },
    sortOrder: { type: 'integer' },
    isActive: { type: 'boolean' },
    tags: { type: 'keyword' },
    environment: { type: 'keyword' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
    createdBy: { type: 'keyword' },
  },
};

type LinkDocument = Omit<Link, 'id'>;

@Injectable()
export class LinksRepository implements OnModuleInit {
  private readonly logger = new Logger(LinksRepository.name);

  constructor(private readonly es: ElasticsearchService) {}

  async onModuleInit(): Promise<void> {
    await this.es.ensureIndex(INDEX, MAPPINGS);
    this.logger.log(`Index "${INDEX}" ready`);
  }

  async findAll(activeOnly = false): Promise<Link[]> {
    const query = activeOnly
      ? { bool: { filter: [{ term: { isActive: true } }] } }
      : { match_all: {} as Record<string, never> };

    const result = await this.es.getClient().search<LinkDocument>({
      index: INDEX,
      query,
      sort: [
        { category: { order: 'asc' } },
        { sortOrder: { order: 'asc' } },
      ],
      size: 1000,
    });

    return result.hits.hits
      .filter((hit) => hit._source)
      .map((hit) => ({ id: hit._id!, ...hit._source! }));
  }

  async findById(id: string): Promise<Link | null> {
    try {
      const result = await this.es.getClient().get<LinkDocument>({
        index: INDEX,
        id,
      });
      if (!result._source) return null;
      return { id: result._id, ...result._source };
    } catch (error: any) {
      if (error?.meta?.statusCode === 404) return null;
      throw error;
    }
  }

  async create(data: Omit<Link, 'id' | 'createdAt' | 'updatedAt'>): Promise<Link> {
    const now = new Date().toISOString();
    const document: LinkDocument = { ...data, createdAt: now, updatedAt: now };

    const result = await this.es.getClient().index({
      index: INDEX,
      document,
      refresh: 'wait_for',
    });

    return { id: result._id, ...document };
  }

  async update(id: string, data: Partial<Omit<Link, 'id' | 'createdAt'>>): Promise<Link | null> {
    try {
      await this.es.getClient().update({
        index: INDEX,
        id,
        doc: { ...data, updatedAt: new Date().toISOString() },
        refresh: 'wait_for',
      });

      return this.findById(id);
    } catch (error: any) {
      if (error?.meta?.statusCode === 404) return null;
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.es.getClient().delete({
        index: INDEX,
        id,
        refresh: 'wait_for',
      });
      return true;
    } catch (error: any) {
      if (error?.meta?.statusCode === 404) return false;
      throw error;
    }
  }

  async count(): Promise<number> {
    const result = await this.es.getClient().count({ index: INDEX });
    return result.count;
  }
}
