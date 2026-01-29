import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: async (config: ConfigService) => ({
                ...config.get('database'),
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [
        {
            provide: DataSource,
            useFactory: async (config: ConfigService) => {
                const dataSource = new DataSource({
                    ...config.get('database')!,
                });
                return await dataSource.initialize();
            },
            inject: [ConfigService],
        },
    ],
    exports: [DataSource, TypeOrmModule],
})
export class DatabaseModule { }