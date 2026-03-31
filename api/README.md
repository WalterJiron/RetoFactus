# 🧾 RetoFactus — API REST

API REST desarrollada en **NestJS** como backend del sistema **RetoFactus**, una plataforma de gestión comercial con facturación electrónica integrada. La API expone servicios para la administración de establecimientos, usuarios, productos, clientes, ventas y la generación de facturas mediante integración con el servicio externo **Factus**.

---

## 📋 Descripción General

### Propósito

La API actúa como núcleo del sistema, centralizando la lógica de negocio para:

- Autenticación y control de acceso basado en roles.
- Administración de establecimientos comerciales, roles y usuarios.
- Gestión del catálogo de productos con categorías y subcategorías.
- Registro de clientes y formas de pago disponibles.
- Procesamiento de ventas y su vinculación con la facturación electrónica.
- Integración con la plataforma **Factus** para la emisión de facturas electrónicas.

### Alcance Funcional

| Módulo           | Descripción                                                               |
|-----------------|---------------------------------------------------------------------------|
| Auth            | Autenticación mediante credenciales, emisión de JWT                       |
| Establishments  | CRUD de establecimientos comerciales con soft-delete y restauración        |
| Roles           | Administración de roles por establecimiento                               |
| Users           | Gestión de usuarios segmentados por establecimiento                       |
| Categories      | Gestión de categorías de productos                                        |
| Subcategories   | Subcategorías vinculadas jerárquicamente a categorías                     |
| Products        | Catálogo de productos con precios, stock, código de referencia y detalle  |
| Customers       | Gestión de clientes registrados para facturación                          |
| Payment Forms   | Consulta de formas de pago disponibles en el sistema                      |
| Sales           | Registro y gestión del ciclo de vida de ventas                            |
| Factus          | Generación y gestión de facturas electrónicas a través de Factus          |

---

## 🛠️ Tecnologías Utilizadas

### Framework y Plataforma

| Tecnología          | Versión  | Rol                                             |
|--------------------|----------|-------------------------------------------------|
| Node.js            | ≥ 18     | Entorno de ejecución                            |
| NestJS             | ^11.0.1  | Framework principal (módulos, DI, pipes, guards)|
| TypeScript         | 5.7.3    | Lenguaje de desarrollo                          |
| Express (via NestJS)| ^5.0.0  | Plataforma HTTP subyacente                      |

### Base de Datos

| Tecnología | Versión  | Rol                                                                |
|-----------|----------|--------------------------------------------------------------------|
| PostgreSQL | —        | Base de datos relacional principal                                 |
| TypeORM   | 0.3.28   | ORM para conexión y acceso a datos                                 |
| `pg`      | ^8.17.2  | Driver nativo de PostgreSQL para Node.js                           |

> **Nota:** La API utiliza extensivamente **stored procedures y funciones PostgreSQL** para encapsular la lógica de negocio en la base de datos (por ejemplo: `create_users`, `update_product`, `verify_user`, `obtener_usuario_por_email`, entre otras).

### Seguridad y Autenticación

| Tecnología          | Versión | Rol                                      |
|--------------------|---------|------------------------------------------|
| `@nestjs/jwt`      | 11.0.2  | Generación y verificación de tokens JWT  |
| `@nestjs/throttler`| 6.5.0   | Rate limiting y protección contra abuso  |

### Validación y Transformación

| Tecnología         | Versión  | Rol                                        |
|-------------------|----------|--------------------------------------------|
| `class-validator` | ^0.14.3  | Validación declarativa de DTOs vía decoradores |
| `class-transformer`| ^0.5.1  | Transformación y serialización de objetos  |
| `zod`             | ^4.3.6   | Validación de esquemas adicional           |

### Documentación

| Tecnología                    | Versión   | Rol                                           |
|------------------------------|-----------|-----------------------------------------------|
| `@nestjs/swagger`            | 11.2.6    | Generación automática del spec OpenAPI        |
| `@scalar/nestjs-api-reference`| ^1.0.28  | Interfaz interactiva moderna para la API docs |

