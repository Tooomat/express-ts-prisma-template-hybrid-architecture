# Node.js TypeScript REST API Template

Template backend REST API berbasis **Node.js + TypeScript** dengan **Hybrid Architecture Monolith** (Controller → Service → Repository → Database), siap untuk **development, testing, dan production** menggunakan **Docker**.

---

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Arsitektur](#arsitektur)
- [Struktur Folder](#struktur-folder)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Setup & Run (Local)](#setup--run-local)
- [Running with Docker](#running-with-docker)
- [Testing](#testing)
- [API Endpoints](#api-endpoints)
- [Fitur Keamanan](#fitur-keamanan)
- [Database](#database)
- [Redis](#redis)
- [Logging](#logging)
- [Error Handling](#error-handling)
- [Validasi](#validasi)
- [Menambah Module Baru](#menambah-module-baru)
- [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Kategori | Library / Tool |
|---|---|
| Language | TypeScript |
| Runtime | Node.js v18+ |
| HTTP Framework | Express v5 |
| ORM | Prisma v7 |
| Database | PostgreSQL / MySQL (MariaDB) |
| Cache | Redis (ioredis) |
| Validation | Zod v4 |
| Logging | Winston |
| Testing | Jest + Supertest + Babel |
| Security | Helmet, CORS, HPP, XSS, rate-limiter-flexible |
| Containerization | Docker + Docker Compose |

---

## Arsitektur

Template ini menggunakan **Monolith Hybrid Architecture** dengan pola **Controller → Service → Repository → Database**.

```
Request
   │
   ▼
[Middleware]           ← Security, Logging, Validation
   │
   ▼
[Controller]           ← Handle HTTP request/response
   │
   ▼
[Service]              ← Business logic
   │
   ▼
[Repository]           ← Abstraksi akses database
   │
   ▼
[Database / Cache]     ← PostgreSQL / MySQL + Redis
```

### Keuntungan Hybrid Arsitekture

- **Testable** — Service & Repository mudah di-mock
- **Replaceable** — Bisa ganti database tanpa ubah Service/Controller
- **Scalable** — Setiap module berdiri sendiri, mudah dipecah jadi microservice
- **Separation of Concerns** — Setiap layer punya tanggung jawab yang jelas

---

## Struktur Folder

```
.
├── prisma/
│   ├── migrations/          # File migration database
│   ├── seeds/               # Seeder database
│   └── schema.prisma        # Prisma schema
│
├── src/
│   ├── config/
│   │   ├── env.ts           # Konfigurasi environment variables
│   │   └── redis.conf       # Konfigurasi Redis server
│   │
│   ├── generated/
│   │   └── prisma/          # Generated Prisma client (auto-generated)
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── index.database.ts
│   │   │   ├── prisma-pg.service.ts        # Prisma client untuk PostgreSQL
│   │   │   └── prisma-mysql.service.ts     # Prisma client untuk MySQL/MariaDB
│   │   ├── logging/
│   │   │   ├── index.logging.ts            
│   │   │   └── winston-logging.service.ts  # Winston logger instance
│   │   ├── cache/
│   │   │   ├── index.cache.ts            
│   │   │   └── cache.repository.ts         # Repo cache (get, set, setNx, exists, dll)
│   │   │   └── redis.ts                    # Redis instance
│   │   └── server.ts        # Express app setup + middleware
│   │
│   ├── modules/
│   │   └── auth/            # Contoh module (auth)
│   │       ├── auth.controller.ts
│   │       ├── auth.service.ts
│   │       ├── auth.Irepo.ts                  # Interface
│   │       ├── auth.repo.ts                   # Implementasi repository
│   │       ├── auth.dto.ts                    # Data Transfer Object
│   │       └── auth.routes.ts                 # Route definitions
│   │       └── auth.validation.ts             # Zod schema validasi auth
│   │
│   ├── shared/
│   │   ├── http/
│   │   │   └── exception-response.http.ts
│   │   ├── middleware/
│   │   │   ├── logging.middleware.ts
│   │   │   ├── security.middleware.ts
│   │   │   └── web-error-handler.middleware.ts
│   │   ├── response/
│   │   │   └── web.response.ts      # Response helpers
│   │   ├── router/
│   │   │   ├── index.ts             # Main router
│   │   │   ├── public.routes.ts     # Routes tanpa auth
│   │   │   └── private.routes.ts    # Routes dengan auth
│   │   ├── types/
│   │   │   └── paging.type.ts       # Tipe untuk pagination
│   │   ├── utils/
│   │   │   ├── formater.utils.ts    # Hash & mask PII
│   │   │   ├── logging.utils.ts     # Security logger
│   │   │   └── paging.utils.ts      # Pagination builder
│   │   └── validation/
│   │       └── validation.ts        # Wrapper Zod.parse
│   │
│   └── index.ts                     # Entry point
│
├── test/
│   └── example.e2e.test.ts          # Contoh E2E test
│
├── .env.example                     # Template environment variables
├── .env.development.local           # Env untuk development lokal
├── babel.config.json                # Babel config untuk Jest
├── docker-compose.dev.yml           # Docker untuk development
├── docker-compose.test.yml          # Docker untuk testing
├── docker-compose.prod.yml          # Docker untuk production
├── Dockerfile                       # Multi-stage Dockerfile
├── package.json
├── prisma.config.ts                 # Prisma config
├── redis.config.ts                  # Redis config (untuk penggunaan docker)
└── tsconfig.json
```

---

## Prerequisites

Pastikan tools berikut sudah terinstall:

| Tool | Versi Minimum | Keterangan |
|---|---|---|
| Node.js | v20+ | Runtime JavaScript |
| npm | v9+ | Package manager |
| Docker | v24+ | Containerization |
| Docker Compose | v2+ | Multi-container orchestration |
| PostgreSQL | v14+ | Database (jika run lokal) |
| Redis | v7+ | Cache (jika run lokal) |

---

## Environment Variables

Salin file contoh sesuai environment:

```bash
cp .env.example .env.development.local   # untuk development lokal
cp .env.example .env.test.local          # untuk testing lokal
cp .env.example .env.development.docker  # untuk development docker
cp .env.example .env.test.docker         # untuk testing docker
cp .env.example .env                     # untuk production
```

### Daftar Environment Variables

#### App Config

| Variable | Contoh | Keterangan |
|---|---|---|
| `NODE_ENV` | `development` | Environment (`development`, `test`, `production`) |
| `APP_NAME` | `myapp` | Nama aplikasi (dipakai sebagai prefix Redis key) |
| `APP_PORT` | `3000` | Port server |
| `APP_URL` | `http://localhost:3000` | URL aplikasi |
| `FRONTEND_URL` | `http://localhost:5173` | URL frontend (untuk CORS) |

#### Database (PostgreSQL)

| Variable | Contoh | Keterangan |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/db` | Connection string Prisma |
| `DB_HOST` | `localhost` | Host database |
| `DB_USER` | `postgres` | Username database |
| `DB_PORT` | `5432` | Port database |
| `DB_PASSWORD` | `strongpassword` | Password database |
| `DB_NAME` | `myapp_db` | Nama database |

#### Database (MySQL — opsional)

```env
DATABASE_URL="mysql://user:password@localhost:3306/database_name"
DB_HOST=localhost
DB_USER=root
DB_PORT=3306
DB_PASSWORD=
DB_NAME=database_name
```

#### JWT

| Variable | Contoh | Keterangan |
|---|---|---|
| `JWT_ACCESS_SECRET` | `random-string-min-32-chars` | Secret untuk access token |
| `JWT_ACCESS_EXPIRE` | `1h` | Masa berlaku access token |
| `JWT_REFRESH_SECRET` | `another-random-string` | Secret untuk refresh token |
| `JWT_REFRESH_EXPIRE` | `7d` | Masa berlaku refresh token |

> **⚠️ Production:** Gunakan string random minimal 32 karakter untuk JWT secret. Generate dengan: `openssl rand -base64 32`

#### Session

| Variable | Contoh | Keterangan |
|---|---|---|
| `SESSION_SECRET` | `random-string-min-32-chars` | Secret untuk session |

#### Cookies

| Variable | Contoh | Keterangan |
|---|---|---|
| `HTTPONLY_COOKIES` | `true` | Cookie tidak bisa diakses JavaScript |
| `SECURE_COOKIES` | `false` (dev) / `true` (prod) | Cookie hanya dikirim via HTTPS |
| `SAMESITE_COOKIES` | `lax` | Proteksi CSRF (`strict`, `lax`, `none`) |
| `PATH_COOKIES` | `/` | Path scope cookie |

#### CORS

| Variable | Contoh | Keterangan |
|---|---|---|
| `CORS_ORIGIN` | `http://localhost:3000,http://localhost:5173` | Allowed origins, pisahkan dengan koma |

#### Redis

| Variable | Contoh | Keterangan |
|---|---|---|
| `REDIS_HOST` | `localhost` | Host Redis |
| `REDIS_PORT` | `6379` | Port Redis |
| `REDIS_PASSWORD` | `strongpassword` | Password Redis |
| `REDIS_DB` | `0` | Database index Redis (0–3, sesuai config) |

#### Logging

| Variable | Contoh | Keterangan |
|---|---|---|
| `LOG_LEVEL` | `debug` (dev) / `info` (prod) | Level logging Winston |

---

## Setup & Run & Test (LOCAL)

### 1. Clone Repository

```bash
git clone https://github.com/Tooomat/node-template-hybrid-arsitecture.git
cd node-template-hybrid-arsitecture
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
cp .env.example .env.development.local
```

Edit `.env.development.local` sesuai konfigurasi lokal kamu:

```env
DOCKER=false
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/myapp_dev"
REDIS_HOST=localhost
REDIS_PASSWORD=yourpassword
# ... sesuaikan sisanya
```

### 4. Prisma Migration & Generate

```bash
npm run prisma:migrate:dev
npm run prisma:generate:dev
```

### 5. Seed Database (opsional)

```bash
npm run prisma:seed:dev
```

### 6. Jalankan Server

```bash
npm run dev
```

Server berjalan di `http://localhost:3000`

### Testing (LOCAL)


---

## Running with Docker

### Development

```bash
# Build dan jalankan semua service (app + postgres + redis)
npm run dev:docker:up

# Atau manual:
docker compose --env-file .env.development.docker -f docker-compose.dev.yml up -d --build
```

Prisma migration di dalam container:

```bash
docker exec -it app-dev npx prisma migrate dev
docker exec -it app-dev npx prisma generate
```

Seed data:

```bash
docker exec app-dev npm run prisma:seed:dev
```

Perintah container lainnya:

```bash
# Start container yang sudah ada
npm run dev:docker:start

# Stop container (data tetap ada)
npm run dev:docker:stop

# Hapus container (data tetap ada)
npm run dev:docker:down

# Hapus container + volume (data hilang semua)
npm run dev:docker:down:volume
```

### Production

```bash
# Build image
docker build -t myapp:latest .

# Atau dengan Docker Compose
docker compose --env-file .env -f docker-compose.prod.yml up -d

# Cek status
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app

# Jalankan migration
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# Seed production (hati-hati!)
docker exec -it app-prod npm run prisma:seed:prod

# Update deployment
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

---

## Testing (LOCAL & DOCKER)

Template menggunakan **Jest** + **Supertest** untuk E2E testing.

### Setup Test Environment 

if `local`:
```bash
cp .env.example .env.test.local
```

if use `docker`:
```bash
cp .env.example .env.test.docker
```

Edit `.env.test.local` or `.env.test.docker`:

```env
DOCKER=false
NODE_ENV=test
DATABASE_URL="postgresql://postgres:password@localhost:5432/myapp_test"
REDIS_HOST=localhost
REDIS_PASSWORD=yourpassword
```

### Jalankan Test (Lokal)

```bash
# Migration database test
npm run prisma:migrate:test

# Seed data test (opsional)
npm run prisma:seed:test

# Jalankan semua test
npm run test

# Jalankan test file tertentu
npm run test -- test/auth.login.test.ts
```

### Jalankan Test (Docker)

```bash
# Jalankan semua service test (otomatis migrate + seed + test + stop)
npm run test:docker:up

# Hapus container test + volume
npm run test:docker:down:volume
```

### Menulis Test

Buat file test di folder `test/` dengan format `*.test.ts` atau `*.spec.ts`:

```typescript
// test/auth.register.test.ts
import supertest from "supertest"
import * as server from "../src/infrastructure/server"
import { logger } from "../src/infrastructure/logging"

describe('POST /api/auth/register', () => {
    it('should reject if request is invalid', async () => {
        const res = await supertest(server.webApp)
            .post("/api/auth/register")
            .send({
                email: "",
                password: ""
            })

        logger.debug(res.body)
        expect(res.status).toBe(400)
        expect(res.body.errors).toBeDefined()
    })

    it('should register successfully', async () => {
        const res = await supertest(server.webApp)
            .post("/api/auth/register")
            .send({
                email: "test@example.com",
                password: "password123"
            })

        expect(res.status).toBe(201)
        expect(res.body.success).toBe(true)
    })
})
```

---

## API Endpoints

### Base URL

```
http://localhost:3000
```

### Health Check

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/` | Main route |
| `GET` | `/ping` | Health check → response `pong!` |

### Auth (Contoh)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Registrasi user baru |

### Response Format

**Success:**
```json
{
  "success": true,
  "message": "register success",
  "data": { ... }
}
```

**Error Validasi (400):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    { "path": "email", "message": "Invalid email" },
    { "path": "password", "message": "Too small: expected string to have >=8 characters" }
  ]
}
```

**Error Umum (4xx/5xx):**
```json
{
  "success": false,
  "message": "Forbidden",
  "errors": "Email already exists"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "message": "",
  "data": [ ... ],
  "paging": {
    "currentPage": 1,
    "totalPage": 5,
    "totalElement": 50,
    "size": 10,
    "nextPage": true,
    "previousPage": false,
    "firstPage": true,
    "lastPage": false
  }
}
```

---

## Fitur Keamanan

Template ini sudah dilengkapi berbagai layer keamanan sesuai standar **OWASP**.

### 1. Helmet

Mengatur HTTP security headers secara otomatis:
- `X-Content-Type-Options` — mencegah MIME sniffing
- `X-Frame-Options` — mencegah clickjacking
- `Strict-Transport-Security` — paksa HTTPS (production)
- `Content-Security-Policy` — batasi sumber konten (production)

### 2. CORS

Konfigurasi di `security.middleware.ts`:
- Development/Test: semua origin diizinkan
- Production: hanya origin yang ada di `CORS_ORIGIN`

### 3. Rate Limiting

Menggunakan `rate-limiter-flexible` dengan Redis:

| Limiter | Limit | Window | Key |
|---|---|---|---|
| Public | 100 req | 15 menit | per IP |
| Auth | 10 req | 15 menit | per IP |
| Private | 200 req | 15 menit | per userId |

```typescript
// Cara pakai di route
import { publicRateLimit, authRateLimit, privateRateLimit } from '../middleware/security.middleware'

router.post('/auth/login', authRateLimit, controller.login)
router.get('/profile', privateRateLimit, authMiddleware, controller.profile)
```

### 4. XSS Protection

Semua input di `req.body` dan `req.query` otomatis di-sanitize menggunakan library `xss`.

### 5. HPP (HTTP Parameter Pollution)

Mencegah serangan dengan mengirim parameter duplikat:

```
# Contoh serangan HPP
GET /api/users?role=user&role=admin
```

### 6. CSRF Protection

Tersedia middleware CSRF, aktif di production untuk request yang tidak menggunakan Bearer token.

### 7. Request Logging format

Setiap request di-log dengan `requestId` unik untuk tracing:

```json
{
  "type": "http:request",
  "requestId": "uuid-v4",
  "method": "POST",
  "url": "/api/auth/register",
  "statusCode": 201,
  "duration": "45ms",
  "ip": "127.0.0.1",
  "userId": "anonymous"
}
```

---

## Database

### Menggunakan PostgreSQL (default)

Schema sudah dikonfigurasi di `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
}
```

### Beralih ke MySQL/MariaDB

1. Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "mysql"
}
```

2. Edit `DATABASE_URL` di `.env`:

```env
DATABASE_URL="mysql://user:password@localhost:3306/database_name"
```

3. Ganti client di `src/modules/*/[module].prisma.ts`:

```typescript
// Dari:
import { prismaClientPg } from '../../infrastructure/database/prisma-pg.service'
// Ke:
import { prismaClientMysql } from '../../infrastructure/database/prisma-mysql.service'

dan ubah isi `/src/infrastructure/index.database`
```

### Prisma Commands Lengkap

```bash
# Development
npm run prisma:migrate:dev          # Buat & jalankan migration baru
npm run prisma:generate:dev         # Generate Prisma client
npm run prisma:seed:dev             # Seed database
npm run prisma:studio:dev           # Buka Prisma Studio (GUI)

# Docker Development
npm run prisma:migrate:dev:docker
npm run prisma:generate:dev:docker
npm run prisma:seed:dev:docker
npm run prisma:studio:dev:docker

# Test
npm run prisma:migrate:test         # Deploy migration ke DB test

# Production
npm run prisma:migrate:prod         # Deploy migration ke DB production
npm run prisma:seed:prod            # Seed production
```

---

## Redis

Redis digunakan untuk:
- **Rate limiting** — menyimpan counter request per IP/userId
- **Session / Cache** — bisa digunakan untuk menyimpan data sementara

### Konfigurasi Redis

File konfigurasi ada di `/redis.conf`. Beberapa setting penting:

```conf
bind 0.0.0.0          # Bind ke semua interface (docker)
protected-mode no      # Nonaktifkan protected mode (pakai password)
port 6379
databases 4            # Tersedia 4 database (index 0-3)
save ""                # Nonaktifkan RDB persistence (untuk cache saja)
```

### Redis Database Index

Disarankan gunakan SATU database (biasanya DB 0):

| Index | Kegunaan |
|-------|----------|
| `0`   | Rate limiting, cache, queue, Session / Auth token |

Pakai prefix untuk pemisahan :

```
${APP_NAME}:rl:ip:192.168.1.1
sess:user:123
cache:product:1
queue:email
```
---

## Logging

Menggunakan **Winston** dengan format JSON.

anda bisa mengatur preferensi logging di `/src/infrastructure/logging/winston-logging.service`

### Log Levels

| Level | Kapan Digunakan |
|---|---|
| `error` | Error yang tidak tertangani, 5xx |
| `warn` | 4xx errors, rate limit, akses ditolak |
| `info` | Request sukses, startup info |
| `debug` | Query database, detail request (development only) | 

actifkan terlebih dahulu untuk `debug` di `/src/infrastructure/database/prisma-pg-service` jika menggunakan postgresql

### Log Output Format

Setiap error yang tertangani akan menghasilkan log dengan format berikut:

**Expected business error (4xx):**
```json
{
  "type": "security:access_denied",
  "requestId": "uuid",
  "method": "POST",
  "url": "/api/auth/register",
  "statusCode": 403,
  "reason": "Email already exists",
  "origin": "AuthService.register (src/modules/auth/auth.service.ts:18:15)"
}
```

**Unexpected error (5xx):**
```json
{
  "type": "error:unhandled",
  "requestId": "uuid",
  "method": "POST",
  "url": "/api/auth/register",
  "message": "Cannot read properties of undefined",
  "origin": "PrismaAuthRepository.create (src/modules/auth/auth.prisma.ts:42:8)",
  "stack": "TypeError: Cannot read...\n    at PrismaAuthRepository..."
}
```

Field `origin` menunjukkan lokasi spesifik di kode kamu tempat error terjadi, gunakan `/src/shared/utils/error.util` untuk mendapatkan origin,
format: `ClassName.methodName (path/to/file.ts:line:col)`.
Error middleware hanya menghasilkan **satu log entry per error** untuk menghindari duplicate log.

---

## Error Handling

untuk error handling menggunakan pattern throw + middleware, serta bisa menggunakan Domain-specific error classes

### HttpException

Gunakan `HttpException` untuk melempar error dari Service layer:

```typescript
import { HttpException } from '../../shared/http/exception-response.http'

// Di dalam service
if (existingUser) {
    throw new HttpException(403, "Email already exists")
}

if (!user) {
    throw new HttpException(404, "User not found")
}
```

Atau juga bisa menggunakan Domain-specific error classes:
```typescript
import { ForbiddenError, NotFoundError } from "../../shared/http/exception-response.http"

// Di dalam service
if (existingUser) {
    throw new ForbiddenError("Email already exists")
}

if (!user) {
    throw new NotFoundError("User not found")
}

```

### Status Code yang Tersedia

| Code | Message | Kapan Digunakan |
|---|---|---|
| `400` | Bad request | Input tidak valid |
| `401` | Unauthorized | Tidak ada token / token invalid |
| `403` | Forbidden | Tidak punya akses / resource sudah ada |
| `404` | Not found | Data tidak ditemukan |
| `409` | Conflict | Duplikasi data |
| `410` | Gone | Resource sudah dihapus permanen |
| `422` | Unprocessable entity | Data valid tapi tidak bisa diproses |
| `429` | Too many requests | Rate limit tercapai |
| `500` | Internal server error | Error tidak tertangani |

### Zod Validation Error

Error validasi Zod otomatis ditangani oleh `ErrorHandlerMiddleware` dan dikembalikan sebagai response `400` dengan detail field yang error.

---

## Validasi

Menggunakan **Zod** untuk validasi input. Schema ada di `src/shared/validation/`.

### Membuat Schema Baru

```typescript
// src/modules/auth/auth.validation.ts
import { ZodType, z } from "zod";

export class AuthValidation {
    static readonly REGISTER_SCHEMA = z.object({
        email: z
            .string()
            .email(),
        password: z
            .string()
            .min(8)
    })
}
```

### Cara Pakai di Service

```typescript
import { AuthValidation } from "./auth.validation"
import { Validation } from "../../shared/validation/validation"

constructor(
    private validationService: ValidationService,
) {}

async createUser(req: CreateUserDTO) {
    const validate = this.validationService.validate(AuthValidation.REGISTER_SCHEMA, req)
    // `validate` sudah type-safe dan tervalidasi
}
```

---

## Menambah Module Baru

Ikuti langkah berikut untuk menambah module baru, contoh module `Product`:

### 1. Buat file module

```
src/modules/product/
├── product.controller.ts
├── product.service.ts
├── prisma-product.Irepo.ts    ← interface
├── prisma-product.repo.ts     ← implementasi
├── product.dto.ts
└── product.routes.ts
└── product.validation.ts
```

### 2. Tambah model di Prisma schema

```prisma
// prisma/schema.prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  price       Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("products")
}
```

### 3. Buat migration dan generate

```bash
npm run prisma:migrate:dev
npm run prisma:generate:dev
```

### 4. Buat interface Repository

```typescript
// product.repository.ts
import { Product } from "../../generated/prisma/client"
import { CreateProductDTO } from "./product.dto"

export interface ProductRepository {
    findById(id: string): Promise<Product | null>
    findAll(): Promise<Product[]>
    create(data: CreateProductDTO): Promise<Product>
    update(id: string, data: Partial<CreateProductDTO>): Promise<Product>
    delete(id: string): Promise<void>
}
```

### 5. Implementasi Repository

```typescript
// product.prisma.ts
export class PrismaProductRepository implements ProductRepository {
    constructor(private prismaPgService: PrismaPgService) {}

    async findById(id: string) {
        return this.prismaPgService.client.user.findUnique({ where: { id } })
    }
    // ... implementasi lainnya
}
```

### 6. Buat Service

```typescript
// product.service.ts
export class ProductService {
    constructor(
        private productRepo: IProductRepository,
        private validationService: ValidationService,
        private logger: WinstonLoggerService,
    ) {}

    async getAll(): Promise<Product[]> {
        return this.productRepo.findAll()
    }
}
```

### 7. Buat Controller

```typescript
// product.controller.ts
export class ProductController {
    constructor(private readonly productService: ProductService) {
        this.getAll = this.getAll.bind(this)
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const products = await this.productService.getAll()
            return success_handler(res, "success", products)
        } catch (e) {
            next(e)
        }
    }
}
```

### 8. Daftarkan Routes

```typescript
// product.routes.ts
const productRouter = Router()

const repo = new PrismaProductRepository(prismaPgService)
const validationService = new ValidationService()
const service = new ProductService(repo, validationService, winstonLogger)
const controller = new ProductController(service, winstonLogger)

productRouter.get('/', controller.getAll)
export { productRouter }
```

### 9. Mount ke Router Utama

```typescript
// src/shared/router/public.routes.ts atau private.routes.ts
import { productRouter } from '../../modules/product/product.routes'

publicRouter.use('/products', productRouter)
```

---

## Troubleshooting

### Database connection failed

```bash
# Cek apakah PostgreSQL berjalan
pg_isready -h localhost -U postgres

# Cek container
docker ps
docker logs postgres-dev
```

### Redis connection failed

```bash
# Test koneksi Redis
redis-cli -h localhost -p 6379 -a yourpassword ping
# Harus response: PONG

# Cek container
docker logs redis-dev
```

### Prisma generate error

```bash
# Hapus generated folder dan generate ulang
rm -rf src/generated/prisma
npm run prisma:generate:dev
```

### Port already in use

```bash
# Cari proses yang menggunakan port
lsof -i :3000
# Kill proses
kill -9 <PID>
```

### Jest test timeout

Tambahkan atau tingkatkan `testTimeout` di `package.json`:

```json
"jest": {
  "testTimeout": 30000
}
```

### Module not found setelah install package

```bash
npm install
# Jika pakai Docker:
docker compose -f docker-compose.dev.yml down
npm run dev:docker:up
```

### TypeScript error: Cannot find module `../../generated/prisma`

```bash
# Generate Prisma client terlebih dahulu
npm run prisma:generate:dev
```

---

## Scripts Lengkap

```bash
# Development
npm run dev                          # Jalankan dengan hot reload
npm run build                        # Compile TypeScript ke JavaScript
npm run start                        # Jalankan dari compiled JS (production)

# Testing
npm run test                         # Jalankan semua test
npm run test:docker:up               # Test dengan Docker
npm run test:docker:down:volume      # Hapus container test

# Docker Development
npm run dev:docker:up                # Build dan start semua service
npm run dev:docker:start             # Start container yang sudah ada
npm run dev:docker:stop              # Stop container
npm run dev:docker:down              # Hapus container
npm run dev:docker:down:volume       # Hapus container + volume

# Prisma
npm run prisma:migrate:dev           # Migration development
npm run prisma:generate:dev          # Generate client development
npm run prisma:seed:dev              # Seed development
npm run prisma:studio:dev            # Buka Prisma Studio
npm run prisma:migrate:test          # Migration test
npm run prisma:migrate:prod          # Migration production
npm run prisma:seed:prod             # Seed production
```

---

## Kontribusi

1. Fork repository
2. Buat branch baru: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m 'feat: tambah fitur X'`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat Pull Request

---

## License

ISC