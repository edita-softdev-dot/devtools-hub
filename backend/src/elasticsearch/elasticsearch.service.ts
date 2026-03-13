import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ElasticsearchService.name);
  private readonly client: Client;

  constructor(private readonly configService: ConfigService) {
    const node = this.configService.get<string>('elasticsearch.node')!;
    const username = this.configService.get<string>('elasticsearch.username');
    const password = this.configService.get<string>('elasticsearch.password');

    const auth =
      username && password ? { username, password } : undefined;

    this.client = new Client({ node, auth });
  }

  async onModuleInit(): Promise<void> {
    try {
      const info = await this.client.info();
      this.logger.log(
        `Connected to ElasticSearch cluster: ${info.cluster_name}`,
      );
    } catch (error) {
      this.logger.error('Failed to connect to ElasticSearch', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
    this.logger.log('ElasticSearch connection closed');
  }

  getClient(): Client {
    return this.client;
  }

  async isHealthy(): Promise<boolean> {
    try {
      const health = await this.client.cluster.health();
      return health.status !== 'red';
    } catch {
      return false;
    }
  }

  async ensureIndex(
    index: string,
    mappings?: Record<string, any>,
  ): Promise<void> {
    const exists = await this.client.indices.exists({ index });
    if (!exists) {
      await this.client.indices.create({
        index,
        body: mappings ? { mappings } : undefined,
      });
      this.logger.log(`Created index: ${index}`);
    }
  }
}