### Herramientas de Desarrollo

| Tecnología  | Rol                                   |
|------------|---------------------------------------|
| Yarn (Berry)| Gestor de dependencias                |
| SWC        | Compilador rápido de TypeScript       |
| ESLint + Prettier | Linting y formateo de código   |
| Jest       | Testing unitario y de integración     |
| Docker     | Contenedorización del servicio        |

---

## 🚀 Instalación y Ejecución

### Prerrequisitos

- **Node.js** ≥ 18
- **Yarn** (instalación: `npm install -g yarn`)
- **PostgreSQL** ≥ 14 (local o vía Docker)

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd RetoFactus/api
```

### 2. Instalar dependencias

```bash
yarn install
```

### 3. Configurar variables de entorno

Copiar el archivo de ejemplo y completar los valores:

```bash
cp .env.example .env
```

Editar `.env` con los valores correctos para el entorno:

```env
# CORS
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:4000"

# Servidor
PORT=4000

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=admin.123
DB_DATABASE=retoFactus

# Autenticación JWT
JWT_ACCESS_SECRET=your_super_secret_key

# Rate Limiting global
LIMIT_REQUESTS=100
TTL_REQUESTS_LOGIN=60000
BLOCK_DURATION=60000

# Rate Limiting de login
LIMIT_REQUESTS_LOGIN=5
BLOCK_DURATION_LOGIN=600000
```

### 4. Levantar la base de datos (con Docker)

Desde la raíz del monorepo (`RetoFactus/`):

```bash
docker compose up db -d
```

Los scripts de la base de datos se encuentran en `./dataBase/Tables.sql` y `./dataBase/dbDocker.sql`.

### 5. Ejecutar la API

**Modo desarrollo (hot-reload):**
```bash
yarn start:dev
```

**Modo producción:**
```bash
yarn build
yarn start:prod
```

**Modo debug:**
```bash
yarn start:debug
```

### 6. Ejecución completa con Docker Compose

Para levantar todos los servicios (base de datos, API y frontend) desde la raíz del monorepo:

```bash
docker compose up --build
```

La API estará disponible en `http://localhost:4000`.

---

## 🔐 Autenticación

### Tipo de Autenticación

La API implementa autenticación basada en **JSON Web Tokens (JWT)** con tokens de acceso de corta duración.

### Flujo General

1. El cliente envía sus credenciales (email y contraseña) al endpoint de autenticación.
2. El servidor verifica las credenciales contra la base de datos mediante la función `verify_user`.
3. Si la verificación es exitosa, se emite un **access token JWT** con expiración de **24 horas**.
4. El token contiene en su payload: `id de usuario`, `email`, `rol` e `id de establecimiento`.
5. El cliente incluye el token en las peticiones posteriores mediante el header `Authorization: Bearer <token>`.

### Cómo se protege la API

- **`AuthGuard`**: Guard personalizado que valida el JWT en cada petición protegida. Extrae el token del header `Authorization`, lo verifica con el secreto configurado y adjunta el payload decodificado al objeto `request`.

- **`RolesGuard`**: Guard complementario que compara el rol contenido en el token JWT con los roles requeridos por el endpoint (definidos mediante el decorador `@Roles()`).

- **`@Auth(...roles)` decorator**: Decorador compuesto que aplica en conjunto `@Roles()`, `AuthGuard` y `RolesGuard`, simplificando la protección de rutas con control de acceso basado en roles.

- **Rate Limiting**: Implementado globalmente mediante `@nestjs/throttler`. El guard `ThrottlerBehindProxyGuard` (personalizado para entornos detrás de un proxy) aplica las siguientes restricciones configurables vía variables de entorno:
  - **Límite global**: 100 peticiones por minuto por IP.
  - **Protección de login**: 5 intentos máximos; el bloqueo dura 10 minutos.

### Roles Disponibles

