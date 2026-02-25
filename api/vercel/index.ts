import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

const server = express();
let cachedApp: any;

export default async (req: any, res: any) => {
    if (!cachedApp) {
        const app = await NestFactory.create(
            AppModule,
            new ExpressAdapter(server),
        );

        const config = new DocumentBuilder()
            .setTitle('Reto Factus - API')
            .setDescription('Documentación de la API para un mejor entendimiento de la misma')
            .setVersion('1.0.0')
            .setContact(
                'Soporte Técnico',
                'https://github.com/walterjiron',
                'soporte@ejemplo.com',
            )
            .addTag('Auth', 'Operaciones de autenticación y gestión de acceso')
            .addTag('Establishments', 'Gestión de establecimientos comerciales')
            .addTag('Roles', 'Administración de roles y permisos del sistema')
            .addTag('Users', 'Gestión de usuarios por establecimiento')
            .addTag('Categories', 'Gestión de categorías de productos')
            .addTag('Subcategories', 'Gestión de subcategorías vinculadas a categorías')
            .addTag('Products', 'Gestión del catálogo de productos y existencias')
            .addTag('Customers', 'Gestión de clientes para facturación')
            .addTag('Payment Forms', 'Consulta de formas de pago disponibles')
            .addTag('Factus', 'Módulo de facturación e integración con Factus')
            .addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    name: 'JWT',
                    description: 'Ingrese su token JWT',
                    in: 'header',
                },
                'JWT-auth',
            )
            .build();

        const document = SwaggerModule.createDocument(app, config);

        // Usamos SwaggerModule para Vercel ya que es más estable en serverless
        SwaggerModule.setup('/', app, document, {
            customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
            customJs: [
                'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
                'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
            ],
        });

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