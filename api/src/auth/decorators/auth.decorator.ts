import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { Roles } from './roles.decorator';
import { AuthGuard } from '../guard/auth.guard';
import { RolesGuard } from '../guard/roles.guard';
import { SkipThrottle } from '@nestjs/throttler';

export function Auth(...roles: Role[]) {
    return applyDecorators(
        SkipThrottle({ default: false }),
        Roles(...roles),
        UseGuards(AuthGuard, RolesGuard),
    );
}
