# CONTEXT_IA.md

> Archivo de contexto compartido del equipo.  
> **Regla de oro:** Antes de hacer `git push` → actualiza este archivo.  
> Al abrir Claude → pega el contenido completo de este archivo junto con tu prompt de rol.

---

## DATOS DEL PROYECTO

- **Nombre del sistema:** HomeSync
- **Descripción:** Sistema de Gestión de Tareas Domésticas
- **Backend:** Spring Boot (Java)
- **Framework frontend:** Next.js 14 con App Router
- **Estilos:** Tailwind CSS con colores personalizados
- **Lenguaje:** JavaScript/JSX (sin TypeScript)

---

## EQUIPO Y ROLES

| Nombre | Rol | Responsabilidad |
| -------- | ----- | ----------------- |
| Camila Torres | Arquitecto | Setup, services, integración con backend, Tablero de Tareas (HU-009, HU-015, HUS-016) |
| Daniel Sanchez | Componentes | Todos los componentes reutilizables de /components/. Sprint 2: Apoyo |
| Salome Toro | Pantallas | Crear Tarea (HUS-006) |
| David Sanchez | Pantallas | Unirse a Grupo (HUS-022) |
| Alejandro Toro | Pantallas | HU-010 (Modal Detalle Tarea - Vista Miembro) |
| Daniel Salas | Pantallas | Sprint 2: Apoyo |

---

## CONVENCIONES

- **Componentes genéricos:** `/components/ui/NombreComponente.jsx`
- **Componentes de layout:** `/components/layout/NombreComponente.jsx`
- **Componentes protegidos:** `/components/ProtectedRoute.jsx` — envuelve páginas que requieren autenticación
- **Páginas:** `/app/(Route Group)/nombre-ruta/page.jsx`
- **Servicios:** `/services/entidadService.js`
- **Mocks:** `/mocks/entidad.js` — un archivo por entidad, exporta un array o un objeto
- **Contextos:** `/context/NombreContext.jsx`
- **Hooks personalizados:** `/hooks/useNombre.js`
- **Utilidades:** `/lib/validators.js`, `/lib/jwt.js`, `/lib/api.js`, `/lib/taskHelpers.js`
- **Estilos:** solo Tailwind. Sin CSS inline. Sin archivos `.css` nuevos salvo `globals.css`
- **Colores:** solo los definidos en `tailwind.config.js`
- **Llamadas al API:** siempre desde `/services/`. Nunca `fetch()` directo en una página
- **Datos simulados:** importar desde `/mocks/entidad.js`. Nunca hardcodear arrays en el componente

---

## ESTRUCTURA DE CARPETAS

