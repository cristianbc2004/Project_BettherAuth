# Guia base para proyectos Expo y React Native

## 1. Proposito del documento

Este documento sirve como base de referencia para iniciar nuevos proyectos mobile con Expo y React Native. La idea no es convertirlo en una regla absoluta, sino en una guia practica para tomar decisiones consistentes cuando se cree una nueva app, se estructure el repositorio o se le den instrucciones a un agente de IA.

Debe ayudar a responder preguntas como:

- Que tecnologias usamos por defecto.
- Como organizamos carpetas, rutas, componentes y logica compartida.
- Que principios de diseno e ingenieria conviene aplicar.
- Que debe incluir un `AGENTS.md` para que un agente trabaje bien dentro del proyecto.
- Que checklist seguir antes de considerar una feature terminada.

## 2. Stack recomendado

### Stack principal

| Tecnologia | Uso recomendado |
| --- | --- |
| Expo | Framework base para construir apps React Native de forma productiva. |
| React Native | Capa de interfaz mobile multiplataforma. |
| Expo Router | Navegacion basada en archivos y grupos de rutas. |
| NativeWind / Tailwind | Sistema de estilos basado en utilidades, ideal para consistencia visual. |
| Reanimated | Animaciones fluidas y gestos avanzados cuando la experiencia lo necesite. |
| Prisma | ORM para modelar y consultar la base de datos de forma tipada. |
| Better Auth | Autenticacion, sesiones, seguridad, 2FA y plugins de auth. |
| TypeScript | Tipado estatico para reducir errores y mejorar mantenibilidad. |

### Herramientas complementarias

| Herramienta | Uso recomendado |
| --- | --- |
| Neon | PostgreSQL gestionado y consola visual para revisar datos. |
| Resend | Envio de emails transaccionales: verificacion, reset de password, invitaciones, etc. |
| Turborepo | Recomendado en monorepos, especialmente si hay app mobile, web, paquetes compartidos o backend separado. |
| Bun | Gestor de paquetes y runtime de desarrollo cuando el proyecto lo adopte. |
| EAS | Builds, distribucion, actualizaciones y despliegues del ecosistema Expo. |

### Criterio importante

No todas las herramientas deben instalarse siempre. Una app simple puede empezar con Expo, Expo Router, NativeWind y TypeScript. Prisma, Better Auth, Neon, Resend o Turborepo se anaden cuando el producto lo justifica.

## 3. Convenciones de nombres

| Elemento | Convencion | Ejemplo |
| --- | --- | --- |
| Variables y atributos | `camelCase` | `userName`, `isLoading`, `orderId` |
| Componentes React | `PascalCase` | `LoginForm`, `ProfileCard` |
| Archivos | `kebab-case` | `login-form.tsx`, `user-profile.tsx` |
| Carpetas de feature | `kebab-case` | `user-profile`, `password-reset` |
| Rutas dinamicas | Expo Router | `[order-id].tsx`, `[user-id].tsx` |
| Constantes globales | `SCREAMING_SNAKE_CASE` si aplica | `MAX_RETRY_COUNT` |

La consistencia vale mas que la preferencia personal. Si un proyecto ya tiene una convencion estable, se mantiene.

## 4. Estructura de carpetas recomendada

La estructura ideal depende del tamano del proyecto. Para apps pequenas o medianas conviene evitar una arquitectura excesiva. Para apps con varias areas de negocio, el enfoque por features ayuda a mantener el orden.

### Opcion A: estructura simple

Recomendada para MVPs, apps pequenas o proyectos donde todavia no hay muchas features independientes.

```txt
src/
├─ app/
│  ├─ _layout.tsx
│  ├─ index.tsx
│  ├─ (auth)/
│  │  ├─ login.tsx
│  │  └─ register.tsx
│  └─ (tabs)/
│     ├─ _layout.tsx
│     ├─ home.tsx
│     ├─ profile.tsx
│     └─ settings.tsx
│
├─ components/
│  ├─ ui/
│  │  ├─ app-button.tsx
│  │  └─ app-input.tsx
│  └─ auth/
│     └─ login-form.tsx
│
├─ lib/
│  ├─ app-config.ts
│  ├─ auth-client.ts
│  ├─ env.ts
│  └─ utils.ts
│
└─ hooks/
   └─ use-session.ts
```

