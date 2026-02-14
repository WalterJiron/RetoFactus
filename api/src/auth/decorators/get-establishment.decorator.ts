import { createParamDecorator, ExecutionContext } from '@nestjs/common';


/**
 * Decorador de parámetro que obtiene el ID del establecimiento actual desde el objeto de solicitud.
 *
 * @remarks
 * Este decorador asume que el objeto `user` ha sido previamente añadido a la solicitud (por ejemplo,
 * mediante un middleware de autenticación) y que dicho objeto contiene una propiedad `establishmentId`.
 *
 * @returns El valor de `request.user.establishmentId`.
 *
 * @example
 * // Uso en un controlador
 * @Get('profile')
 * getProfile(@CurrentEstablishment() establishmentId: string) {
 *   return `Establecimiento actual: ${establishmentId}`;
 * }
 */
export const CurrentEstablishment = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user.establishmentId;
    },
);