import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from '../guard/throttler-behind-proxy.guard';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),


        // for petition security
        ThrottlerModule.forRoot({
            throttlers: [

                // config global for routes (50 requests/minute)
                {
                    limit: parseInt(process.env.LIMIT_REQUESTS!) || 50,
                    ttl: parseInt(process.env.TTL_REQUESTS_LOGIN!) || 60000,
                    blockDuration: parseInt(process.env.BLOCK_DURATION!) || 120000,   // Block for 2 minute
                },


            ],
            errorMessage: 'Demasiadas solicitudes. Por favor intente nuevamente mas tarde.',

        }),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerBehindProxyGuard
        },
    ],
    exports: [ThrottlerModule],
})
export class ThrottleConfigModule { }