### Opcion B: estructura mixta por features

Recomendada cuando el proyecto empieza a tener dominios claros, por ejemplo autenticacion, pedidos, perfil, administracion, pagos o equipos.

```txt
src/
├─ app/
│  ├─ _layout.tsx
│  ├─ index.tsx
│  ├─ (auth)/
│  │  ├─ login.tsx
│  │  └─ register.tsx
│  ├─ (tabs)/
│  │  ├─ _layout.tsx
│  │  ├─ home.tsx
│  │  ├─ user-profile.tsx
│  │  └─ settings.tsx
│  └─ orders/
│     ├─ index.tsx
│     └─ [order-id].tsx
│
├─ features/
│  ├─ auth/
│  │  ├─ components/
│  │  │  └─ login-form.tsx
│  │  ├─ hooks/
│  │  │  └─ use-auth.ts
│  │  ├─ api/
│  │  │  └─ auth-api.ts
│  │  └─ screens/
│  │     ├─ login-screen.tsx
│  │     └─ register-screen.tsx
│  │
│  ├─ user-profile/
│  │  ├─ components/
│  │  │  └─ profile-card.tsx
│  │  ├─ hooks/
│  │  │  └─ use-user-profile.ts
│  │  ├─ api/
│  │  │  └─ user-profile-api.ts
│  │  └─ screens/
│  │     └─ user-profile-screen.tsx
│  │
│  └─ orders/
│     ├─ components/
│     ├─ hooks/
│     ├─ api/
│     └─ screens/
│        ├─ orders-screen.tsx
│        └─ order-detail-screen.tsx
│
└─ shared/
   ├─ components/
   │  └─ ui/
   │     ├─ app-button.tsx
   │     └─ app-input.tsx
   ├─ lib/
   │  ├─ env.ts
   │  └─ utils.ts
   └─ services/
      ├─ api-client.ts
      └─ secure-storage.ts
```

### Regla practica

- `src/app`: rutas, layouts, navegacion y composicion de pantallas.
- `features`: codigo especifico de un dominio funcional.
- `shared/components`: UI reutilizable entre varias features.
- `shared/lib` o `src/lib`: configuracion, helpers, integraciones y logica no visual.
- `shared/services`: clientes de API, almacenamiento seguro, notificaciones, analitica u otros servicios compartidos.

Las rutas no deberian contener demasiada logica. Una ruta debe componer pantalla, estado y navegacion. Si la logica crece, se extrae a hooks, servicios o una feature.

## 5. Principios de ingenieria que aplicaremos

### Principios principales

| Principio | Como aplicarlo en proyectos reales |
| --- | --- |
| Modularidad | Separar la app en piezas claras: rutas, componentes, hooks, servicios y dominio. |
| Mantenibilidad | Escribir codigo que se pueda entender dentro de seis meses sin rehacerlo todo. |
| Abstraccion | Ocultar complejidad detras de APIs simples, sin crear capas innecesarias. |
| DRY | Evitar duplicar conocimiento importante: validaciones, llamadas API, estilos compartidos, permisos. |
| YAGNI | No construir soporte para casos futuros que todavia no existen. |
| SoC | Separar responsabilidades: UI, datos, autenticacion, permisos, navegacion, persistencia. |
| KISS | Preferir soluciones simples, legibles y faciles de probar. |

### SOLID con criterio

SOLID nace de la programacion orientada a objetos, asi que no se aplica de forma literal a cada pantalla React. Aun asi, algunos principios son utiles:

- Single Responsibility: un componente, hook o servicio debe tener una responsabilidad clara.
- Interface Segregation: es mejor exponer APIs pequenas y concretas que objetos gigantes.
- Dependency Inversion: depender de contratos o funciones pequenas facilita testear y cambiar implementaciones.

No hay que forzar patrones empresariales si el codigo queda peor. El objetivo es claridad, no arquitectura por arquitectura.

## 6. Reglas de UI y UX

Para mantener consistencia visual:

