# frontend-ebp10-caso13

Frontend del **Sistema de Organización de Tareas Domésticas** (Caso 13), desarrollado con **React** usando el framework **Next.js 14** y **Tailwind CSS** por el equipo **EBP10 de CodeF@ctory**.

---

## Herramientas y lenguajes

| Herramienta | Versión |
| --- | --- |
| IDE | Visual Studio Code |
| Lenguaje | JavaScript / JSX |
| Runtime | Node.js 24.14 |
| Framework | Next.js 14 (App Router) |
| Estilos | Tailwind CSS |
| Control de versiones | Git + GitHub |

**Dependencias principales:** React · Next.js · Tailwind CSS

---

## Estructura del proyecto

```cmd
frontend/
├── app/                        → Páginas (App Router)
│   ├── (app)/                  → Rutas protegidas por autenticación
│   └── (auth)/                 → Rutas de autenticación
├── components/
│   ├── ui/                     → Componentes reutilizables (Button, Input, Card...)
│   └── layout/                 → Componentes de estructura (Navbar, Footer, Layouts...)
├── context/                    → Contextos globales (AuthContext, GroupContext)
├── hooks/                      → Hooks personalizados (useAuth, useGroup, useFetch...)
├── lib/                        → Utilidades: api.js, jwt.js, validators.js, taskHelpers.js
├── mocks/                      → Datos simulados por entidad (usuarios, grupos, tareas, estados, prioridades...)
├── services/                   → Llamadas al backend (authService, groupService, taskService...)
├── public/                     → Archivos estáticos
├── CONTEXTO_IA.md              → Contexto compartido del equipo para IA
└── tailwind.config.js
```

---

## Estado actual

### ✅ Sprint 1 — COMPLETADO

- [x] Estructura del proyecto y convenciones definidas
- [x] Configuración de Tailwind CSS con colores personalizados
- [x] Componentes UI base
- [x] Componentes de layout
- [x] Contextos y hooks
- [x] Mocks por entidad: usuarios, sesiones, grupos, roles, miembrosGrupo
- [x] Servicios: `authService` y `groupService`
- [x] Configuración central de API (`lib/api.js`) con soporte mock/backend real
- [x] HU-001: Registro de usuario
- [x] HU-002: Inicio de sesión
- [x] HU-003: Cierre de sesión (modal como componente)
- [x] HU-004: Crear grupo familiar
- [x] HU-005: Invitar usuarios con código de invitación

### ✅ Sprint 2 — COMPLETADO

#### Infraestructura (Tareas)

- [x] Mocks: `tareas.js`, `prioridades.js`, `estados.js` (datos internos, sin API)
- [x] Service: `taskService.js` con 3 métodos:
  - `crearTarea(data, token, usuarioId)` → POST /tareas
  - `obtenerTareasGrupo(idGrupo, token)` → GET /tareas/grupo/{idGrupo}
  - `actualizarTarea(idTarea, data, token)` → PUT /tareas/{idTarea}
- [x] Utilidad: `lib/taskHelpers.js` para mapeos estado/prioridad → label/color

#### Pantallas Sprint 2

- [x] HUS-006: Crear tarea
- [x] HU-009, HU-015, HUS-016: Tablero de tareas
- [x] HUS-022: Unirse a grupo

#### Notas Sprint 2

- Estados: PENDIENTE, EN_PROGRESO, COMPLETADA, VENCIDA
- Prioridades: ALTA, MEDIA, BAJA
- Datos de estados y prioridades se manejan internamente en el frontend (sin API endpoints)
- El rol del usuario se obtiene de `AuthContext` y `GroupContext`

---

### 🔄 Sprint 3 — EN PLANIFICACIÓN

#### Infraestructura

- [ ] Mocks: Agregar `puntaje`, `racha` a `miembrosGrupo.js`
- [ ] Services: Ampliar `authService`, `groupService`, `taskService`
- [ ] Componentes: **TaskDetailModal** (lectura + edición), **ConfirmationModal** (refactor LogOut), **FilterBar**
- [ ] Pantallas: Recuperar Contraseña, Detalles de Grupo, Tablero mejorado

#### Refactorización

- [ ] Botón "Invitar Miembros": Mover de Tablero → Detalles de Grupo
- [ ] Modal de confirmación: Refactorizar LogOut.jsx → ConfirmationModal.jsx (genérico para logout, eliminar tarea, eliminar miembro, abandonar grupo)
- [ ] Miembros + Ranking consolidados en `/grupo/detalles`

