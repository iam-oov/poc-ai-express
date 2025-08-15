import { Controller, Get, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { appConfig } from '../../configs';

@ApiTags('Health')
@Controller('/')
export class HealthCheckController {
  @Get()
  @ApiOperation({
    summary: 'Service health check',
    description: 'Endpoint to verify the application is running and healthy',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service is operational',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
          description: 'Current status of the service',
        },
        timestamp: {
          type: 'string',
          example: '2024-01-24T12:00:00Z',
          description: 'Timestamp of the health check',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'The service does not work correctly',
  })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      apiVersion: appConfig.APP_VERSION,
    };
  }
}
