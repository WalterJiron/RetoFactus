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

        app.use('/api-json', (req: any, res: any) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(document));
        });

        app.use('/docs', (req: any, res: any) => {
            const configuration = JSON.stringify({
                theme: 'purple',
                layout: 'modern',
                darkMode: true,
                hideDownloadButton: true,
                metaData: {
                    title: 'Documentación API Reto Factus',
                    description: 'Referencia técnica completa para desarrolladores',
                },
            });
            res.send(`
                <!doctype html>
                <html>
                  <head>
                    <title>Documentación API Reto Factus</title>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <meta name="description" content="Referencia técnica completa para desarrolladores" />
                    <style> body { margin: 0; } </style>
                  </head>
                  <body>
                    <script
                      id="api-reference"
                      data-url="/api-json"
                      data-configuration='${configuration}'
                    ></script>
                    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
                  </body>
                </html>
            `);
        });

        app.use('/', (req: any, res: any, next: any) => {
            if (req.url === '/') {
                res.send(`
                    <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; background-color: #0f172a; color: white; text-align: center;">
                      <h1 style="margin-bottom: 10px;">API Reto Factus</h1>
                      <p style="color: #94a3b8; margin-bottom: 25px;">El servicio se encuentra activo y listo para recibir peticiones.</p>
                      <a href="/docs" style="background-color: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Explorar Documentación</a>
                    </div>
                `);
            } else {
                next();
            }
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