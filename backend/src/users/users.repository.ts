import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
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

const MAPPINGS = {
  properties: {
    email: { type: 'keyword' as const },
    password: { type: 'keyword' as const, index: false },
    name: { type: 'text' as const },
    role: { type: 'keyword' as const },
    createdAt: { type: 'date' as const },
    updatedAt: { type: 'date' as const },
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
      body: { query: { term: { email } } },
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
    } catch (error: unknown) {
      if (this.isNotFound(error)) return null;
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
      body: document,
      refresh: 'wait_for',
    });

    return { id: result._id, ...document };
  }

  async count(): Promise<number> {
    const result = await this.es.getClient().count({ index: INDEX });
    return result.count;
  }

  private isNotFound(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'meta' in error &&
      typeof (error as { meta: unknown }).meta === 'object' &&
      (error as { meta: { statusCode?: number } }).meta?.statusCode === 404
    );
  }
}
