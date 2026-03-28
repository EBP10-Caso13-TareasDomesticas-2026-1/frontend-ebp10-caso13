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
├── lib/                        → Utilidades y configuración de API
├── mocks/                      → Datos simulados por entidad
├── services/                   → Llamadas al backend (authService, groupService...)
├── public/                     → Archivos estáticos
├── CONTEXTO_IA.md              → Contexto compartido del equipo para IA
└── tailwind.config.js
```

---

## Estado actual — Sprint 1

- [x] Estructura del proyecto y convenciones definidas
- [x] Configuración de Tailwind CSS con colores personalizados
- [x] Componentes UI base
- [x] Componentes de layout
- [x] Contextos y hooks
- [x] Mocks por entidad: usuarios, sesiones, grupos, roles, miembrosGrupo
- [x] Servicios: `authService` y `groupService`
- [x] Configuración central de API (`lib/api.js`) con soporte mock/backend real
- [x] HU-003: Cierre de sesión (modal como componente)
- [] HU-001: Registro de usuario
- [] HU-002: Inicio de sesión
- [] HU-004: Crear grupo familiar
- [] HU-005: Invitar usuarios con código de invitación

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
