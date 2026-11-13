import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  data: T;
  message: string;
  status: number;
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    const status = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((payload) => {
        if (payload && typeof payload === 'object' && 'data' in payload && 'message' in payload) {
          return {
            data: payload.data,
            message: payload.message,
            status,
          };
        }

        return {
          data: payload ?? null,
          message: 'OK',
          status,
        };
      }),
    );
  }
}