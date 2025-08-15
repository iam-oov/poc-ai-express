import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { DEVELOPMENT, envs } from '../../configs';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      this.handleHttpException(exception, response, request);
    } else {
      this.handleGenericException(exception, response, request);
    }
  }

  private getErrorMessage(
    exceptionResponse: any,
    exception: HttpException,
  ): string {
    return typeof exceptionResponse === 'object' && exceptionResponse.message
      ? exceptionResponse.message
      : exception.message;
  }

  private getErrorCode(exceptionResponse: any): string {
    return typeof exceptionResponse === 'object' && exceptionResponse.code
      ? exceptionResponse.code
      : '';
  }

  private getErrorSys(exceptionResponse: any): string {
    return typeof exceptionResponse === 'object' && exceptionResponse.sys
      ? exceptionResponse.sys
      : '';
  }

  private handleHttpException(
    exception: HttpException,
    response: Response,
    request: Request,
  ): void {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorMessage = this.getErrorMessage(exceptionResponse, exception);
    const errorCode = this.getErrorCode(exceptionResponse);
    const errorSys = this.getErrorSys(exceptionResponse);

    const errorResponse = this.buildErrorResponse(
      status,
      { errorMessage, errorCode, errorSys },
      request,
      exception,
    );

    response.status(status).json(errorResponse);
  }

  private handleGenericException(
    exception: unknown,
    response: Response,
    request: Request,
  ): void {
    const errorResponse = this.buildErrorResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        errorMessage:
          'Internal server error. Check the logs for more information.',
        errorCode: 'INTERNAL_SERVER_ERROR',
        errorSys: '',
      },
      request,
      exception,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }

  private buildErrorResponse(
    statusCode: number,
    customKeysError: {
      errorMessage: string;
      errorCode: string;
      errorSys: string;
    },
    request: Request,
    exception: unknown,
  ): Record<string, any> {
    const errorResponse: Record<string, any> = {
      statusCode,
      message: customKeysError.errorMessage,
      code: customKeysError.errorCode.toUpperCase(),
      sys: customKeysError.errorSys,
    };

    if (envs.nodeEnv === DEVELOPMENT) {
      errorResponse.path = request.url;
      errorResponse.stack = (exception as Error).stack;
    }

    return errorResponse;
  }
}
