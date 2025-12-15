# Progression App

Aplicación web de seguimiento y progreso personal, desarrollada con Angular 20 y Firebase. La aplicación permite a cada usuario autenticado gestionar sus propias personas y grupos, asociarles items (hábitos, actividades, indicadores, etc.) y registrar eventos sobre esos items, generando estadísticas y gráficos de evolución.

## Descripción general

El objetivo de la aplicación es proporcionar una herramienta sencilla pero estructurada para registrar información periódica (por ejemplo, hábitos, rutinas o indicadores) y visualizar su evolución en el tiempo mediante gráficas interactivas. Así profesionales de la enseñanza, la psicología o incluso personas individuales pueden hacer seguimiento de los items que consideren. Cada usuario dispone de su propio espacio de datos, aislado del resto, gracias al diseño multi‑tenant sobre Firestore.

## Manual de usuario

[Manual de Usuario](./manual_usuario.md)

[DeepWiki Documentación técnica ampliada] (https://deepwiki.com/mermc/AppProgression)
---

## Stack tecnológico

- **Framework**: Angular 20 (standalone components, `ApplicationConfig`).
- **UI**: Angular Material (tema Material 3 + estilos SCSS personalizados).
- **Backend as a Service**: Firebase:
  - Firebase Hosting (despliegue de la SPA).
  - Firebase Authentication (email/contraseña).
  - Firestore Database (modelo de datos principal).
- **Gráficos y visualización**:
  - Chart.js para gráficos de barras y líneas.
  - html2canvas para exportar las gráficas a imagen JPEG.
- **Lógica reactiva**:
  - RxJS para la gestión de streams de datos (estado de autenticación, colecciones de Firestore).
- **SSR (preparado)**:
  - Angular SSR (`@angular/ssr`), con configuración de `app.config.server.ts` y scripts `build:ssr` / `serve:ssr`.

---

## Arquitectura y organización

La aplicación sigue una estructura por **features** y apuesta por componentes standalone:

- `src/app/app.config.ts` y `app.config.server.ts`  
  Configuración global de la aplicación:
  - Router (`provideRouter(routes)`).
  - Firebase (Auth y Firestore).
  - LOCALE_ID `es-ES`.
  - Hidratación en cliente y SSR.
  - Angular Material y módulos compartidos.

- `src/app/app.routes.ts`  
  Definición de rutas principales:
  - `/login`, `/register`.
  - `/dashboard` y rutas hijas:
    - `/dashboard/nuevo`
    - `/dashboard/detalle/:tipo/:id`
    - `/dashboard/detalle/:tipo/:id/items`
    - `/dashboard/detalle/:tipo/:id/items/nuevo`
    - `/dashboard/detalle/:tipo/:id/items/:itemId`
    - `/dashboard/detalle/:tipo/:id/items/:itemId/registros`
    - `/dashboard/detalle/:tipo/:id/items/:itemId/registros/nuevo`
    - `/dashboard/detalle/:tipo/:id/items/:itemId/registros/estadisticas`
    - `/dashboard/perfil`

- `src/app/core`  
  - `guards/auth.guard.ts`: protege las rutas que requieren usuario autenticado, usando `authState` y redirecciones a `/login`.
  - `services/auth.service.ts`: encapsula autenticación con Firebase Auth (login, registro, logout, stream de usuario y utilidades).
  - `services/firestore.service.ts`: creación de perfil de usuario en la colección `usuarios`.

- `src/app/features/auth`  
  - `components/login/login.ts`: pantalla de login.
  - `components/register/register.ts`: pantalla de registro.

- `src/app/features/dashboard`  
  - `dashboard.ts`: vista principal de datos (personas/grupos).
  - `perfil/perfil.ts`: pantalla de perfil de usuario.
  - `component/nuevo/nuevo.ts`: alta/edición de personas y grupos.
  - `component/detalle/detalle.ts`: detalle y edición de una persona/grupo, acceso a items.
  - `component/detalle/item/item.ts`: alta/edición de items.
  - `component/detalle/item-list/item-list.ts`: listado de items.
  - `component/detalle/item/registro-list/registro-list.ts`: listado de registros.
  - `component/detalle/item/registro-form/registro-form.ts`: alta/edición de registros.
  - `component/detalle/item/registro-stats/registro-stats.ts`: estadísticas y gráficas de registros.

A nivel de diseño visual, se usan estilos globales en `src/styles`:

- `_vars.scss`: variables de marca (paleta, superficies, sombras, etc.).
- `_layout.scss`: layout global (header sticky, footer fijo, estructura responsive).
- `_buttons.scss`: estilos de botones reutilizables.
- `custom-theme.scss`: tema Material 3 generado con `mat.theme`.
- `styles.scss`: punto de entrada global que importa el tema y las utilidades.

---

## Modelo de datos en Firestore

El backend de datos se basa íntegramente en **Firestore Database**, con un diseño multi‑tenant: cada documento de alto nivel guarda el `userId` del propietario, de forma que la aplicación solo consulta y modifica datos del usuario autenticado.

### Colecciones principales

- `usuarios/{uid}`  
  Documento de perfil de usuario.

  Campos típicos:
  - `uid`: string (ID de usuario de Firebase Auth).
  - `email`: string.
  - `nombre`: string.
  - `apellidos`: string.
  - `createdAt`: Date / Timestamp.
  - `lastSignInTime`: Date / Timestamp.

- `personas/{personaId}`  
  Representa una persona creada y asociada al usuario.

  Campos típicos:
  - `nombre`: string.
  - `apellidos`: string.
  - `observaciones`: string.
  - `userId`: string (UID del propietario).

- `grupos/{grupoId}`  
  Representa un grupo (por ejemplo, equipo, familia, etc.) creado y asociado al usuario.

  Campos típicos:
  - `nombre`: string.
  - `observaciones`: string.
  - `userId`: string (UID del propietario).

### Subcolecciones

- `personas/{personaId}/items/{itemId}`  
- `grupos/{grupoId}/items/{itemId}`  

Cada **item** define un “indicador” o categoría de seguimiento para la persona/grupo:

- `descripcion`: string.  
- `color`: string (color asociado al item para gráficos).  
- `fecha`: Date / Timestamp (fecha de referencia).  
- `createdAt`: Timestamp (servidor).  
- `updatedAt`: Timestamp (servidor).  

- `.../items/{itemId}/registros/{registroId}`  

Cada **registro** es un evento asociado a un item:

- `fecha`: Date / Timestamp.  
- `observaciones`: string.  
- `createdAt`: Timestamp (servidor).  

### Notas sobre multi‑tenant

- Las colecciones `personas` y `grupos` almacenan el campo `userId`, que corresponde al UID de Firebase Auth.
- El dashboard filtra siempre por ese `userId`, de forma que cada usuario solo puede ver y gestionar sus propios documentos, incluso compartiendo la misma colección.

---

## Flujo de autenticación

La autenticación se implementa con **Firebase Authentication** (email/contraseña) y se encapsula en `AuthService`.

### Funcionalidades

- **Registro** (`RegisterComponent`):
  - Crea el usuario en Firebase Auth (`createUserWithEmailAndPassword`).
  - Guarda los datos extra (nombre, apellidos) en Firestore (`usuarios/{uid}`) usando `FirestoreService.createUserProfile`.
  - Envía un correo de verificación (`sendEmailVerification`).
  - Redirige a `/login`.

- **Login** (`LoginComponent`):
  - Autenticación con email y contraseña.
  - Comprueba `user.emailVerified`:
    - Si está verificado, redirige a `/dashboard`.
    - Si no, muestra un mensaje e incluye opción de reenviar email de verificación.
  - Permite solicitar restablecimiento de contraseña (`sendPasswordResetEmail`).

- **Logout**:
  - Ejecutado desde el header (`Header`).
  - Llama a `authService.logout()` y redirige a `/login`.

- **Guard de rutas** (`auth.guard.ts`):
  - Usa `authState(auth)` y `take(1)` para esperar al estado actual.
  - Si no hay usuario autenticado, redirige a `/login`.
  - Protege todas las rutas bajo `/dashboard`.

---

## Features principales

### Dashboard: personas y grupos

Componente `Dashboard`:

- Muestra dos vistas:
  - Lista de **personas** del usuario.
  - Lista de **grupos** del usuario.
- Cada lista se alimenta con consultas Firestore filtradas por `userId`.
- Permite:
  - Alternar vista entre personas y grupos.
  - Crear un nuevo elemento (`/dashboard/nuevo`).
  - Ir al detalle (`/dashboard/detalle/:tipo/:id`).

### Alta y edición de personas / grupos

Componente `Nuevo`:

- Funciona en modo **creación** o **edición**:
  - En creación: se selecciona tipo (`persona` o `grupo`) y se rellenan campos.
  - En edición: se carga un documento existente (`personas` o `grupos`) y se parchea el formulario.
- Valida campos básicos (`nombre` requerido).
- Garantiza que cada documento nuevo lleva el `userId` del usuario autenticado.
- Permite guardar aunque falten apellidos/observaciones, previo diálogo de confirmación (`ConfirmDialog`).

### Detalle de persona / grupo

Componente `Detalle`:

- Carga el documento seleccionado y lo muestra en un formulario editable.
- Permite:
  - Actualizar datos de la persona/grupo.
  - Eliminar el documento (previa confirmación).
  - Navegar a la gestión de items:
    - `addItem()` → crea un nuevo item para esa persona/grupo.
    - `verItems()` → lista todos los items asociados.

### Items

Componente `Item`:

- Alta y edición de un **item** bajo `personas/{id}/items` o `grupos/{id}/items`.
- Usa `modoEdicion` para distinguir entre creación y edición:
  - Si hay `itemId` en la ruta, carga el documento existente y entra en modo edición.
- Botón “Guardar”:
  - En alta, crea el item en la subcolección y redirige al listado de items del padre.
  - En edición, actualiza el item y también redirige al listado de items.
- Botón “Volver”:
  - En creación, vuelve al detalle de la persona/grupo (`/dashboard/detalle/:tipo/:id`).
  - En edición, vuelve a la lista de items (`/dashboard/detalle/:tipo/:id/items`).

Componente `ItemList`:

- Lista todos los items del padre (`personas` o `grupos`), ordenados por fecha.
- Convierte timestamps a `Date` para su uso en plantillas.
- Acciones:
  - Alta de nuevo item.
  - Edición de item existente.
  - Eliminación (con confirmación).
  - Navegación a registros de cada item.

### Registros

Componente `RegistroList`:

- Lista los registros de un item concreto (subcolección `registros`).
- Permite:
  - Crear nuevo registro.
  - Editar registro existente (reutilizando `RegistroForm`).
  - Eliminar registros con confirmación.
  - Ir a la pantalla de estadísticas de ese item.

Componente `RegistroForm`:

- Formulario standalone para alta y edición de registros.
- Lee de la ruta: `:tipo`, `:id`, `:itemId` y opcionalmente `:registroId`.
- Si existe `:registroId`:
  - Activa `modoEdicion`.
  - Carga el documento desde Firestore (`getDoc`) y rellena el formulario con sus datos (conversión de `Timestamp` a `Date` para el campo `fecha`).
- Campos:
  - `fecha` (por defecto, fecha actual en alta).
  - `observaciones`.
- En alta:
  - Crea el documento en `{tipo}/{id}/items/{itemId}/registros` con `createdAt: serverTimestamp()`.
- En edición:
  - Actualiza el documento existente (`updateDoc`) y guarda `updatedAt: serverTimestamp()`.
- Tras guardar, redirige siempre a la lista de registros del item.

---

## Estadísticas y visualización

Componente `RegistroStats`:

- Genera estadísticas mensuales de los registros de uno o varios items.
- Funcionalidad:
  - Agregación por mes de los registros (últimos 3, 6 o 12 meses).
  - Cálculo de variaciones mes a mes (porcentaje de cambio).
  - Cálculo de tendencia mediante regresión lineal.
  - Posibilidad de comparar varios items a la vez y/o mostrarlos de forma combinada:
    - Cada item se representa con color propio.
    - Barras de recuento + línea de tendencia por item.
  - Exportación de la gráfica a JPEG con `html2canvas` y en web se guarda en descargas.
  - En Android se guarda en la carpeta `Pictures/Progression` y se abre un dialog para **compartir la imagen** (por ejemplo, por correo o mensajería).

En caso de que se quiera añadir a la comparación un item sin registros, se muestra un diálogo `NoRegistrosDialog` avisando de que no hay datos suficientes para graficar.

---

## Diseño visual y layout

El diseño se basa en:

- **CSS variables** definidas en `_vars.scss`:
  - Paleta de marca (`--brand-100`…`--brand-500`).
  - Colores de texto y superficies (`--surface`, `--card-bg`, etc.).

- **Layout global** en `_layout.scss`:
  - `app-root` y `body` se definen como flex column con `min-height: 100vh`.
  - `.toolbar` sticky en la parte superior para el header.
  - `.main-container` ocupa el espacio restante y aloja el `router-outlet`.
  - `.app-footer` se mantiene al final, con gradiente suave y tipografía secundaria.

- **Botones reutilizables** (`.app-btn`, `.app-btn--small`, `.app-btn--large`) en `_buttons.scss`:
  - Estilo consistente sobre Angular Material.
  - Sombras, radios, colores de hover, etc.

- **Tema Angular Material**:
  - Definido en `custom-theme.scss` usando `@use '@angular/material' as mat` y `mat.theme(...)`.
  - Se trabaja con Material 3 y CSS variables, integrando la paleta personalizada.

---

## Instalación y configuración local

### Requisitos previos

- Node.js (versión LTS recomendada).
- npm (o pnpm).
- Cuenta de Firebase.
- (Opcional) Angular CLI:

npm install -g @angular/cli

- (Opcional) Firebase CLI:

npm install -g firebase-tools


### Pasos de instalación

1. Clonar el repositorio:
git clone <URL-del-repo>
cd progression-app

2. Instalar dependencias:
npm install

3. Crear un proyecto en Firebase y habilitar:
- **Authentication** con proveedor Email/Password.
- **Firestore Database**.
4. Configurar `src/environments/environment.ts` y `environment.prod.ts` con la configuración de Firebase.
5. Ejecutar en entorno de desarrollo:


Por defecto la aplicación estará disponible en `http://localhost:4200/`.

---

## Despliegue en Firebase Hosting

La aplicación está preparada para desplegarse como SPA en Firebase Hosting.

1. Generar el build de producción:
2. Configurar Firebase Hosting (solo la primera vez):
firebase init hosting
Asegurarse de que el directorio público coincide con el configurado en `firebase.json` (por ejemplo, `dist/bienestar-app` o el nombre actualizado).
6. Desplegar únicamente Hosting:
firebase deploy --only hosting

La configuración de `firebase.json` incluye un `rewrite` para que cualquier ruta (`"source": "**"`) sirva `index.html`, lo cual permite que el router de Angular maneje las rutas del lado del cliente.

---

## Scripts npm

En `package.json` se definen, entre otros, los siguientes scripts:

- `npm start`: arranca la aplicación en modo desarrollo (`ng serve`).
- `npm run build`: genera el build de producción (`ng build`).
- `npm run watch`: build en modo watch.
- `npm test`: ejecuta las pruebas con Karma/Jasmine.
- `npm run build:ssr`: genera build + servidor para SSR.
- `npm run serve:ssr`: inicia el servidor SSR local (`node dist/.../server/server.mjs`).

En caso de cambiar el nombre interno del proyecto en `angular.json` (y la carpeta `dist` asociada), es importante actualizar las referencias en `build:ssr` y `serve:ssr`.

---

## API de datos (Firestore)

En lugar de una API REST tradicional, la aplicación utiliza directamente el SDK de Firebase para acceder a Firestore. A nivel de documentación, los “puntos de API” se describen como recursos de Firestore:

| Recurso                  | Ruta Firestore                                       | Operaciones clave                                             |
|--------------------------|------------------------------------------------------|---------------------------------------------------------------|
| Perfil de usuario        | `usuarios/{uid}`                                     | Crear en registro, leer en pantalla de perfil                 |
| Personas                 | `personas/{personaId}`                               | Alta, listado por `userId`, edición, borrado                 |
| Grupos                   | `grupos/{grupoId}`                                  | Alta, listado por `userId`, edición, borrado                 |
| Items de persona/grupo   | `{tipo}/{id}/items/{itemId}`                        | Alta, listado, edición, borrado                              |
| Registros de un item     | `{tipo}/{id}/items/{itemId}/registros/{registroId}` | Alta y edición con el mismo formulario, borrado, lectura para estadísticas |

---

## Testing

Actualmente se incluyen tests unitarios básicos para algunos componentes (por ejemplo, `Login`, `Register`, `Dashboard`), centrados en verificar que el componente se crea correctamente.

La estructura de test se basa en Jasmine + Karma (configurada por Angular CLI), usando `TestBed` y `ComponentFixture` para instanciar componentes standalone en el entorno de pruebas.

---

## Posibles mejoras futuras

Algunas posibles líneas de evolución del proyecto:

- Añadir reglas de seguridad avanzadas en Firestore (basadas en `request.auth.uid` y `resource.data.userId`).
- Internacionalización (i18n) más allá del locale `es-ES`.
- Microservicios adicionales mediante Cloud Functions (por ejemplo: generación de informes periódicos o tareas programadas).
- Mejora de tests unitarios y de integración (mocks de servicios Firebase, pruebas de guards, etc.).

---




