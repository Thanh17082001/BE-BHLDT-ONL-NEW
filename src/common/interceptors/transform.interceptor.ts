import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { RESPONSE_MESSAGE } from '../decorators/customize.decorator';


export interface Response<T> {
    statusCode: number;
    message?: string;
    data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {

    constructor(private reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        const statusCode: number = context.switchToHttp().getResponse().statusCode;
        return next.handle().pipe(map(data => (
            {
                statusCode: statusCode,
                message: this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()) || 'Success',
                data: Array.isArray(data) ? { data: data } : data,
            }
        )));
    }
}