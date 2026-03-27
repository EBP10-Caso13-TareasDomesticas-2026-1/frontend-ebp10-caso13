# CONTEXTO_IA.md

> Archivo de contexto compartido del equipo.  
> **Regla de oro:** Antes de hacer `git push` → actualiza este archivo.  
> Al abrir Claude → pega el contenido completo de este archivo junto con tu prompt de rol.

---

## DATOS DEL PROYECTO

- **Nombre del sistema:** HomeSync
- **Descripción:** Sistema de Gestión de Tareas Domésticas
- **Backend:** Django en `[URL, por definir]`
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
|---------|----------|-------|
| Button.jsx | Botón reutilizable con variantes (primary, secondary, danger) | `children`, `variant` (default: "primary"), `type` (default: "button"), `disabled` (default: false), `onClick`, `className` |
| Input.jsx | Campo de entrada de texto con label, ícono opcional, validación de error e ícono | `label`, `placeholder`, `type` (default: "text"), `value`, `onChange`, `error`, `icon`, `disabled`, `className` |
| PasswordInput.jsx | Input especializado para contraseñas con toggle para mostrar/ocultar | `label`, `placeholder`, `value`, `onChange`, `error`, `disabled`, `className` |
| Logo.jsx | Logo de HomeSync con soporte para 3 tamaños (sm, md, lg) | `size` (default: "md"), `className` |
| InviteCodeCard.jsx | Tarjeta que muestra código de invitación con botón para copiar al portapapeles | `code`, `className` |
| LogOut.jsx | Modal de confirmación para cerrar sesión | `isOpen`, `icon`, `title`, `description`, `confirmText`, `cancelText`, `onConfirm`, `onCancel`, `variant` |

### /components/layout/

| Archivo | Qué hace | Props |
|---------|----------|-------|
| Navbar.jsx | Barra de navegación con logo a la izquierda y contenido dinámico a la derecha | `children` (contenido dinámico en navbar) |
| AppLayout.jsx | Layout principal: navbar + main + footer. Main ocupa todo el ancho disponible | `children` (contenido principal), `navbarContent` (elementos de navbar) |
| CenteredLayout.jsx | Layout para formularios: navbar + main centrado + footer | `children` (contenido centrado), `navbarContent` (elementos de navbar) |
| Footer.jsx | Pie de página simple con copyright | - |

---

## HOOKS Y CONTEXTOS DISPONIBLES

| Archivo | Qué hace | Cómo se usa |
|---------|----------|-------------|
| *(vacío)* | *(vacío)* | *(vacío)* |

---

## MOCKS DISPONIBLES

| Archivo | Entidad | Estructura del objeto |
|---------|---------|-----------------------|
| /mocks/usuarios.js | Usuario | idUsuario, nombre, correo, telefono, fotoPerfil, creadoEn |
| /mocks/sesiones.js | Sesión / InicioSesionResponse | idUsuario, nombre, correo, token, mensaje + export mockSesionActiva |
| /mocks/grupos.js | Grupo | id, nombre, descripcion, codigoInvitacion, creadoEn |
| /mocks/roles.js | Rol | id, nombre |
| /mocks/miembrosGrupo.js | MiembroGrupo | id, usuarioId, grupoId, rolId, puntaje, racha, fechaUnion |

---

## SERVICES DISPONIBLES

| Archivo | Función | Método | Endpoint |
|---------|---------|--------|----------|
| *(vacío)* | *(vacío)* | *(vacío)* |

---

## PÁGINAS / PANTALLAS

| Rama git | Ruta | Archivo | Estado | HU | Responsable |
|----------|------|---------|--------|----|-------------|
| *(vacío)* | *(vacío)* | *(vacío)* | *(vacío)* | *(vacío)* | *(vacío)* |

**Estados:** `en progreso` · `con mocks` · `conectada al backend` · `revisada`

---

## HISTORIAS DE USUARIO — SPRINT ACTUAL

**Sprint 1**

| ID | Descripción | Estado | Responsable |
| ---- | ------------- | -------- | ------------- |
| HU-001 | Como usuario, quiero registrarme en la plataforma con nombre, correo, contraseña y pin de seguridad, para crear mi cuenta y acceder a las funcionalidades del sistema. | pendiente | Salome Toro |
| HU-002 | Como usuario registrado, quiero iniciar sesión con mi correo y contraseña, para acceder a mi cuenta. | pendiente | David Sanchez |
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

---

## NOTAS Y DECISIONES TÉCNICAS

- [ ] *(vacío)*

---

## HISTORIAL DE CAMBIOS

| Fecha | Quién | Qué se actualizó |
|-------|-------|------------------|
| 25/03/26 | Camila Torres | Creación inicial |
| 27/03/26 | Camila Torres | Creación de data mocks, authService, groupService|
| 27/03/26 | Daniel Sánchez | Especificación de componentes UI y Layout |