#### Notas Sprint 3

- MiembrosGrupo requiere campos `puntaje` (50-200) y `racha` (1-7 días)
- TaskDetailModal soporta modo "lectura" y "edición" (HU-010, HU-008)
- ConfirmationModal unifica todos los flujos de confirmación del sistema
- FilterBar aplica lógica AND entre tipos (estado, prioridad, miembro) y OR dentro de cada tipo

---

## Mocks y Services — Referencia rápida

### Mocks (datos internos, sin API)

| Archivo | Propósito | Campos principales |
| --- | --- | --- |
| `usuarios.js` | Usuarios de demo | idUsuario, nombre, correo, fotoPerfil |
| `grupos.js` | Grupos de demo | id, nombre, codigoInvitacion |
| `miembrosGrupo.js` | Pertenencia usuario-grupo | usuarioId, grupoId, rolId, puntaje, racha |
| `sesiones.js` | Sesiones mock con JWT | idUsuario, token, + mockSesionActiva |
| `tareas.js` | Tareas para tablero | idTarea, nombre, estado, prioridad, fechaLimite |
| `prioridades.js` | Catálogo: ALTA, MEDIA, BAJA | nombre, label |
| `estados.js` | Catálogo: PENDIENTE, EN_PROGRESO, COMPLETADA, VENCIDA | nombre, label, color (hex) |
| `roles.js` | Catálogo: admin, miembro | id, nombre |

### Services (mock + API real)

| Archivo | Método | Endpoint | Mock | API |
| --- | --- | --- | --- | --- |
| `authService.js` | registrarUsuario | POST /usuarios/registro | ✓ | ✓ |
| `authService.js` | iniciarSesion | POST /usuarios/login | ✓ | ✓ |
| `authService.js` | cerrarSesion | POST /usuarios/logout | ✓ | ✓ |
| `groupService.js` | crearGrupo | POST /grupos | ✓ | ✓ |
| `groupService.js` | unirseConCodigo | POST /miembros-grupo | ✓ | ✓ |
| `groupService.js` | obtenerGrupoDeUsuario | GET /miembros-grupo | ✓ | ✓ |
| `groupService.js` | obtenerGrupo | GET /grupos/{id} | ✓ | ✓ |
| `taskService.js` | crearTarea | POST /tareas | ✓ | ✓ |
| `taskService.js` | obtenerTareasGrupo | GET /tareas/grupo/{idGrupo} | ✓ | ✓ |
| `taskService.js` | actualizarTarea | PUT /tareas/{idTarea} | ✓ | ✓ |

### Utilidades (lib/)

| Archivo | Funciones | Propósito |
| --- | --- | --- |
| `api.js` | apiRequest, delay | Centraliza llamadas HTTP, simula latencia |
| `jwt.js` | isTokenExpired, getTimeUntilExpiry | Valida y gestiona tokens JWT |
| `validators.js` | validateEmail, validatePassword... | Validaciones de formularios |
| `taskHelpers.js` | getEstadoInfo, getPrioridadInfo, getEstados, getPrioridades | Mapeos estado/prioridad → label/color para UI |

---

## Clonar y configurar el proyecto en tu máquina

### 1. Requisitos previos

Asegúrate de tener instalado:

- [Node.js 24.14](https://nodejs.org/)
- [Git](https://git-scm.com/downloads)
- [Visual Studio Code](https://code.visualstudio.com/) (recomendado)

### 2. Clonar el repositorio

Abre una terminal y ejecuta:

```bash
git clone https://github.com/EBP10-Caso13-TareasDomesticas-2026-1/frontend-ebp10-caso13.git
cd frontend-ebp10-caso13
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

> Ajusta la URL si el backend corre en un puerto diferente. No subas este archivo al repositorio.

### 5. Configurar el modo mock o backend real

Abre el archivo `lib/api.js` y ajusta la siguiente variable según lo que necesites:

```js
const USE_MOCK = true   // true → datos simulados | false → backend real
```

> Mientras el backend no esté disponible localmente, deja `USE_MOCK = true`.

### 6. Ejecutar el proyecto

```bash
npm run dev
```

Abre tu navegador en `http://localhost:3000` para ver la aplicación.

---

## Equipo

Desarrollado por el equipo **EBP10 — Análisis 1, CodeF@ctory**.
