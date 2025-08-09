import {CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import {JwtService, TokenExpiredError} from '@nestjs/jwt';
import {Request} from 'express';
import {Reflector} from '@nestjs/core';
import { IS_PUBLIC_KEY } from './auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

    if (isPublic) {
      // 💡 Chỉ cần có token là đc truy cập
      return true;
    }
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Ko có token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret:'thienthanh132',
      });
      request['user'] = payload;
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token hết hạn');
      }
      throw new UnauthorizedException('Token không chính xác');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
