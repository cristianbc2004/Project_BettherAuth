# Project BettherAuth

Aplicacion mobile en monorepo construida con Expo, React Native, Expo Router, NativeWind, Better Auth, Prisma y Bun. El proyecto esta orientado a una experiencia tipo dashboard financiero/mobile, con autenticacion, 2FA, gestion de tarjetas, Bizum, notificaciones, mapas y pantallas administrativas.

## Stack principal

- Expo managed workflow con Expo Router.
- React Native 0.83 y React 19.
- Bun como runtime/package manager.
- Better Auth para autenticacion, sesiones, email/password, verificacion de email y 2FA.
- Prisma 7 con PostgreSQL.
- Hono para la API backend.
- NativeWind y componentes compartidos para UI.
- i18n con `react-i18next`.
- Turbo para ejecutar tareas del monorepo.
- Pacalcase y Camelcase

## Estructura del monorepo

```txt
apps/
  api/       API Hono, rutas backend, auth, password, Bizum, mapas, targets y notificaciones
  mobile/    App Expo/React Native con Expo Router

packages/
  auth/      Configuracion compartida de Better Auth y permisos
  config/    Configuracion compartida de entorno/app
  database/  Prisma Client, schema y scripts de base de datos
  types/     Tipos compartidos entre apps y paquetes
```

Dentro de la app mobile:

```txt
apps/mobile/src/app/       Rutas y pantallas Expo Router
apps/mobile/src/features/  Modulos por dominio: auth, finance, ingresos, notifications
apps/mobile/src/shared/    Componentes y librerias transversales
```

## Requisitos

- Bun 1.3.x o superior.
- Node compatible con Expo tooling.
- PostgreSQL accesible desde `DATABASE_URL`.
- Expo CLI/dev client segun el flujo de ejecucion mobile.

## Configuracion inicial

1. Instala dependencias:

```bash
bun install
```

2. Crea el archivo de entorno:

```bash
cp .env.example .env
```

3. Ajusta las variables de entorno en `.env`.

Variables importantes:

- `DATABASE_URL`: conexion PostgreSQL.
- `BETTER_AUTH_SECRET`: secreto largo y seguro para Better Auth.
- `BETTER_AUTH_URL`: URL base del backend, normalmente `http://<ip-local>:3001`.
- `EXPO_PUBLIC_API_URL`: URL que consume la app mobile.
- `EXPO_PUBLIC_APP_SCHEME`: scheme de deep links, por defecto `better-auth-dashboard`.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: envio de emails.
- `EXPO_PUBLIC_STADIA_MAPS_API_KEY`: clave para mapas.

No uses credenciales reales en `.env.example` ni en commits.

## Scripts principales

Desde la raiz:

```bash
bun run dev
```

Levanta API y mobile dev client en paralelo.

```bash
bun run api:start
```

Levanta solo la API Hono.

```bash
bun run start
```

Levanta Expo desde `apps/mobile`.

```bash
bun run android
bun run ios
bun run web
```

Ejecuta la app mobile en Android, iOS o web.

```bash
bun run typecheck
```

Ejecuta TypeScript en todo el monorepo mediante Turbo.

## Base de datos

Generar Prisma Client:

```bash
bun run db:generate
```

Crear/aplicar migraciones locales:

```bash
bun run db:migrate
```

Abrir Prisma Studio:

```bash
bun run db:studio
```

El schema vive en:

```txt
packages/database/prisma/schema.prisma
```

## API

La API principal esta en `apps/api/src/index.ts` y expone:

- `GET /health`
- `/api/auth`
- `/api/bizum`
- `/api/maps`
- `/api/notifications`
- `/api/password`
- `/api/targets`

Por defecto escucha en `0.0.0.0:3001`, salvo que se definan `HOST` o `PORT`.

## App mobile

La app mobile esta en:

```txt
apps/mobile
```

Las rutas se organizan con Expo Router en:

```txt
apps/mobile/src/app
```

Algunas areas principales:

- `(auth)`: sign in, sign up, reset password, change password, verificacion de email y 2FA.
- `(tabs)`: home, dashboard, assets, cards y movements.
- `admin`: gestion administrativa de usuarios.
- `bizum`: envio y solicitud de Bizum.
- `notification`: notificaciones y pagos solicitados.
- `person` y `home-graphic`: pantallas de detalle/graficos.
- `targets`: alta y detalle de tarjetas.

## Convenciones de arquitectura

El proyecto sigue una separacion por responsabilidades:

- `app`: rutas, pantallas y composicion de flujos.
- `features`: logica y UI especifica de un dominio.
- `shared`: UI y utilidades reutilizables entre dominios.
- `packages`: configuracion, tipos, auth y base de datos compartidos.

Criterio recomendado:

- Mantener en las screens la orquestacion de UI, navegacion y estado local especifico.
- Mover a `features/*/lib` validaciones, transformaciones, hooks de flujo y helpers de dominio.
- Mover a `features/*/components` componentes reutilizables dentro de una feature.
- Mover a `shared` solo lo que sea transversal de verdad.
- Evitar crear abstracciones globales antes de que exista repeticion real.

## Validacion

Validacion minima antes de cerrar cambios:

```bash
bun run typecheck
```

Para cambios visuales o de navegacion, ademas conviene validar en Expo, simulador/emulador o dispositivo real.

Para cambios de autenticacion, revisar especialmente:

- sign in
- sign up
- verificacion de email
- reset password
- change password
- 2FA
- deep links

## Flujo de ramas

El flujo recomendado del proyecto es trabajar desde `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/<descripcion>
```

Antes de abrir PR:

```bash
bun run typecheck
```

Las PRs deben apuntar a `development`.

## Commits

Usar Conventional Commits:

- `feat`: nueva funcionalidad o pantalla.
- `fix`: correccion de bug.
- `style`: cambio visual sin impacto de logica.
- `refactor`: mejora interna sin cambio de comportamiento.
- `chore`: mantenimiento.
- `docs`: documentacion.

Ejemplo:

```bash
git commit -m "docs: add project readme"
```

