# BeautySupply Pro — API

Backend en Node.js + Express + PostgreSQL + Prisma.

## Requisitos

- Node.js 18+
- Una base de datos PostgreSQL (local o en Railway)

## Configuración local

1. Copia el archivo de variables de entorno:

   ```bash
   cp .env.example .env
   ```

2. Edita `.env` y coloca tu `DATABASE_URL` real (Postgres local o de Railway) y un `JWT_SECRET` largo y aleatorio.

3. Instala dependencias:

   ```bash
   npm install
   ```

4. Crea las tablas en la base de datos:

   ```bash
   npx prisma migrate dev --name init
   ```

5. Carga datos de prueba (categorías, productos, clientes y un usuario admin):

   ```bash
   npm run prisma:seed
   ```

   Esto crea el usuario `dsantiagommz@gmail.com` con contraseña `changeme123` — cámbiala después del primer login.

6. Levanta el servidor en modo desarrollo:

   ```bash
   npm run dev
   ```

   La API queda disponible en `http://localhost:4000`.

## Despliegue en Railway

1. Crea un proyecto en Railway y agrega un servicio de **PostgreSQL**.
2. Agrega un segundo servicio apuntando a este directorio (`server/`) como servicio Node.
3. Railway te da automáticamente la variable `DATABASE_URL` del servicio de Postgres — enlázala como variable de entorno del servicio Node.
4. Agrega también `JWT_SECRET` y `CLIENT_ORIGIN` (la URL del frontend desplegado) como variables de entorno.
5. En "Deploy" configura el comando de build como `npx prisma generate && npx prisma migrate deploy` y el comando de arranque como `npm start`.
6. Corre el seed una vez manualmente desde la consola de Railway: `npm run prisma:seed`.

## Endpoints principales

| Método | Ruta                        | Descripción                          |
|--------|-----------------------------|---------------------------------------|
| POST   | `/api/auth/login`           | Login, devuelve JWT                   |
| GET    | `/api/auth/me`               | Usuario autenticado actual            |
| GET    | `/api/products`              | Lista productos (filtros: search, categoryId) |
| POST   | `/api/products`              | Crea producto                         |
| PUT    | `/api/products/:id`          | Actualiza producto                    |
| DELETE | `/api/products/:id`          | Desactiva producto                    |
| GET    | `/api/categories`            | Lista categorías                      |
| GET    | `/api/customers`              | Lista clientes con estadísticas       |
| POST   | `/api/customers`              | Crea cliente                          |
| GET    | `/api/orders`                 | Lista pedidos (filtro: status)        |
| POST   | `/api/orders`                 | Crea pedido (valida y descuenta stock)|
| PATCH  | `/api/orders/:id/status`      | Cambia estado del pedido              |
| GET    | `/api/shipments`              | Lista envíos                          |
| GET    | `/api/dashboard/summary`      | KPIs del dashboard                    |

Todas las rutas excepto `/api/auth/login` requieren el header `Authorization: Bearer <token>`.

## Roles

- `ADMIN`: acceso completo.
- `BODEGA`: mismo acceso a las rutas por ahora (los permisos granulares por rol se agregan cuando el negocio lo necesite — el modelo ya soporta distinguir por `req.user.role` en cada ruta con `requireRole`).
