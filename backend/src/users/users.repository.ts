import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';
import { ElasticsearchService } from '../elasticsearch';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin';
  createdAt: string;
  updatedAt: string;
}

const INDEX = 'devtools-users';

const MAPPINGS: MappingTypeMapping = {
  properties: {
    email: { type: 'keyword' },
    password: { type: 'keyword', index: false },
    name: { type: 'text' },
    role: { type: 'keyword' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};

@Injectable()
export class UsersRepository implements OnModuleInit {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(private readonly es: ElasticsearchService) {}

  async onModuleInit(): Promise<void> {
    await this.es.ensureIndex(INDEX, MAPPINGS);
    this.logger.log(`Index "${INDEX}" ready`);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.es.getClient().search<Omit<User, 'id'>>({
      index: INDEX,
      query: { term: { email } },
    });

    const hit = result.hits.hits[0];
    if (!hit?._source) return null;

    return { id: hit._id!, ...hit._source };
  }

  async findById(id: string): Promise<User | null> {
    try {
      const result = await this.es.getClient().get<Omit<User, 'id'>>({
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

  async create(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    const now = new Date().toISOString();
    const document = { ...data, createdAt: now, updatedAt: now };

    const result = await this.es.getClient().index({
      index: INDEX,
      document,
      refresh: 'wait_for',
    });

    return { id: result._id, ...document };
  }

  async count(): Promise<number> {
    const result = await this.es.getClient().count({ index: INDEX });
    return result.count;
  }
}
