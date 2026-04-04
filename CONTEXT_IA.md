# CONTEXTO_IA.md

> Archivo de contexto compartido del equipo.  
> **Regla de oro:** Antes de hacer `git push` → actualiza este archivo.  
> Al abrir Claude → pega el contenido completo de este archivo junto con tu prompt de rol.

---

## DATOS DEL PROYECTO

- **Nombre del sistema:** HomeSync
- **Descripción:** Sistema de Gestión de Tareas Domésticas
- **Backend:** Spring Boot (Java) en `http://localhost:8080` (desarrollo local)
- **Framework frontend:** Next.js 14 con App Router
- **Estilos:** Tailwind CSS con colores personalizados
- **Lenguaje:** JavaScript/JSX (sin TypeScript)

---

## EQUIPO Y ROLES

| Nombre | Rol | Responsabilidad |
| -------- | ----- | ----------------- |
| Camila Torres | Arquitecto | Setup, services, hooks, context, integración con backend |
| Daniel Sanchez | Componentes | Todos los componentes reutilizables de /components/ |
| Salome Toro | Pantallas | HU-001, Pantalla de Bienvenida |
| David Sanchez | Pantallas | HU-002 |
| Alejandro Toro | Pantallas | HU-004 |
| Daniel Salas | Pantallas | HU-005 |

---

## CONVENCIONES

- **Componentes genéricos:** `/components/ui/NombreComponente.jsx`
- **Componentes de layout:** `/components/layout/NombreComponente.jsx`
- **Páginas:** `/app/(Route Group)/nombre-ruta/page.jsx`
- **Servicios:** `/services/entidadService.js`
- **Mocks:** `/mocks/entidad.js` — un archivo por entidad, exporta un array o un objeto
- **Contextos:** `/context/NombreContext.jsx`
- **Hooks personalizados:** `/hooks/useNombre.js`
- **Utilidades:** `/lib/utils.js` o `/lib/nombreUtil.js`
- **Estilos:** solo Tailwind. Sin CSS inline. Sin archivos `.css` nuevos salvo `globals.css`
- **Colores:** solo los definidos en `tailwind.config.js`
- **Llamadas al API:** siempre desde `/services/`. Nunca `fetch()` directo en una página
- **Datos simulados:** importar desde `/mocks/entidad.js`. Nunca hardcodear arrays en el componente

---

## ESTRUCTURA DE CARPETAS

```cmd
[nombre-proyecto]/
├── app/                        ← pages
│   └── (Route group)/          ← (app): rutas protegidas por autenticación, (auth): rutas de autenticación
│       └── nombre-ruta/
│           └── page.jsx
├── components/
│   ├── ui/                     ← Button, Input, Table, Card, Badge, Modal...
│   └── layout/                 ← Navbar, Sidebar, Footer, Layout...
├── context/                    ← AuthContext, etc.
├── hooks/                      ← useAuth, useFetch, etc.
├── lib/                        ← formatDate, validateEmail, etc.
├── mocks/                      ← usuarios.js, tareas.js, etc.
├── services/                   ← usuarioService.js, tareaService.js, etc.
├── public/
├── CONTEXTO_IA.md
└── tailwind.config.js
```

---

## COMPONENTES DISPONIBLES

> Actualizar cada vez que se cree o modifique un componente. Los que hacen pantallas DEBEN consultar esta tabla antes de pedir a la IA que cree algo.

### /components/ui/

| Archivo | Qué hace | Props |
| --------- | ---------- | ------- |
| `Button.jsx` | Botón reutilizable con variantes (primary, secondary, danger) | `children`, `variant` (default: "primary"), `type` (default: "button"), `disabled` (default: false), `onClick`, `className` |
| `Input.jsx` | Campo de entrada de texto con label, ícono opcional, validación de error e ícono | `label`, `placeholder`, `type` (default: "text"), `value`, `onChange`, `error`, `icon`, `disabled`, `className` |
| `PasswordInput.jsx` | Input especializado para contraseñas con toggle para mostrar/ocultar | `label`, `placeholder`, `value`, `onChange`, `error`, `disabled`, `className` |
| `Logo.jsx` | Logo de HomeSync con soporte para 3 tamaños (sm, md, lg) | `size` (default: "md"), `className` |
| `InviteCodeCard.jsx` | Tarjeta que muestra código de invitación con botón para copiar al portapapeles | `code`, `className` |
| `LogOut.jsx` | Modal de confirmación para cerrar sesión | `isOpen`, `icon`, `title`, `description`, `confirmText`, `cancelText`, `onConfirm`, `onCancel`, `variant` |

### /components/layout/

| Archivo | Qué hace | Props |
| --------- | ---------- | ------- |
| `Navbar.jsx` | Barra de navegación con logo a la izquierda y contenido dinámico a la derecha | `children` (contenido dinámico en navbar) |
| `AppLayout.jsx` | Layout principal: navbar + main + footer. Main ocupa todo el ancho disponible | `children` (contenido principal), `navbarContent` (elementos de navbar) |
| `CenteredLayout.jsx` | Layout para formularios: navbar + main centrado + footer | `children` (contenido centrado), `navbarContent` (elementos de navbar) |
| `Footer.jsx` | Pie de página simple con copyright | - |