```cmd
[nombre-proyecto]/
├── app/                        ← pages
│   ├── page.jsx                ← redirige a /login
│   ├── (Route group)/          ← (app): rutas protegidas por autenticación, (auth): rutas de autenticación
│   │   └── nombre-ruta/
│   │       └── page.jsx
│   └── test/
│       └── page.jsx
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
| `ConfirmationModal.jsx` | Modal genérico de confirmación para acciones sensibles (logout, eliminar miembro/tarea, abandonar grupo, guardar cambios) | `isOpen`, `icon`, `title`, `description`, `confirmText`, `cancelText`, `onConfirm`, `onCancel`, `variant`, `showMemberSelector` (opt), `members` (opt), `selectedMemberId` (opt), `onMemberChange` (opt) |
| `LogOut.jsx` | Alias de ConfirmationModal pre-configurado para logout. Mantiene compatibilidad con código existente | `isOpen`, `onConfirm`, `onCancel`, + cualquier prop de ConfirmationModal |
| `DateLimitModal.jsx` | Modal para solicitar nueva fecha límite al reabrir una tarea vencida | `isOpen`, `value`, `error`, `loading`, `onChange`, `onConfirm`, `onCancel`, `minDateTime`, `title`, `description` |
| `TaskCard.jsx` | Tarjeta individual de tarea con estado, prioridad y acciones de cambio de estado; incluye modal para reabrir tareas vencidas | `tarea`, `esAdmin`, `esMiaTarea`, `onCambiarEstado`, `loading` |
| `TaskColumn.jsx` | Columna tipo kanban que agrupa tareas y renderiza `TaskCard` | `titulo`, `tareas`, `esAdmin`, `usuarioId`, `onCambiarEstado`, `loading` |
| `TaskDetailModal.jsx` | Modal de solo lectura con detalle completo de una tarea (título, estado, prioridad, asignado, fecha, descripción). Accesible para cualquier miembro. Soporta estado `loading` (skeleton) y prop `error` para fallos de red | `isOpen`, `tarea`, `onClose`, `loading` (default: false), `error` (default: "") |
| `TaskEditModal.jsx` | Modal de edición de tarea solo para admins. Campos editables según estado: COMPLETADA→solo lectura, VENCIDA→fecha bloqueada, resto editable. Confirma guardado con `ConfirmationModal`. Detecta cambios sin guardar | `isOpen`, `tarea`, `onClose`, `onGuardar(idTarea, datos)`, `loading` (default: false) |

### /components/layout/

| Archivo | Qué hace | Props |
| --------- | ---------- | ------- |
| `Navbar.jsx` | Barra de navegación con logo a la izquierda y contenido dinámico a la derecha | `children` (contenido dinámico en navbar) |
| `AppLayout.jsx` | Layout principal: navbar + main + footer. Main ocupa todo el ancho disponible o respeta contenedor normal | `children` (contenido principal), `navbarContent` (elementos de navbar), `fullWidth` (default: `false`) |
| `CenteredLayout.jsx` | Layout para formularios: navbar + main centrado + footer | `children` (contenido centrado), `navbarContent` (elementos de navbar) |
| `Footer.jsx` | Pie de página simple con copyright | - |

### /components/ (Protección)

| Archivo | Qué hace | Props |
| --------- | ---------- | ------- |
| `ProtectedRoute.jsx` | Envuelve componentes que requieren autenticación, redirige a login si no hay sesión | `children` (componente a proteger) |

---

## GUÍA DE ICONOS PARA CONFIRMATIONMODAL

| Acción | Ícono | Archivo | Variante | Descripción |
|--------|--------|---------|----------|-------------|
| Cerrar sesión | 🚪 Salida | `/salida.png` | danger | Usuario sale del sistema |
| Eliminar miembro | 👤 Usuario X | `/usuario-eliminar.svg` | danger | Revoca acceso de un miembro |
| Eliminar tarea | 🗑️ Papelera | `/papelera.svg` | danger | Descarta una tarea innecesaria |
| Abandonar grupo | 🚪 Salida | `/salida-grupo.svg` | danger | Miembro se desvincula del grupo |
| Abandonar grupo (Admin) | 🚪 Salida + Selector | `/salida-grupo.svg` | danger | Admin se desvincula tras elegir nuevo admin |
| Guardar cambios tarea | 💾 Save (lucide) | inline icon | primary | Confirmación antes de actualizar tarea |

**Nota:** Para el caso "Abandonar grupo (Admin)", usar props `showMemberSelector={true}`, `members={...}`, `selectedMemberId`, `onMemberChange`.

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
| `hooks/useRateLimit.js` | Maneja intentos fallidos, ventana de tiempo, bloqueo temporal y countdown persistente | `const { bloqueado, bloqueoHasta, registrarIntento, limpiarIntentos, formatearTiempo } = useRateLimit(...)` |

### Notas de acoplamiento entre contextos

- `GroupContext` depende de datos de autenticación, pero la carga del grupo se hace invocando `cargarGrupo(usuarioId, token)` con esos valores.
- `cargarGrupo(usuarioId, token)` recibe ambos argumentos. Retorna `{ ok: true }` si el usuario tiene grupo, `{ ok: false, error }` si no. Un `{ ok: false }` **no es un error**, es el caso válido de usuario sin grupo (ver HU-002 Escenario 6).
- `login()` de `AuthContext` retorna al menos `idUsuario` y `token`, que luego se usan en el flujo de `LoginPage` para cargar el grupo.

### Notas de acoplamiento TaskEditModal / TaskDetailModal

- Ambos modales reciben el objeto `tarea` completo desde el tablero — no hacen fetch propio.
- `TaskEditModal` llama `onGuardar(idTarea, datos)` que debe conectar con `taskService.actualizarTarea(idTarea, datos, token)` desde el tablero padre.
- `TaskDetailModal` acepta prop `error` (string) para mostrar banner si el padre tuvo un fallo al cargar la tarea.
- El avatar de "Asignado a" en `TaskDetailModal` se genera con iniciales del campo `tarea.asignadoA` (texto). Cuando se conecte al backend, este campo debería ser el nombre del usuario resuelto.

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
| `tareas.js` | Tarea | idTarea, idGrupo, idUsuarioAsignado, nombre, descripcion, prioridad, estado, fechaLimite, fechaCreacion, **eliminada** (boolean, soft delete) |
| `prioridades.js` | Prioridad | id, nombre (ALTA, MEDIA, BAJA), label |
| `estados.js` | Estado | id, nombre (PENDIENTE, EN_PROGRESO, COMPLETADA, VENCIDA), label, color (hex) |

---

## SERVICES DISPONIBLES

### /services

| Archivo | Función | Método | Endpoint |
| --------- | --------- | -------- | ---------- |
| `authService.js` | `registrarUsuario(data)` | POST | `/usuarios/registro` |
| `authService.js` | `iniciarSesion(data)` | POST | `/usuarios/login` |
| `authService.js` | `cerrarSesion(token)` | POST | `/sesiones/logout` |
| `authService.js` | `recuperarContrasena(data)` | PUT | `/usuarios/recuperar-contrasena` |
| `groupService.js` | `obtenerGrupoDeUsuario(usuarioId, token)` | GET | `/miembros-grupo` |
| `groupService.js` | `crearGrupo(data, token, usuarioId)` | POST | `/grupos` |
| `groupService.js` | `unirseConCodigo(codigoInvitacion, token, usuarioId)` | POST | `/miembros-grupo` |
| `groupService.js` | `obtenerGrupo(grupoId, token)` | GET | `/grupos/{id}` |
| `groupService.js` | `eliminarMiembro(idMiembroGrupo, token)` | DELETE | `/miembros-grupo/{id}` |
| `groupService.js` | `abandonarGrupo(idMiembroGrupo, idMiembroNuevoAdmin, token)` | DELETE/PUT | `/miembros-grupo/{id}` |
| `groupService.js` | `obtenerRanking(idGrupo, token)` | GET | `/grupos/{idGrupo}/ranking` |
| `taskService.js` | `crearTarea(data, token, usuarioId)` | POST | `/tareas` |
| `taskService.js` | `obtenerTareasGrupo(idGrupo, token)` | GET | `/tareas/grupo/{idGrupo}` *(filtra `eliminada !== true`)* |
| `taskService.js` | `actualizarTarea(idTarea, data, token)` | PUT | `/tareas/{idTarea}` |
| `taskService.js` | `eliminarTarea(idTarea, token)` | DELETE | `/tareas/{idTarea}` *(soft delete: marca `eliminada = true`)* |

### /lib

| Archivo | Función | Qué devuelve |
| --------- | --------- | -------------- |
| `taskHelpers.js` | `getEstadoInfo(estado)` | `{ label, color }` para UI |
| `taskHelpers.js` | `getPrioridadInfo(prioridad)` | `{ label }` para UI |
| `taskHelpers.js` | `getEstados()` | Array de estados `{ nombre, label, color }` (para combos/filtros) |
| `taskHelpers.js` | `getPrioridades()` | Array de prioridades `{ nombre, label }` (para combos) |

---

## HISTORIAS DE USUARIO — SPRINTS

### **Sprint 1** — COMPLETADO

| ID | Descripción | Estado | Responsable |
| ---- | ------------- | -------- | ------------- |
| HU-001 | Como usuario, quiero registrarme en la plataforma con nombre, correo, contraseña y pin de seguridad, para crear mi cuenta y acceder a las funcionalidades del sistema. | completada | Salome Toro |
| HU-002 | Como usuario registrado, quiero iniciar sesión con mi correo y contraseña, para acceder a mi cuenta. | completada | David Sanchez |
| HU-003 | Como usuario registrado, quiero cerrar sesión en la plataforma, para proteger mi cuenta cuando termine de usarla. | completada | Daniel Sanchez |
| HU-004 | Como usuario registrado, quiero crear un grupo familiar, para organizar las tareas del hogar con los integrantes de mi grupo familiar, convirtiéndome en administrador del mismo. | completada | Alejandro Toro |
| HU-005 | Como administrador del grupo familiar, quiero invitar usuarios al grupo familiar mediante un código de invitación, para integrarlos en la organización de tareas del hogar. | completada | Daniel Salas |

### **Sprint 2** — COMPLETADO

| ID | Descripción | Estado | Responsable | Pantalla |
| ---- | ------------- | -------- | ------------- | -------- |
| HUS-022 | Como usuario registrado, quiero unirme a un grupo familiar mediante un código de invitación válido. | completada | David Sanchez | Unirse a grupo |
| HUS-006 | Como administrador, quiero crear una tarea doméstica asignándole miembro, fecha, prioridad y título. | completada | Camila Torres | Crear tarea |
| HU-009 | Como miembro, quiero visualizar el tablero completo de tareas del hogar. | completada | Camila Torres | Tablero de tareas |
| HU-015 | Como miembro, quiero cambiar el estado de mis tareas asignadas. | completada | Camila Torres | Tablero de tareas |
| HUS-016 | Como administrador, quiero poder modificar el estado de cualquier tarea del sistema. | completada | Camila Torres | Tablero de tareas |

### **Sprint 3** — EN DESARROLLO

| ID | Descripción | Estado | Responsable | Pantalla |
| ---- | ------------- | -------- | ------------- | -------- |
| HUS-018 | Como usuario registrado, quiero restablecer mi contraseña ingresando correo y PIN de 5 dígitos. | pendiente | Salome Toro | Recuperar Contraseña |
| HUS-024 | Como administrador, quiero eliminar miembros del grupo familiar. | pendiente | Camila Torres | Detalles de Grupo |
| HU-025 | Como miembro, quiero abandonar voluntariamente mi grupo familiar. | pendiente | Camila Torres | Detalles de Grupo |
| HU-032 | Como miembro, quiero visualizar ranking de desempeño de integrantes. | pendiente | Camila Torres | Detalles de Grupo |
| HU-010 | Como miembro, quiero visualizar detalles completos de una tarea en modal sin abandonar el tablero. | pantalla lista | Alejandro Toro | Tablero (TaskDetailModal) |
| HUS-007 | Como administrador, quiero eliminar tareas del tablero. | pendiente | David Sánchez | Tablero (Modal Detalle Vista de Admin) |
| HU-008 | Como administrador, quiero editar información de tareas. | pantalla lista | David Sánchez | Tablero (TaskEditModal) |
| HU-011 | Como miembro, quiero filtrar tareas por estado/prioridad/miembro. | pendiente | Daniel Salas | Tablero (Componente FilterBar) |

---

## DIAGRAMA DE BD — ENTIDADES PRINCIPALES

### Entidades y sus campos (formato frontend)

| Entidad | Campos principales |
| --------- | -------------------- |
| Usuario | id_usuario (number), nombre (string), correo (string), contraseña (string), pinSeguridad (string), telefono (string), fotoPerfil (string, URL), creadoEn (string, ISO date) |
| Grupo | id (number), nombre (string), descripcion (string), codigoInvitacion (string, 6 chars), creadoEn (string, ISO date) |
| Rol | id (number), nombre (string) — valores esperados: "admin", "miembro" |
| MiembroGrupo | id (number), usuarioId (number), grupoId (number), rolId (number), puntaje (number), racha (number), fechaUnion (string, ISO date) |
| Tarea | id (number), titulo (string), descripcion (string), grupoId (number), creadoPor (number), asignadoA (number), prioridadId (number), estadoId (number), fechaLimite (string, ISO date), fechaCreacion (string, ISO date), fechaFinalizacion (string \| null), fechaActualizacion (string, ISO date) |
| Estado | id (number), nombre (string), categoriaEstadoId (number) |
| CategoriaEstado | id (number), nombre (string) |
| Prioridad | id (number), nombre (string) |
| Comentario | id (number), tareaId (number), usuarioId (number), comentario (string), creadoEn (string, ISO date) |
| Categoria | id (number), nombre (string) |
| TareaCategoria | id (number), tareaId (number), categoriaId (number) |
| ReglaPuntaje | id (number), puntosMinimos (number), puntosMaximos (number), nombreNivel (string), descripcion (string) |
| ReglaRacha | id (number), diasMinimos (number), diasMaximos (number), nombreRacha (string), descripcion (string) |

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
- **ReglaPuntaje** y **ReglaRacha** son tablas de configuración del sistema de gamificación

---

## NOTAS Y DECISIONES TÉCNICAS

- Por ahora se usa mock data para simular llamadas a la api y se definió una estructura base para llamada a la api con endpoints propuestos
- Se estandarizó un hook reusable de rate limiting para autenticación y flujos sensibles.
- Login usa 5 intentos en 5 minutos con bloqueo de 15 minutos (hs_login_intentos, hs_login_bloqueo_hasta).
- Unirse a grupo usa 10 intentos en 5 minutos con bloqueo de 15 minutos (hs_unirse_intentos, hs_unirse_bloqueo_hasta).
- El bloqueo persiste por localStorage y el countdown se rehidrata tras recargar.
- **Reapertura de tareas vencidas**: El componente `DateLimitModal` permite reabrir tareas con estado VENCIDA. Se valida que la nueva fecha límite sea mayor a la actual mediante `minDateTime` en el input datetime-local.

### DECISIONES SPRINT 3

- **Recuperar Contraseña (HUS-018)**: Rate limit (3 intentos / 10 min, bloqueo 15 min) se maneja en pantalla con `useRateLimit()`.
- **Eliminar Miembro (HUS-024)**: Bloquea si el miembro tiene tareas PENDIENTE/EN_PROGRESO/VENCIDA. Solo permite eliminar si todas están COMPLETADA o sin tareas.
- **Ranking (HU-032)**: Se calcula dinámicamente en mock. Filtra miembrosGrupo × grupoId, suma tareasCompletadas, ordena por puntaje DESC → tareasCompletadas DESC, asigna puesto.
- **TaskEditModal (HU-008)**: COMPLETADA → todo bloqueado. VENCIDA → fecha límite bloqueada, resto editable. Confirma guardado con `ConfirmationModal`. El padre conecta `onGuardar` con `taskService.actualizarTarea`.
- **TaskDetailModal (HU-010)**: Solo lectura. Avatar generado con iniciales de `tarea.asignadoA`. Prop `error` muestra banner sin cerrar el modal. Datos vienen del tablero padre, no hace fetch propio.

### CONFIGURACIÓN

| Archivo | Propósito |
| --------- | ----------- |
| `lib/api.js` | Config central de API. Cambiar `USE_MOCK = false` para conectar al backend real. Requiere `NEXT_PUBLIC_API_URL` en `.env.local` |
| `lib/jwt.js` | Utilidades para manejo de JWT: validar expiración, calcular tiempo restante, decodificar payload |
| `lib/validators.js` | Validaciones centralizadas para formularios: email, contraseña, nombre, PIN, etc. |

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
| 03/04/26 | Camila Torres | Ajustes de consistencia y realización de pruebas |
| 13/04/26 | Camila Torres | Ajustes de consistencia y arreglo de bug en relación al login |
| 20/04/26 | Camila Torres | Arreglo y revisión del sprint 1 completado. Documentación de ProtectedRoute, lib/jwt.js y lib/validators.js |
| 20/04/26 | Camila Torres | Creación de Sprint 2: Definición de HUs agrupadas en 3 pantallas principales |
| 22/04/26 | Camila Torres | HUS-022 implementada: pantalla Unirse a Grupo con validación de código, verificación de membresía y rate limiting |
| 22/04/26 | Camila Torres | Refactor de login para usar useRateLimit compartido y countdown en tiempo real |
| 24/04/26 | Camila Torres | HUS-016, HU-009 y HU-015 implementadas: tablero con tarjetas de tareas y botones de cambio de estado |
| 27/04/26 | Camila Torres | HUS-006 completada: pantalla Crear Tarea con validaciones frontend, modal de logout, protección de admin |
| 18/05/26 | Camila Torres | Revisión y actualización de CONTEXT_IA.md: Agregado DateLimitModal, planificación Sprint 3 |
| 19/05/26 | Camila Torres | Sprint 3 Servicios: recuperarContrasena, eliminarMiembro, abandonarGrupo, obtenerRanking, eliminarTarea |
| 23/05/26 | David Sanchez | HU-008: TaskEditModal en /components/ui/. Edición de tarea con bloqueo por estado y confirmación de guardado |
| 23/05/26 | Alejandro Toro | HU-010: TaskDetailModal en /components/ui/. Modal de solo lectura con skeleton, avatar de iniciales y manejo de error |
