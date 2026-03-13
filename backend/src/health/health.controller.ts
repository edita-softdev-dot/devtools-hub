import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
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
  async readiness(@Res({ passthrough: true }) res: Response) {
    const esHealthy = await this.es.isHealthy();

    if (!esHealthy) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return {
      status: esHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        elasticsearch: esHealthy ? 'connected' : 'disconnected',
      },
    };
  }
}