| Rol       | Descripción                                              |
|-----------|----------------------------------------------------------|
| `Admin`   | Acceso completo a todos los recursos del establecimiento |
| `Vendedor`| Acceso restringido a operaciones de venta y consulta     |

---

## 🏗️ Estructura del Proyecto

```
api/
├── src/
│   ├── main.ts                    # Bootstrap de la aplicación, configuración de Swagger/Scalar, CORS y pipes globales
│   ├── app.module.ts              # Módulo raíz que importa todos los módulos funcionales
│   │
│   ├── auth/                      # Módulo de autenticación
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── decorators/            # Decoradores custom: @Auth(), @CurrentEstablishment(), @Roles()
│   │   ├── dto/                   # Data Transfer Objects para signin
│   │   ├── enums/                 # Enum de roles del sistema (Admin, Vendedor)
│   │   └── guard/                 # Guards: AuthGuard (JWT) y RolesGuard (roles)
│   │
│   ├── establishments/            # Módulo de establecimientos comerciales
│   ├── roles/                     # Módulo de roles por establecimiento
│   ├── users/                     # Módulo de usuarios del sistema
│   ├── categorys/                 # Módulo de categorías de productos
│   ├── sub_category/              # Módulo de subcategorías
│   ├── products/                  # Módulo de productos y detalle de precios/stock
│   ├── customers/                 # Módulo de clientes para facturación
│   ├── payment_forms/             # Módulo de formas de pago disponibles
│   ├── sales/                     # Módulo de ventas
│   ├── factus/                    # Módulo de integración con Factus (facturación electrónica)
│   │
│   ├── configs/
│   │   ├── database.config.ts     # Configuración de TypeORM cargada desde variables de entorno
│   │   └── throttle-config.module # Módulo global de rate limiting
│   │
│   ├── connection/
│   │   └── database.module.ts     # Módulo de conexión a la base de datos
│   │
│   ├── guard/
│   │   └── throttler-behind-proxy.guard.ts  # Guard de throttling para entornos con proxy
│   │
│   └── utils/
│       └── ResponseValidations.ts  # Utilidad para parsear y validar respuestas de stored procedures
│
├── test/                          # Tests E2E
├── .env.example                   # Plantilla de variables de entorno
├── dockerfile                     # Imagen Docker de la API
├── nest-cli.json                  # Configuración del CLI de NestJS
├── tsconfig.json
└── package.json
```

### Organización Modular

Cada módulo funcional (por ejemplo, `users`, `products`, `sales`) sigue una estructura estándar NestJS:

```
module-name/
├── module-name.module.ts      # Declaración del módulo y sus dependencias
├── module-name.controller.ts  # Capa de presentación: define rutas y decoradores Swagger
├── module-name.service.ts     # Capa de negocio: lógica de consultas y operaciones
├── dto/                       # DTOs de entrada (create, update) validados con class-validator
└── *.spec.ts                  # Tests unitarios
```

---

## ⚙️ Lógica Relevante

### Segmentación por Establecimiento

Toda la información sensible (usuarios, productos, ventas, etc.) está segmentada por **establecimiento**. El `establishmentId` se extrae directamente del token JWT mediante el decorador `@CurrentEstablishment()`, garantizando que cada operación opera únicamente sobre los datos del establecimiento autenticado.

### Integración con Stored Procedures de PostgreSQL

El acceso a datos se realiza mayoritariamente mediante **funciones y procedimientos almacenados** en PostgreSQL desde los servicios NestJS. Esto centraliza las reglas de negocio de base de datos y simplifica las consultas en la capa de aplicación. Ejemplos:

| Función PG             | Propósito                                     |
|------------------------|-----------------------------------------------|
| `verify_user($1, $2)`  | Valida las credenciales de autenticación      |
| `obtener_usuario_por_email($1)` | Recupera datos del usuario para el JWT |
| `create_users(...)`    | Crea un usuario en el sistema                 |
| `update_product(...)`  | Actualiza un producto y su detalle de precios |
| `delete_establishments($1)` | Soft-delete de un establecimiento        |
| `restore_users($1)`    | Restaura un usuario eliminado                 |

