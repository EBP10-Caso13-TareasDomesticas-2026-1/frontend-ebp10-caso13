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
| Camila | Arquitecto | Setup, services, hooks, context, integración con backend |
| Daniel | Componentes | Todos los componentes reutilizables de /components/ |
| [Nombre 3] | Pantallas | HU-[X] |
| [Nombre 4] | Pantallas | HU-[X] |
| [Nombre 5] | Pantallas | HU-[X] |
| [Nombre 6] | Pantallas | HU-[X] |

---

## CONVENCIONES

- **Componentes genéricos:** `/components/ui/NombreComponente.jsx`
- **Componentes de layout:** `/components/layout/NombreComponente.jsx`
- **Páginas:** `/app/nombre-ruta/page.jsx`
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
│   └── nombre-ruta/
│       └── page.jsx
├── components/
│   ├── ui/                     ← Button, Input, Table, Card, Badge, Modal...
│   └── layout/                 ← Navbar, Sidebar, Footer, Layout...
├── context/                    ← AuthContext, etc.
├── hooks/                      ← useAuth, useFetch, etc.
├── lib/                        ← formatearFecha, validarEmail, etc.
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
| *(vacío)* | *(vacío)* | *(vacío)* |

### /components/layout/

| Archivo | Qué hace | Props |
|---------|----------|-------|
| *(vacío)* | *(vacío)* | *(vacío)* |

---

## HOOKS Y CONTEXTOS DISPONIBLES

| Archivo | Qué hace | Cómo se usa |
|---------|----------|-------------|
| *(vacío)* | *(vacío)* | *(vacío)* |

---

## MOCKS DISPONIBLES

| Archivo | Entidad | Estructura del objeto |
|---------|---------|-----------------------|
| *(vacío)* | *(vacío)* | *(vacío)* |

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
| HU-001 | Como usuario, quiero registrarme en la plataforma con nombre, correo, contraseña y pin de seguridad, para crear mi cuenta y acceder a las funcionalidades del sistema. | pendiente | [nombre] |
| HU-002 | Como usuario registrado, quiero iniciar sesión con mi correo y contraseña, para acceder a mi cuenta. | pendiente | [nombre] |
| HU-003 | Como usuario registrado, quiero cerrar sesión en la plataforma, para proteger mi cuenta cuando termine de usarla. | pendiente | [nombre] |
| HU-004 | Como usuario registrado, quiero crear un grupo familiar, para organizar las tareas del hogar con los integrantes de mi grupo familiar, convirtiéndome en administrador del mismo. | pendiente | [nombre] |
| HU-005 | Como administrador del grupo familiar, quiero invitar usuarios al grupo familiar mediante un código de invitación, para integrarlos en la organización de tareas del hogar. | pendiente | [nombre] |

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
| [fecha] | [nombre] | Creación inicial |