- Usar un sistema de espaciado basado en multiplos de 4 u 8.
- Reutilizar botones, inputs, cards, estados vacios, errores y loading states.
- Definir colores y tokens semanticos en vez de hardcodear valores por toda la app.
- Mantener jerarquia clara: titulo, descripcion, accion principal y acciones secundarias.
- Disenar estados interactivos: default, pressed, disabled, loading y error.
- Usar skeletons cuando una pantalla necesita cargar datos relevantes.
- Evitar pantallas vacias con solo un spinner si se puede mostrar estructura de carga.
- Cuidar accesibilidad: contraste, tamanos tactiles, labels, foco y textos comprensibles.
- Mantener el idioma del proyecto. Si la app esta en espanol, las nuevas copias deben seguir en espanol.

## 7. Datos, autenticacion y seguridad

### Prisma y base de datos

- Modelar entidades con nombres claros.
- Evitar migraciones mezcladas con cambios no relacionados.
- Generar el cliente Prisma despues de modificar el schema.
- Revisar que las migraciones sean coherentes antes de compartirlas.
- Mantener la logica de datos fuera de componentes visuales.

### Better Auth

- Centralizar configuracion de auth en `src/lib` o `shared/lib`.
- Mantener separados cliente, servidor, rutas API y UI.
- Validar los flujos completos: login, registro, logout, verificacion, reset de password y 2FA si aplica.
- Revisar URLs de app, deep links y variables de entorno.
- No duplicar permisos en UI y backend: la UI puede ocultar acciones, pero la seguridad debe estar en servidor.

### Variables de entorno

- Usar `.env.example` como contrato de configuracion.
- No subir secretos reales al repositorio.
- Validar variables obligatorias al arrancar la app o el backend.
- Separar configuracion publica y privada.

## 8. Monorepo y Turborepo

Usar monorepo cuando exista una razon clara:

- App mobile + web.
- Paquetes compartidos de UI, tipos, validaciones o clientes API.
- Backend separado dentro del mismo repositorio.
- Necesidad de pipelines coordinados.

Ejemplo:

```txt
apps/
├─ mobile/
├─ web/
└─ api/

packages/
├─ ui/
├─ config/
├─ database/
└─ shared-types/
```

Si solo hay una app mobile pequena, un monorepo puede ser mas coste que beneficio.

## 9. Skills para agentes de IA

Cuando se trabaje con agentes inteligentes, conviene instalar o crear skills para las tecnologias principales del proyecto:

- Expo y Expo Router.
- NativeWind o Tailwind.
- Better Auth.
- Prisma.
- Reanimated.
- EAS y despliegue.
- Testing y QA.

Las skills ayudan al agente a no improvisar y a respetar patrones correctos. Aun asi, deben complementarse con un buen `AGENTS.md`, porque cada proyecto tiene decisiones propias.

## 10. Plantilla recomendada de AGENTS.md

Un `AGENTS.md` deberia incluir como minimo:

```md
# AGENTS.md

## Project Overview
- Tipo de app y objetivo del producto.
- Stack principal.
- Direccion actual del trabajo.

## Core Stack
- Expo, React Native, Expo Router, NativeWind, Prisma, Better Auth, etc.

## Repository Map
- src/app: rutas y pantallas.
- src/components o src/shared/components: UI reutilizable.
- src/lib o src/shared/lib: configuracion y logica compartida.
- prisma: schema y migraciones.

## File And Folder Rules
- Donde crear rutas.
- Donde crear componentes.
- Donde crear hooks, servicios y helpers.
- Cuando extraer codigo y cuando mantenerlo local.

## Design Rules
- Sistema visual.
- Idioma.
- Tokens.
- Estados de carga, error y vacio.

## Development Commands
- Instalar dependencias.
- Arrancar proyecto.
- Typecheck.
- Tests.
- Generar Prisma.
- Migraciones.

## Testing And Validation
- Validaciones minimas antes de terminar.
- Flujos que deben revisarse manualmente.
- Reglas especiales para auth, pagos, permisos o datos.

## Git Workflow
- Rama base.
- Formato de ramas.
- Commits convencionales.
- PR target.
- Reglas de revision.

## What To Avoid
- Refactors no relacionados.
- Cambios grandes sin contexto.
- Mezclar features en una misma rama.
- Hardcodear tokens o secretos.
```