---

## HOOKS Y CONTEXTOS DISPONIBLES

| Archivo | Qué hace | Cómo se usa |
| --------- | ---------- | ------------- |
| `context/AuthContext.jsx` | Sesión del usuario (token, datos, login/logout/register) | Envuelve la app en `<AuthProvider>` |
| `context/GroupContext.jsx` | Grupo activo, miembros y rol del usuario | Envuelve la app en `<GroupProvider>` (dentro de *AuthProvider*) |
| `hooks/useAuth.js` | Consume AuthContext | `const { usuario, login } = useAuth()` |
| `hooks/useGroup.js` | Consume GroupContext | `const { grupo, rolActual, crearGrupo, cargarGrupo } = useGroup()` |
| `hooks/useLocalStorage.js` | Persistencia reactiva en localStorage | Usado internamente por AuthContext |
| `hooks/useFetch.js` | Estado loading/error/data para llamadas a servicios puntuales | `const { data, loading, execute } = useFetch(servicio)` |

### Notas de acoplamiento entre contextos
- `GroupContext` lee `usuario` y `token` directamente de `AuthContext` — **no** se le pasan como parámetros.
- `cargarGrupo()` no recibe argumentos. Retorna `{ ok: true }` si el usuario tiene grupo, `{ ok: false, error }` si no. Un `{ ok: false }` **no es un error**, es el caso válido de usuario sin grupo (ver HU-002 Escenario 6).
- `login()` de AuthContext probablemente retorna `void` — guarda la sesión en estado interno. Pendiente confirmar con Camila.

---

## MOCKS DISPONIBLES

### /mocks

| Archivo | Entidad | Estructura del objeto |
| --------- | --------- | ----------------------- |
| `usuarios.js` | Usuario | idUsuario, nombre, correo, telefono, fotoPerfil, creadoEn |
| `sesiones.js` | Sesión / InicioSesionResponse | idUsuario, nombre, correo, token, mensaje + export mockSesionActiva |
| `grupos.js` | Grupo | id, nombre, descripcion, codigoInvitacion, creadoEn |
| `roles.js` | Rol | id, nombre |
| `miembrosGrupo.js` | MiembroGrupo | id, usuarioId, grupoId, rolId, puntaje, racha, fechaUnion |

---

## SERVICES DISPONIBLES

### /services

| Archivo | Función | Método | Endpoint |
| --------- | --------- | -------- | ---------- |
| `authService.js` | `registrarUsuario(data)` | POST | `/usuarios/registro` |
| `authService.js` | `iniciarSesion(data)` | POST | `/usuarios/login` |
| `authService.js` | `cerrarSesion(token)` | POST | `/usuarios/logout` |
| `groupService.js` | `obtenerGrupoDeUsuario(usuarioId, token)` | GET | `/miembros-grupo/usuario/{id}` |
| `groupService.js` | `crearGrupo(data, token, usuarioId)` | POST | `/grupos` |
| `groupService.js` | `unirseConCodigo(codigoInvitacion, token)` | POST | `/grupos/unirse` |
| `groupService.js` | `obtenerGrupo(grupoId, token)` | GET | `/grupos/{id}` |

---

## PÁGINAS / PANTALLAS

| Rama git | Ruta | Archivo | Estado | HU | Responsable |
|----------|------|---------|--------|----|-------------|
| hu-002 | /login | app/(auth)/login/page.jsx | con mocks | HU-002 | David Sanchez |

**Estados:** `en progreso` · `con mocks` · `conectada al backend` · `revisada`

---

## HISTORIAS DE USUARIO — SPRINT ACTUAL

**Sprint 1**

| ID | Descripción | Estado | Responsable |
| ---- | ------------- | -------- | ------------- |
| HU-001 | Como usuario, quiero registrarme en la plataforma con nombre, correo, contraseña y pin de seguridad, para crear mi cuenta y acceder a las funcionalidades del sistema. | pendiente | Salome Toro |
| HU-002 | Como usuario registrado, quiero iniciar sesión con mi correo y contraseña, para acceder a mi cuenta. | pantalla lista | David Sanchez |
| HU-003 | Como usuario registrado, quiero cerrar sesión en la plataforma, para proteger mi cuenta cuando termine de usarla. | pantalla lista | Daniel Sanchez |
| HU-004 | Como usuario registrado, quiero crear un grupo familiar, para organizar las tareas del hogar con los integrantes de mi grupo familiar, convirtiéndome en administrador del mismo. | pendiente | Alejandro Toro |
| HU-005 | Como administrador del grupo familiar, quiero invitar usuarios al grupo familiar mediante un código de invitación, para integrarlos en la organización de tareas del hogar. | pendiente | Daniel Salas |

**Estados:** `pendiente` · `en progreso` · `pantalla lista` · `integrada` · `completada`

