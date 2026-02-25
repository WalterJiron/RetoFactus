import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Reto Factus - API')
    .setDescription(
      'Documentación de la API para un mejor entendimiento de la misma'
    )
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
      'JWT-auth', // Referencia interna para usar en @ApiBearerAuth()
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/docs',
    apiReference({
      spec: {
        content: document,
      },
      theme: 'purple',
      layout: 'modern',
      darkMode: true,
      hideDownloadButton: true,
      metaData: {
        title: 'Documentación API Reto Factus',
        description: 'Referencia técnica completa para desarrolladores',
      },
    }),
  );

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



  app.useGlobalPipes(
    // Para las validaciones
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(parseInt(process.env.PORT!) ?? 4000);
}
bootstrap();