## 11. Ejemplos reales de organizacion entre archivos

Los siguientes ejemplos estan basados en la estructura real de este proyecto. La clave no es copiar exactamente el codigo, sino entender que responsabilidad tiene cada archivo y como se conectan entre ellos.

### Ejemplo 1: pantalla de login

Flujo de archivos:

```txt
src/app/(auth)/sign-in.tsx
        ↓ compone la pantalla
src/features/auth/components/auth-shell.tsx
        ↓ aporta layout visual, safe area, scroll, teclado y animacion
src/features/auth/components/auth-form.tsx
        ↓ maneja formulario, validacion, submit, error y navegacion
src/features/auth/services/auth-client.ts
        ↓ centraliza Better Auth client, SecureStore y plugins
src/shared/lib/app-config.ts
        ↓ define URLs, scheme y valores de entorno
src/shared/lib/locale.tsx
        ↓ envia idioma actual al backend con Accept-Language
```

La ruta no contiene la logica de auth. Solo decide que pantalla se monta y con que modo.

```tsx
// src/app/(auth)/sign-in.tsx
import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthShell } from "@/features/auth/components/auth-shell";

export default function SignInScreen() {
  return (
    <AuthShell
      eyebrow=""
      subtitle="Access your account to manage settings and continue your secure flow."
      title="Sign In To Your Account."
    >
      <AuthForm mode="signIn" />
    </AuthShell>
  );
}
```

El shell visual resuelve preocupaciones de UI que no deberian repetirse en cada pantalla de auth: safe area, teclado, scroll, background, animacion y contenedor.