### Soft Delete y Restauración

Los recursos principales del sistema (usuarios, productos, establecimientos, ventas, etc.) implementan un patrón de **eliminación lógica (`soft delete`)** mediante un campo `Active`. Los registros eliminados pueden ser **restaurados** a través de endpoints específicos de restauración, preservando el historial sin pérdida de datos.

### Validación Global de DTOs

La aplicación registra un `ValidationPipe` global con las siguientes configuraciones:

| Opción               | Valor  | Efecto                                                |
|---------------------|--------|-------------------------------------------------------|
| `whitelist`         | `true` | Elimina automáticamente propiedades no declaradas en el DTO |
| `forbidNonWhitelisted`| `true`| Retorna error 400 si se reciben propiedades no permitidas |
| `transform`         | `true` | Transforma automáticamente los tipos primitivos del payload |

### Validación de Respuestas de Base de Datos

La clase utilitaria `ResponseValidation` estandariza el manejo de mensajes retornados por las funciones de PostgreSQL. Valida si el mensaje de respuesta contiene un parámetro de éxito esperado; en caso contrario, lanza una excepción HTTP apropiada (`BadRequestException` o `InternalServerErrorException`).

### Creación de Productos (Lógica Transaccional)

Al crear un producto, el servicio realiza tres operaciones secuenciales:
1. Crea el registro base del producto (`create_product`).
2. Crea el detalle de precios y stock mínimo (`create_detailproduct`).
3. Vincula el producto al establecimiento mediante la tabla `ProductEstablishments`.

Esto garantiza la integridad del catálogo de productos por establecimiento.

### CORS Configurable

Los orígenes permitidos se gestionan mediante la variable de entorno `ALLOWED_ORIGINS`, separados por comas. La configuración admite múltiples orígenes y rechaza cualquier origen no declarado explícitamente.

---

## 📚 Documentación de Endpoints

La documentación técnica completa de todos los endpoints, incluyendo parámetros, cuerpos de petición, respuestas y esquemas, se encuentra disponible a través de la interfaz interactiva **Scalar** (renderizada sobre la especificación OpenAPI generada por Swagger):

| Entorno     | URL de Documentación                    |
|------------|------------------------------------------|
| Local       | `http://localhost:4000/docs`            |
| Producción  | `https://<tu-dominio>/docs`             |

La página raíz de la API (`/`) también incluye un enlace directo a la documentación.

> La documentación interactiva incluye todos los tags, operaciones, esquemas de request/response y soporte para autenticación Bearer JWT directamente desde el navegador.

---

## 🧪 Testing

```bash
# Tests unitarios
yarn test

# Tests con watch mode
yarn test:watch

# Tests con reporte de cobertura
yarn test:cov

# Tests E2E
yarn test:e2e
```

---

## 📦 Docker

### Imagen individual de la API

```bash
docker build -t retofactus-api ./api
docker run -p 4000:4000 --env-file ./api/.env retofactus-api
```

### Stack completo (recomendado)

```bash
# Desde la raíz del monorepo
docker compose up --build
```

Los servicios disponibles tras el despliegue:

| Servicio  | Puerto | Descripción              |
|----------|--------|--------------------------|
| API      | 4000   | Backend NestJS           |
| DB       | 5432   | PostgreSQL               |
| Frontend | 3000   | Interfaz web (Next.js)   |

---

## 🤝 Contribución

1. Crear una rama con el nombre de la funcionalidad: `git checkout -b feature/nombre-funcionalidad`
2. Realizar los cambios siguiendo las convenciones del proyecto.
3. Ejecutar los tests y el linter antes de hacer commit: `yarn test && yarn lint`
4. Abrir un Pull Request describiendo los cambios realizados.

---

*Documentación generada para el proyecto **RetoFactus** · API v1.0.0*