---

## DIAGRAMA DE BD — ENTIDADES PRINCIPALES

> Resume las entidades del diagrama para que la IA genere mocks y services coherentes con la BD real.

### Entidades y sus campos (formato frontend)

| Entidad | Campos principales |
| --------- | -------------------- |
| Usuario | id_usuario (number), nombre (string), correo (string), contraseña (string), pinSeguridad (string), telefono (string), fotoPerfil (string, URL), creadoEn (string, ISO date) |
| Grupo | id (number), nombre (string), descripcion (string), codigoInvitacion (string, 6 chars), creadoEn (string, ISO date) |
| Rol | id (number), nombre (string) — valores esperados: "admin", "miembro" |
| MiembroGrupo | id (number), usuarioId (number), grupoId (number), rolId (number), puntaje (number), racha (number), fechaUnion (string, ISO date) |
| Tarea | id (number), titulo (string), descripcion (string), grupoId (number), creadoPor (number), asignadoA (number), prioridadId (number), estadoId (number), fechaLimite (string, ISO date), fechaCreacion (string, ISO date), fechaFinalizacion (string \| null), fechaActualizacion (string, ISO date) |
| Estado | id (number), nombre (string), categoriaEstadoId (number) |
| CategoriaEstado | id (number), nombre (string) — agrupa estados (ej: "En curso", "Finalizado") |
| Prioridad | id (number), nombre (string) — valores esperados: "Alta", "Media", "Baja" |
| Comentario | id (number), tareaId (number), usuarioId (number), comentario (string), creadoEn (string, ISO date) |
| Categoria | id (number), nombre (string) — etiquetas temáticas para tareas |
| TareaCategoria | id (number), tareaId (number), categoriaId (number) — tabla intermedia M:N |
| ReglaPuntaje | id (number), puntosMinimos (number), puntosMaximos (number), nombreNivel (string), descripcion (string) |
| ReglaRacha | id (number), diasMinimos (number), diasMaximos (number), nombreRacha (string), descripcion (string) |

---

### Relaciones entre entidades

- Un **Usuario** puede pertenecer a muchos **Grupos** (a través de MiembroGrupo)
- Un **Grupo** tiene muchos **Usuarios** miembros (a través de MiembroGrupo)
- Cada **MiembroGrupo** tiene un **Rol** (admin o miembro)
- Un **Grupo** tiene muchas **Tareas**
- Una **Tarea** fue creada por un **Usuario** y puede estar asignada a otro **Usuario**
- Una **Tarea** tiene una **Prioridad** y un **Estado**
- Un **Estado** pertenece a una **CategoriaEstado**
- Una **Tarea** puede tener muchos **Comentarios**
- Un **Comentario** pertenece a un **Usuario**
- Una **Tarea** puede tener muchas **Categorias** (a través de TareaCategoria)
- **ReglaPuntaje** y **ReglaRacha** son tablas de configuración del sistema de gamificación; no tienen FK directas pero se aplican al campo `puntaje` y `racha` de MiembroGrupo

---

## NOTAS Y DECISIONES TÉCNICAS

- Por ahora se usa mock data para simular llamadas a la api y se definió una estructura base para llamada a la api con endpoints propuestos

### CONFIGURACIÓN

| Archivo | Propósito |
|---------|-----------|
| `lib/api.js` | Config central de API. Cambiar `USE_MOCK = false` para conectar al backend real. Requiere `NEXT_PUBLIC_API_URL` en `.env.local` |

### DECISIONES HU-002

- El bloqueo por 5 intentos fallidos se maneja en **frontend** con `localStorage` (claves: `hs_login_intentos`, `hs_login_bloqueo_hasta`). Cuando el backend esté listo, puede retornar HTTP 429/423 y el bloqueo frontend queda como respaldo.
- `cargarGrupo()` puede retornar `{ ok: false }` después de un login exitoso — eso **no es un error**, es el Escenario 6 (usuario sin grupo). No tratar como excepción.
- El Escenario 7 (redirigir al dashboard si usuario con grupo entra a `/bienvenida`) debe implementarse en `app/(auth)/bienvenida/page.jsx` — responsabilidad de Salome Toro.

---

## HISTORIAL DE CAMBIOS

| Fecha | Quién | Qué se actualizó |
| ------- | ------- | ------------------ |
| 25/03/26 | Camila Torres | Creación inicial |
| 27/03/26 | Camila Torres | Creación de data mocks, authService, groupService y lib/api.js |
| 27/03/26 | Daniel Sánchez | Especificación de componentes UI y Layout |
| 27/03/26 | Camila Torres | Creación context y hooks necesarios |
| 31/03/26 | Alejandro Toro | Creación hu 004 |
| 31/03/26 | Alejandro Toro | Cambios miembrosGrupo.js |
| 02/04/26 | David Sanchez | HU-002: pantalla de login con mocks. Notas de acoplamiento GroupContext/AuthContext |
| 03/04/26 | Camula Torres | Ajustes de consistencia y realización de pruebas |
