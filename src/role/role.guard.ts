import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './role.enum';
import { ROLES_KEY } from './role.decorator';
import { IS_PUBLIC_KEY } from 'src/auth/auth.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    
        if (isPublic) {
          return true;
        }


    const request = context.switchToHttp().getRequest();
    const user = request['user'];
    if (requiredRoles == undefined  || requiredRoles?.length == 0 ) {
      return false;
    }

    if (!user) return false;

    // ✅ Admin luôn có quyền
    if (user.role === Role.ADMIN) return true;
    if(user.isAdmin) return true;

    // ✅ Hiệu trưởng có tất cả quyền trong trường
    if (user.role === Role.PRINCIPAL && requiredRoles?.some(role => role !== Role.ADMIN)) {
      return true;
    }

    // ✅ Giáo viên chỉ có quyền xem môn học họ quản lý
    if (requiredRoles?.includes(Role.TEACHER) && [Role.PRINCIPAL, Role.ADMIN]?.includes(user.role)) {
      return true;
    }

    // Kiểm tra quyền thông thường
    return requiredRoles.includes(user.role);
  }
} 
