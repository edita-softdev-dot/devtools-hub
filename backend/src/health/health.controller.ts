import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ElasticsearchService } from '../elasticsearch';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly es: ElasticsearchService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe' })
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe (checks ElasticSearch)' })
  async readiness() {
    const esHealthy = await this.es.isHealthy();
    const body = {
      status: esHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        elasticsearch: esHealthy ? 'connected' : 'disconnected',
      },
    };

    if (!esHealthy) {
      throw new HttpException(body, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return body;
  }
}
