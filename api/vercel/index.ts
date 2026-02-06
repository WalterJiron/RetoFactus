import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

const server = express();
let cachedApp: any;

export default async (req: any, res: any) => {
    // Si la app no existe, la creamos. Si ya existe, la reutilizamos.
    if (!cachedApp) {
        const app = await NestFactory.create(
            AppModule,
            new ExpressAdapter(server),
        );

        const config = new DocumentBuilder()
            .setTitle('Reto Factus')
            .setDescription('Documentación de la API')
            .setVersion('1.0')
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('/', app, document);

        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));

        app.enableCors();
        await app.init();
        cachedApp = app;
    }

    server(req, res);
};