```tsx
// src/features/auth/components/auth-shell.tsx
export function AuthShell({ children, title, subtitle, eyebrow }: AuthShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-midnight-950">
      <KeyboardAvoidingView className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled">
          <Animated.View>
            <AuthBrandMark />
            <Text>{title}</Text>
            <Text>{subtitle || eyebrow}</Text>
          </Animated.View>

          <Animated.View>{children}</Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

El formulario se encarga de validacion, estados y submit. Usa componentes reutilizables (`AuthInput`, `AuthPasswordInput`, `AuthSubmitButton`) y llama al cliente de auth. Tambien envia el idioma actual al backend.

```tsx
// src/features/auth/components/auth-form.tsx
function SignInForm() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const signInSchema = z.object({
    email: z.email(t("authForm.invalidEmail")),
    password: z.string().min(8, t("authForm.minPassword")),
  });

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    setIsPending(true);

    const response = await authClient.signIn.email({
      ...values,
      ...buildAuthFetchOptions(locale),
    });

    if (response.error) {
      setServerError(response.error.message ?? t("authForm.genericError"));
      return;
    }

    router.replace("/dashboard");
  });

  return (
    <AuthFormFrame serverError={serverError} ctaHref="/sign-up" ctaLabel={t("authForm.createOne")}>
      {/* Controllers + inputs reutilizables */}
      <AuthSubmitButton isPending={isPending} label="Get Started" onPress={() => void handleSubmit()} />
    </AuthFormFrame>
  );
}
```

Aprendizaje principal:

- La ruta no deberia saber como funciona Better Auth.
- El shell no deberia saber como se valida un email.
- El formulario no deberia construir URLs a mano.
- El cliente de auth no deberia tener UI.
- La config y el idioma viven en `shared/lib` porque afectan a varias partes de la app.

### Ejemplo 2: cliente de Better Auth en mobile

El cliente de auth es una capa compartida de la feature `auth`. Cualquier pantalla o componente que necesite sesion, login, logout, 2FA o admin usa este archivo.

```tsx
// src/features/auth/services/auth-client.ts
import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import { twoFactorClient, adminClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";

import { ac, adminRole, userRole } from "@/features/auth/services/permissions";
import { appConfig } from "@/shared/lib/app-config";

export const authClient = createAuthClient({
  baseURL: appConfig.authApiUrl,
  plugins: [
    expoClient({
      scheme: appConfig.appScheme,
      storagePrefix: "better-auth-dashboard",
      storage: SecureStore,
    }),
    twoFactorClient(),
    adminClient({
      ac,
      roles: {
        admin: adminRole,
        user: userRole,
      },
    }),
  ],
});
```

Este archivo es buen ejemplo de `SoC`:

- `auth-client.ts` sabe como hablar con Better Auth desde la app.
- `app-config.ts` sabe de variables de entorno y URLs.
- `permissions.ts` sabe de roles y permisos.
- Las pantallas solo consumen `authClient`.

### Ejemplo 3: configuracion centralizada

La configuracion de URLs y deep links se centraliza para no repetir strings sensibles en pantallas, servicios y API routes.

```ts
// src/shared/lib/app-config.ts
const stripAuthPath = (value: string) => value.replace(/\/api\/auth\/?$/, "");

export const appConfig = {
  appName: "Better Auth Dashboard",
  appScheme: process.env.EXPO_PUBLIC_APP_SCHEME ?? "better-auth-dashboard",
  authApiUrl: stripAuthPath(process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8081"),
  authServerUrl: process.env.BETTER_AUTH_URL ?? "http://localhost:8081",
  emailVerificationSuccessUrl:
    process.env.EXPO_PUBLIC_EMAIL_VERIFICATION_URL ??
    `${process.env.EXPO_PUBLIC_APP_SCHEME ?? "better-auth-dashboard"}://dashboard`,
  resetPasswordUrl:
    process.env.EXPO_PUBLIC_RESET_PASSWORD_URL ??
    `${process.env.EXPO_PUBLIC_APP_SCHEME ?? "better-auth-dashboard"}://reset-password`,
} as const;
```

Cuando crees otro proyecto, intenta que cualquier dato de entorno o URL importante tenga una unica fuente de verdad. Esto evita errores como tener una URL correcta en login pero otra distinta en reset password.

### Ejemplo 4: idioma compartido entre UI y backend

El proyecto guarda el idioma en `SecureStore`, expone un provider global y construye headers para que Better Auth responda en el idioma correcto.

```tsx
// src/shared/lib/locale.tsx
export const supportedLocales = ["es", "en"] as const;
export type AppLocale = (typeof supportedLocales)[number];

export function buildLanguageHeaders(locale: AppLocale) {
  return {
    "Accept-Language": locale,
  } as const;
}

export function buildAuthFetchOptions(locale: AppLocale) {
  return {
    fetchOptions: {
      headers: buildLanguageHeaders(locale),
    },
  } as const;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider.");
  }

  return context;
}
```

El provider se monta arriba del todo en el layout raiz, por eso cualquier pantalla puede usar `useLanguage()`.

```tsx
// src/app/_layout.tsx
export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
        <LanguageToggle />
      </ThemeProvider>
    </LanguageProvider>
  );
}
```

Aprendizaje principal:

- Los providers globales van en el layout raiz.
- Los hooks compartidos deben fallar de forma clara si se usan fuera de su provider.
- Si el backend depende del idioma, no dupliques headers en cada submit: crea un helper.

### Ejemplo 5: API route fina con logica en services

La ruta API de Expo no implementa toda la autenticacion. Solo conecta el handler de Better Auth con los metodos HTTP.

```ts
// src/app/api/auth/[...auth]+api.ts
import { auth } from "@/features/auth/services/auth";

const handler = auth.handler;

export { handler as GET, handler as POST };
```

La configuracion real vive en el servicio de auth del servidor.

```ts
// src/features/auth/services/auth.ts
export const auth = betterAuth({
  appName: "Better Auth Dashboard",
  baseURL: appConfig.authServerUrl,
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  plugins: [
    expo(),
    i18n({ defaultLocale: "es", detection: ["header"] }),
    twoFactor({ issuer: "Better Auth Dashboard" }),
    admin({ ac, roles: { admin: adminRole, user: userRole }, adminRoles: ["admin"] }),
  ],
});
```

Este patron es muy importante:

- `src/app/api/...` define el endpoint.
- `features/auth/services/auth.ts` contiene la configuracion de Better Auth.
- `shared/lib/prisma.ts` crea el cliente de base de datos.
- `features/auth/services/email.ts` se ocupa del envio de correo.
- `features/auth/services/permissions.ts` se ocupa de roles y permisos.

### Ejemplo 6: Prisma como cliente compartido

El cliente Prisma se crea una vez y se reutiliza. En desarrollo se guarda en `globalThis` para evitar multiples conexiones por recargas.

```ts
// src/shared/lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaAdapter?: PrismaPg;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined.");
}

