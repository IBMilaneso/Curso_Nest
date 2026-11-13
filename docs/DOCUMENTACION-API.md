# Documentación Técnica — API REST Taller Mecánico

> Documento validado contra el código de `src/`. Donde el documento de referencia (PDF "Documentación Técnica API Taller Mecánico") difiere del código, se describe lo que hace el código y la diferencia se lista en [Discrepancias detectadas](#discrepancias-detectadas).

## 1. Resumen general

API REST en **NestJS** con **TypeScript**, conectada a **SQL Server** mediante **TypeORM** (`type: 'mssql'`). Centraliza la gestión de un taller automotriz: clientes, vehículos y órdenes de servicio con su desglose de costos. El proyecto es ESM (`"type": "module"`): los imports relativos terminan en `.js`.

### Perfiles de usuario (`RolUsuario`)

| Rol | Valor | Alcance definido en `@Roles()` |
|---|---|---|
| Administrador | `administrador` | Acceso a todas las operaciones, incluido eliminar. |
| Recepción | `recepcion` | Crear/editar clientes y vehículos, crear órdenes, consultar todo. |
| Mecánico | `mecanico` | Consultar clientes, vehículos y órdenes; actualizar estatus de órdenes. |

> **Estado actual:** los decoradores `@Roles()` están declarados, pero los guards no se aplican (ver [sección 8](#8-consideraciones-de-seguridad-y-limitaciones-conocidas)). Los roles descritos son la intención del código, no una restricción activa.

## 2. Arquitectura

Módulos de dominio directamente bajo `src/`, una capa transversal `common/` y una capa `config/`.

```
src/
├── auth/            # Login y estrategia JWT
│   ├── dto/         # login.dto.ts (+ create-auth.dto.ts, update-auth.dto.ts sin uso)
│   ├── entities/    # usuario.entity.ts (+ auth.entity.ts sin uso)
│   ├── strategies/  # jwt.strategy.ts
│   ├── auth.controller.ts / auth.module.ts / auth.service.ts
├── clientes/        # dto/, entities/, exceptions/, controller, module, service
├── vehiculos/       # dto/, entities/, exceptions/, controller, module, service
├── ordenes/         # dto/, entities/ (orden, orden-detalle), exceptions/, controller, module, service
├── common/
│   ├── decorators/  # roles.decorator.ts
│   ├── enums/       # rol-usuario.enum.ts, estatus-orden.enum.ts
│   ├── filters/     # http-exception.filter.ts
│   ├── guards/      # jwt-auth.guard.ts, roles.guard.ts
│   ├── interceptors/# logging.interceptor.ts, transform-response.interceptor.ts
│   └── pipes/       # parse-id.pipe.ts
├── config/          # database.config.ts
├── app.controller.ts / app.service.ts   # plantilla de Nest, no registrados en AppModule
├── app.module.ts
└── main.ts
```

Cada módulo también incluye archivos `*.spec.ts` (Vitest).

### Relación entre módulos

- **AppModule**: `ConfigModule` (global, carga `database.config`), `TypeOrmModule.forRootAsync` (mssql, `autoLoadEntities: true`, `synchronize: false`) y, **actualmente, solo `ClientesModule`**.
- **AuthModule**: tabla `usuarios`; firma tokens JWT. Define `JwtModule.registerAsync` y `JwtStrategy`.
- **ClientesModule**: tabla `clientes`; exporta `ClientesService`.
- **VehiculosModule**: importa `ClientesModule` (valida `clienteId`); exporta `VehiculosService`.
- **OrdenesModule**: importa `VehiculosModule` (valida `vehiculoId`); gestiona `Orden` y `OrdenDetalle` con `cascade: true`. No exporta nada.

## 3. Configuración y ejecución

### Variables de entorno

Se cargan con `@nestjs/config`. Plantilla en `src/.env.example`.

| Variable | Uso en el código | Por defecto | Obligatoria |
|---|---|---|---|
| `PORT` | `main.ts` | `3000` | No |
| `NODE_ENV` | Presente en `.env.example`; **no se lee en `src/`** | — | No |
| `DB_HOST` | `database.config.ts` | — | Sí |
| `DB_PORT` | `database.config.ts` | `1433` | No |
| `DB_USERNAME` | `database.config.ts` | — | Sí |
| `DB_PASSWORD` | `database.config.ts` | — | Sí |
| `DB_NAME` | `database.config.ts` | — | Sí |
| `DB_ENCRYPT` | `=== 'true'` | `false` | No |
| `DB_TRUST_CERT` | `!== 'false'` | `true` | No |
| `JWT_SECRET` | `AuthModule` (sin respaldo) y `JwtStrategy` (respaldo `'secretKey'`) | — | Sí |
| `JWT_EXPIRES_IN` | `AuthModule` | `'1d'` | No |

### Comandos (`package.json`)

```bash
npm install
npm run start:dev     # desarrollo con recarga
npm run build         # compila (nest build)
npm run start:prod    # node dist/main
npm test              # Vitest
```

Prefijo global de rutas: **`/api`** (`app.setGlobalPrefix('api')`). CORS abierto (`app.enableCors()`).

## 4. Especificación de módulos

> Todas las respuestas exitosas se envuelven como `{ "data": ..., "message": "...", "status": <código> }` (ver sección 7).

### 4.1 Módulo `auth`

> **No registrado en `AppModule`**: hoy `POST /api/auth/login` no está expuesto. Registro de usuarios y CRUD de usuarios no existen.

**Entidad `Usuario`** — tabla `usuarios`

| Propiedad | Columna | Tipo | Notas |
|---|---|---|---|
| `id` | `id_usuario` | int | PK autoincremental |
| `correo` | `correo` | varchar(100) | Único |
| `passwordHash` | `passwordHash` | varchar(255) | Credencial |
| `rol` | `rol` | varchar(50) | Default `'recepcion'` |
| `activo` | `activo` | bit | Default `true` |

**DTO `LoginDto`**: `correo` (`@IsEmail`, `@IsNotEmpty`), `password` (`@IsString`, `@IsNotEmpty`). No hay DTO de salida; el servicio devuelve `{ accessToken }`.

**Endpoint**

| Método | Ruta | Roles | Éxito | Errores |
|---|---|---|---|---|
| POST | `/api/auth/login` | Público | 200 | 400 (validación), 401 `Credenciales inválidas` |

Petición:
```json
{ "correo": "recepcion@taller.com", "password": "MiPasswordSegura" }
```
Respuesta (200):
```json
{ "data": { "accessToken": "<token_jwt>" }, "message": "Autenticación exitosa", "status": 200 }
```

### 4.2 Módulo `clientes`

Padrón de clientes con unicidad de correo y RFC, normalización de texto y borrado lógico (`activo`).

**Entidad `Cliente`** — tabla `clientes`

| Propiedad | Columna | Tipo | Notas |
|---|---|---|---|
| `id` | `id_cliente` | int | PK autoincremental |
| `nombre` | `nombre` | varchar(150) | Obligatorio |
| `telefono` | `telefono` | varchar(20) | Obligatorio |
| `correo` | `correo` | varchar(100) | Único |
| `rfc` | `rfc` | varchar(13) | Único, admite NULL |
| `direccion` | `direccion` | varchar(255) | Admite NULL |
| `activo` | `activo` | bit | Default `true` |
| `fechaRegistro` | `fecha_registro` | datetime2 | `@CreateDateColumn` |
| `fechaActualizacion` | `fecha_actualizacion` | datetime2 | `@UpdateDateColumn` |
| `vehiculos` | — | relación | `@OneToMany` hacia `Vehiculo` |

**DTOs**
- `CreateClienteDto`: `nombre` (string, no vacío, 3–150, trim); `telefono` (`/^[0-9]{10,15}$/`, trim); `correo` (email, máx. 100, trim + minúsculas); `rfc` opcional (máx. 13, `/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/`, trim + mayúsculas); `direccion` opcional (máx. 255, trim).
- `UpdateClienteDto`: `PartialType(CreateClienteDto)` + `activo` opcional (`@IsBoolean`).
- `ClienteResponseDto` (`@Exclude` + `@Expose`): `id`, `nombre`, `telefono`, `correo`, `rfc`, `direccion`, `activo`, `fechaRegistro`.

**Endpoints** (`@Roles` según el código)

| Método | Ruta | Descripción | Roles | Éxito | Errores |
|---|---|---|---|---|---|
| POST | `/api/clientes` | Crea cliente; valida correo y RFC únicos | administrador, recepcion | 201 `Creado` | 400, 409 |
| GET | `/api/clientes` | Clientes con `activo = true`, orden `nombre` ASC | administrador, recepcion, mecanico | 200 `Obtenido` | — |
| GET | `/api/clientes/:id` | Detalle | administrador, recepcion, mecanico | 200 `Obtenido` | 400, 404 |
| PATCH | `/api/clientes/:id` | Actualización parcial; valida duplicados excluyendo el propio id | administrador, recepcion | 200 `Actualizado` | 400, 404, 409 |
| DELETE | `/api/clientes/:id` | Borrado lógico (`activo = false`) | administrador | 200 `Eliminado` (`data: null`) | 400, 404 |

Los códigos 401/403 aplican solo si se activan los guards.

### 4.3 Módulo `vehiculos`

> **No registrado en `AppModule`**: sus rutas no están expuestas actualmente.

**Entidad `Vehiculo`** — tabla `vehiculos`

| Propiedad | Columna | Tipo | Notas |
|---|---|---|---|
| `id` | `id_vehiculo` | int | PK autoincremental |
| `placa` | `placa` | varchar(20) | Único |
| `marca` | `marca` | varchar(50) | |
| `modelo` | `modelo` | varchar(50) | |
| `anio` | `anio` | int | |
| `color` | `color` | varchar(30) | Admite NULL |
| `clienteId` | `id_cliente` | int | FK a `clientes`, `ON DELETE RESTRICT` |
| `fechaRegistro` | `fecha_registro` | datetime2 | `@CreateDateColumn` |
| `fechaActualizacion` | `fecha_actualizacion` | datetime2 | `@UpdateDateColumn` |

Relaciones: `ManyToOne` a `Cliente`, `OneToMany` a `Orden`.

**DTOs**
- `CreateVehiculoDto`: `placa` (máx. 20, trim + mayúsculas), `marca` (máx. 50, trim), `modelo` (máx. 50, trim), `anio` (`@IsInt`, mín. 1900, máx. año actual + 1, calculado al cargar el módulo), `color` opcional (máx. 30, trim), `clienteId` (`@IsInt`).
- `UpdateVehiculoDto`: `PartialType(CreateVehiculoDto)`.
- `VehiculoResponseDto`: `id`, `placa`, `marca`, `modelo`, `anio`, `color`, `clienteId`, `cliente` (`ClienteResponseDto`).

**Endpoints**

| Método | Ruta | Descripción | Roles | Éxito | Errores |
|---|---|---|---|---|---|
| POST | `/api/vehiculos` | Crea; valida cliente existente y placa única | administrador, recepcion | 201 `Vehículo registrado exitosamente` | 400, 404 (cliente), 409 (placa) |
| GET | `/api/vehiculos` | Lista con `cliente` | administrador, recepcion, mecanico | 200 `Vehículos obtenidos` | — |
| GET | `/api/vehiculos/:id` | Detalle con `cliente` | administrador, recepcion, mecanico | 200 `Vehículo obtenido` | 400, 404 |
| PATCH | `/api/vehiculos/:id` | Actualiza; revalida cliente y placa | administrador, recepcion | 200 `Vehículo actualizado` | 400, 404, 409 |
| DELETE | `/api/vehiculos/:id` | Borrado **físico** | administrador | 200 `Vehículo eliminado` | 400, 404 |

### 4.4 Módulo `ordenes`

> **No registrado en `AppModule`**: sus rutas no están expuestas actualmente. Pendientes: partidas individuales sobre una orden existente y cancelación/eliminación de órdenes.

**Entidad `Orden`** — tabla `ordenes`

| Propiedad | Columna | Tipo | Notas |
|---|---|---|---|
| `id` | `id_orden` | int | PK autoincremental |
| `vehiculoId` | `id_vehiculo` | int | FK a `vehiculos`, `ON DELETE RESTRICT` |
| `estatus` | `estatus` | varchar(30) | Default `'pendiente'` |
| `total` | `total` | decimal(10,2) | Default `0` |
| `fechaIngreso` | `fecha_ingreso` | datetime2 | `@CreateDateColumn` |
| `fechaActualizacion` | `fecha_actualizacion` | datetime2 | `@UpdateDateColumn` |
| `detalles` | — | relación | `OneToMany` a `OrdenDetalle`, `cascade: true` |

**Entidad `OrdenDetalle`** — tabla `ordenes_detalles`

| Propiedad | Columna | Tipo | Notas |
|---|---|---|---|
| `id` | `id_detalle` | int | PK autoincremental |
| `ordenId` | `id_orden` | int | FK a `ordenes`, `ON DELETE CASCADE` |
| `descripcion` | `descripcion` | varchar(255) | |
| `costo` | `costo` | decimal(10,2) | |

**Enum `EstatusOrden`**: `pendiente`, `en_proceso`, `terminada`, `entregada`.

**DTOs**
- `CreateOrdenDto`: `vehiculoId` (`@IsInt`), `servicios` (`@IsArray`, `@ValidateNested({ each: true })`, `@Type(() => ServicioDto)`).
- `ServicioDto`: `descripcion` (string, no vacío), `costo` (`@IsNumber({ maxDecimalPlaces: 2 })`, `@Min(0)`).
- `UpdateOrdenDto`: `estatus` opcional (`@IsEnum(EstatusOrden)`).
- `OrdenResponseDto`: `id`, `estatus`, `total`, `fechaIngreso`, `vehiculo` (`VehiculoResponseDto`), `detalles` (`OrdenDetalleResponseDto[]`: `id`, `descripcion`, `costo`).

**Comportamiento**: al crear, se valida el vehículo, se suma `costo` de los servicios en `total`, se guarda la orden con sus detalles por cascada y se devuelve la orden recargada con relaciones.

**Endpoints**

| Método | Ruta | Descripción | Roles | Éxito | Errores |
|---|---|---|---|---|---|
| POST | `/api/ordenes` | Crea orden con detalles y total | administrador, recepcion | 201 `Orden generada` | 400, 404 (vehículo) |
| GET | `/api/ordenes` | Lista con vehículo y detalles, `fechaIngreso` DESC | administrador, recepcion, mecanico | 200 `Órdenes obtenidas` | — |
| GET | `/api/ordenes/:id` | Detalle | administrador, recepcion, mecanico | 200 `Orden obtenida` | 400, 404 |
| PATCH | `/api/ordenes/:id/estatus` | Cambia el estatus | administrador, mecanico | 200 `Estatus actualizado` | 400, 404 |

## 5. Autenticación y autorización

**Flujo JWT (según el código)**
1. `POST /api/auth/login` con `correo` y `password`.
2. `AuthService.login` busca un `Usuario` con ese `correo` y `activo = true`; compara `loginDto.password === usuario.passwordHash` (texto plano, ver sección 8).
3. Si coincide, firma un JWT con payload `{ sub, correo, rol }`.
4. Las rutas protegidas esperan `Authorization: Bearer <accessToken>`.
5. `JwtStrategy` valida firma y vigencia (`ignoreExpiration: false`) y deja `{ id, correo, rol }` en `request.user`.
6. `JwtAuthGuard` lanza `401 "No autorizado"` si hay error o no hay usuario.
7. `RolesGuard` lee `@Roles()` (método o clase); sin roles definidos permite el paso; si `request.user.rol` no está incluido lanza `403 "Permisos insuficientes"`.

**Matriz de permisos** (según `@Roles()` del código)

| Operación | administrador | recepcion | mecanico |
|---|---|---|---|
| Clientes: crear / editar | Sí | Sí | No |
| Clientes: consultar | Sí | Sí | Sí |
| Clientes: eliminar (lógico) | Sí | No | No |
| Vehículos: crear / editar | Sí | Sí | No |
| Vehículos: consultar | Sí | Sí | Sí |
| Vehículos: eliminar (físico) | Sí | No | No |
| Órdenes: crear | Sí | Sí | No |
| Órdenes: consultar | Sí | Sí | Sí |
| Órdenes: actualizar estatus | Sí | No | Sí |

## 6. Manejo de errores

`GlobalExceptionFilter` captura todas las excepciones y responde:

```json
{ "data": null, "message": "Descripción o arreglo de errores de validación", "status": 404 }
```

Una excepción no HTTP se registra con su stack y responde `500` con `"Error interno"`.

| Excepción | Módulo | HTTP | Mensaje |
|---|---|---|---|
| `ClienteNoEncontradoException` | clientes | 404 | `Cliente con id {id} no encontrado` |
| `ClienteDuplicadoException` | clientes | 409 | `Cliente duplicado por {campo}` (`correo` o `RFC`) |
| `VehiculoNoEncontradoException` | vehiculos | 404 | `Vehículo con id {id} no encontrado` |
| `VehiculoDuplicadoException` | vehiculos | 409 | `Ya existe un vehículo registrado con la placa {placa}` |
| `OrdenNoEncontradaException` | ordenes | 404 | `Orden de servicio con id {id} no encontrada` |

## 7. Pipes, interceptores y filtros globales (`main.ts`)

- **ValidationPipe**: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`, `transformOptions.enableImplicitConversion: true`.
- **ParseIdPipe**: el parámetro `:id` debe ser entero > 0; si no, `400 "Identificador inválido"`.
- **LoggingInterceptor**: registra `MÉTODO URL código - Nms` cuando la petición termina con éxito (usa `tap`, por lo que no registra las que terminan en excepción).
- **TransformResponseInterceptor**: si el controlador devuelve `{ data, message }`, usa ambos y añade `status`; en otro caso devuelve `{ data: payload ?? null, message: 'OK', status }`.
- **GlobalExceptionFilter**: ver sección 6.

## 8. Consideraciones de seguridad y limitaciones conocidas

Verificadas en el código actual:

1. **`AppModule` solo importa `ClientesModule`.** `AuthModule`, `VehiculosModule` y `OrdenesModule` no están registrados, así que sus endpoints no existen en tiempo de ejecución.
2. **Guards comentados.** En `ClientesController`, `VehiculosController` y `OrdenesController`, `// @UseGuards(JwtAuthGuard, RolesGuard)` está comentado. No hay guards globales; los `@Roles()` no tienen efecto.
3. **Contraseñas en texto plano.** `bcrypt.compare` está comentado en `AuthService.login`; se compara `loginDto.password === usuario.passwordHash`. `bcrypt` no figura en `package.json`.
4. **Secreto JWT inconsistente.** `JwtStrategy` usa `'secretKey'` si falta `JWT_SECRET`, mientras `AuthModule` firma con `JWT_SECRET` sin respaldo: sin la variable, firma y verificación no coincidirían.
5. **Sin registro de usuarios** ni cifrado de contraseñas al crearlos.
6. **`synchronize: false`.** Las tablas (`usuarios`, `clientes`, `vehiculos`, `ordenes`, `ordenes_detalles`) deben crearse con DDL o migraciones; no hay migraciones.
7. **CORS abierto** (`app.enableCors()` sin restricciones).
8. **Archivos de plantilla sin uso:** `app.controller.ts`, `app.service.ts`, `auth/dto/create-auth.dto.ts`, `auth/dto/update-auth.dto.ts`, `auth/entities/auth.entity.ts`.

## Discrepancias detectadas

Diferencias entre el documento de referencia (PDF) y el código de `src/`. En este documento prevalece el código.

| # | Documento de referencia | Código real |
|---|---|---|
| 1 | Los endpoints de `auth`, `vehiculos` y `ordenes` se describen como disponibles bajo `/api`. Solo menciona en la sección 8 que debe verificarse el registro en `AppModule`. | `AppModule` importa únicamente `ClientesModule` (`src/app.module.ts`). Las rutas de los otros tres módulos no están expuestas. |
| 2 | §8.7: la propiedad `@OneToMany` en `Cliente` está pendiente. | `Cliente.vehiculos` ya existe (`@OneToMany(() => Vehiculo, (vehiculo) => vehiculo.cliente)`, importada con `.js`). Se agregó durante la corrección de errores de compilación. |
| 3 | `JWT_EXPIRES_IN` sin valor por defecto y obligatoria. | `AuthModule` usa `?? '1d'`: tiene respaldo y no es estrictamente obligatoria. |
| 4 | `.env.example` en la raíz del proyecto; `.env` local. | `.env.example` está en `src/.env.example`. No hay `.env` en la raíz. |
| 5 | `NODE_ENV` listada como variable de configuración del entorno. | Ninguna parte de `src/` lee `NODE_ENV`; solo aparece en `.env.example`. |
| 6 | Estructura de `auth/dto/` con `LoginDto` y `auth/entities/` con `Usuario`. | Además existen `create-auth.dto.ts`, `update-auth.dto.ts` y `auth.entity.ts` sin uso. |
| 7 | La estructura de `src/` no menciona `app.controller.ts` ni `app.service.ts`. | Existen en `src/`, pero no están registrados en `AppModule`. |
| 8 | `JwtStrategy` usa `'secretKey'` como respaldo (documentado). Se presenta solo como riesgo de producción. | Además `AuthModule` firma con `JWT_SECRET` sin respaldo, por lo que sin la variable firma y verificación usan secretos distintos. |
| 9 | `LoggingInterceptor` registra "cada petición HTTP entrante". | Solo registra las que terminan con éxito (`tap` sobre `next.handle()`); las que lanzan excepción no pasan por ese log. |
| 10 | Las rutas, `@Roles()`, DTOs, nombres de tablas y columnas, mensajes de excepción y el comportamiento del filtro, de los pipes y de los interceptores. | Coinciden con el código; no se encontraron otras diferencias. |
