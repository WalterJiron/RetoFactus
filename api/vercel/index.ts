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

        // RUTA DE DOCUMENTACIÓN (Solución al error ERR_REQUIRE_ESM)
        app.use('/docs', (req: any, res: any) => {
            res.send(`
                <!doctype html>
                <html>
                  <head>
                    <title>Documentación API Reto Factus</title>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <style>body { margin: 0; }</style>
                  </head>
                  <body>
                    <script
                      id="api-reference"
                      data-url="data:application/json;base64,${Buffer.from(JSON.stringify(document)).toString('base64')}"
                    ></script>
                    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
                  </body>
                </html>
            `);
        });

        // RUTA DE BIENVENIDA
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