const adapter =
  globalForPrisma.prismaAdapter ??
  new PrismaPg({
    connectionString,
  });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
```

Aprendizaje principal:

- La base de datos no se instancia dentro de una pantalla.
- Los servicios del servidor importan `prisma` desde una unica fuente.
- Los errores de configuracion deben fallar pronto y con mensajes claros.

### Regla mental para nuevas funcionalidades

Cuando implementes una feature nueva, piensa en este recorrido:

```txt
Ruta en src/app
  ↓
Screen o composicion visual
  ↓
Componentes de feature
  ↓
Hooks de feature
  ↓
Servicios/API de feature
  ↓
Shared lib para configuracion, cliente API, auth, prisma, storage o helpers reutilizables
```

Ejemplo para una feature de pedidos:

```txt
src/app/orders/[order-id].tsx
src/features/orders/screens/order-detail-screen.tsx
src/features/orders/components/order-summary-card.tsx
src/features/orders/hooks/use-order-detail.ts
src/features/orders/api/orders-api.ts
src/shared/services/api-client.ts
```

Si un archivo empieza a mezclar demasiadas responsabilidades, probablemente toca extraer:

- UI repetida -> componente.
- Estado o side effects -> hook.
- Llamada a API -> service/api.
- Configuracion -> shared/lib.
- Tipos reutilizables -> shared/types o dentro de la feature si solo aplica alli.

## 12. Flujo de trabajo recomendado

1. Definir el alcance exacto de la feature o seccion.
2. Revisar archivos relacionados antes de editar.
3. Decidir la estructura: ruta, componente, hook, servicio o lib.
4. Implementar cambios pequenos y coherentes.
5. Ejecutar typecheck y tests disponibles.
6. Validar visualmente la pantalla o flujo real.
7. Revisar `git diff` antes de commitear.
8. Crear commit convencional.
9. Abrir PR contra la rama correcta.
10. Esperar revision antes de mezclar.

## 13. Checklist al empezar un proyecto

- [ ] Crear proyecto Expo con TypeScript.
- [ ] Configurar Expo Router.
- [ ] Definir estructura de carpetas inicial.
- [ ] Configurar NativeWind o sistema de estilos elegido.
- [ ] Crear componentes base: button, input, card, screen container, loading state.
- [ ] Configurar variables de entorno y `.env.example`.
- [ ] Configurar autenticacion si el producto la necesita.
- [ ] Configurar Prisma y base de datos si hay persistencia.
- [ ] Configurar i18n si la app tendra varios idiomas o copy centralizada.
- [ ] Crear `AGENTS.md`.
- [ ] Instalar skills relevantes para agentes de IA.
- [ ] Definir comandos de validacion.
- [ ] Crear flujo Git y rama base.

## 14. Checklist antes de cerrar una feature

- [ ] La feature cumple el alcance definido.
- [ ] No mezcla cambios no relacionados.
- [ ] No introduce duplicacion innecesaria.
- [ ] Los componentes tienen nombres claros.
- [ ] La logica compleja esta fuera de la ruta si corresponde.
- [ ] Los textos respetan el idioma del proyecto.
- [ ] Los estados de loading, error, empty y disabled estan cubiertos cuando aplica.
- [ ] Se ejecuto typecheck.
- [ ] Se probaron los flujos principales.
- [ ] Se reviso el diff completo.
- [ ] El commit usa formato convencional.
- [ ] El PR apunta a la rama correcta.

## 15. Criterio final

La mejor arquitectura no es la mas compleja, sino la que permite avanzar sin perder claridad. La base debe ayudar a construir rapido, entender rapido y cambiar rapido.

Usa este documento como punto de partida. Adaptalo al tamano del proyecto, al equipo, al producto y al momento real de la app.
