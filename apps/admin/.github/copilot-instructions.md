# Frontend Project Code Generation Guidelines

## 🚨 SYSTEM INSTRUCTIONS FOR AI AGENTS 🚨

**MANDATORY FIRST ACTION**: Every AI assistant must read and acknowledge these instructions before proceeding with ANY task in this repository.

**ENFORCEMENT**: If an AI assistant does not explicitly reference these guidelines in their response, they are not following project requirements.

---

## Repository Overview

This is the **HiveSpace Admin Portal**, a modern Vue 3 admin dashboard built on the TailAdmin template. It's designed as a comprehensive data-centric admin panel for managing HiveSpace platform operations.

### Project Type & Size
- **Type**: Vue.js Admin Dashboard / Single Page Application
- **Size**: ~177 Vue components, ~30 TypeScript files, ~5,762 total lines of code
- **Primary Languages**: Vue 3 (Composition API), TypeScript, Tailwind CSS
- **Target Runtime**: Web browsers (development on Node.js 18+)

### Core Technology Stack
- **Frontend Framework**: Vue 3 with Composition API
- **Build System**: Vite 6.x (fast development server and optimized builds)
- **Type System**: TypeScript with strict type checking
- **Styling**: Tailwind CSS v4 (utility-first CSS framework)
- **State Management**: Pinia (official Vue state library)
- **HTTP Client**: Axios with centralized API configuration
- **Routing**: Vue Router 4
- **UI Components**: Custom components + third-party libraries (ApexCharts, Flatpickr, Quill, etc.)
- **Authentication**: OIDC (OpenID Connect) for enterprise SSO

### Project Architecture

**API Gateway Pattern**: The application uses a centralized API gateway architecture where all API calls route through a single gateway endpoint configured via `VITE_API_BASE_URL`.

**Component-Based Architecture**: Follows Vue 3 composition API patterns with clear separation of concerns:
- **Components**: Reusable UI components
- **Views**: Page-level components 
- **Stores**: Centralized state management (Pinia)
- **Services**: API and business logic layer
- **Composables**: Reusable composition functions

**Architectural Principles**:
- **Component-Based**: The application is built as a tree of components, with a clear hierarchy from App.vue down to individual UI elements
- **Separation of Concerns**: Logic, state, and presentation are separated. `views/` components orchestrate logic and data, `components/` present UI, and `stores/` handle global state
- **Micro-Frontends Ready**: For larger applications, a micro-frontend approach using a monorepo structure and Module Federation via Vite plugins can be considered

## Build Instructions & Commands

### Prerequisites
- **Node.js**: 18.x or later (recommended: 20.x+)
- **Package Manager**: npm (package-lock.json present)
- **IDE Recommendation**: VSCode + Volar extension (disable Vetur)

### Essential Commands

#### Setup & Development
```bash
# Always run first - installs all dependencies
npm install

# Start development server (usually runs on http://localhost:5173, may use 5174 if 5173 is busy)
npm run dev
```

#### Build & Production
```bash
# Full production build (includes type-checking)
npm run build

# Build without type-checking (faster, for testing)
npm run build-only

# Preview production build locally
npm run preview
```

#### Code Quality & Validation
```bash
# Run ESLint (fixes auto-fixable issues)
npm run lint

# Type checking only (TypeScript validation)
npm run type-check

# Format code with Prettier
npm run format
```

### Known Build Issues & Workarounds

#### Type Check Failures (Expected)
The `npm run type-check` command currently fails with 11 errors. **This is expected and should be ignored unless you're specifically working on these files:**

**Known Issues:**
1. Missing `@/services/user.service` module (referenced in `src/stores/user.ts`)
2. Missing types for `quill-image-uploader` package
3. TypeScript strict mode violations in demo files

**Workaround**: The build (`npm run build`) still succeeds because Vite can compile TypeScript without strict type checking. Only fix these if directly working on the affected files.

#### Linting Issues (Partially Expected)
`npm run lint` shows 15 errors related to:
- Unused imports (`onMounted`, `onUnmounted`)
- Unused variables in demo components
- TypeScript strict type violations
- Empty object type issues

**Workaround**: These are primarily in demo/example files. Fix only if working on those specific components.

#### Dev Server Port
If port 5173 is busy, Vite automatically uses 5174. This is normal behavior.

### Environment Setup

#### Required Environment File
Create `.env` in project root (copy from `docs/env.example.md`):

```env
# API Configuration
VITE_API_BASE_URL=https://localhost:7001/api
VITE_API_TIMEOUT=30000
# Authentication (OIDC)
VITE_AUTH_CALLBACK_URL=http://localhost:5173/callback
# Application
VITE_APP_NAME=HiveSpace Admin Portal
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
# Feature Flags
VITE_ENABLE_LOGGING=true
VITE_ENABLE_DEBUG=true
```

#### Development Server Timing
- **npm install**: ~20-30 seconds
- **npm run dev**: ~2-5 seconds
- **npm run build**: ~10-15 seconds
- **npm run lint**: ~5-10 seconds

## Project Layout & Architecture

### High-Level Architecture

**API Gateway Pattern**: The application uses a centralized API gateway architecture where all API calls route through a single gateway endpoint configured via `VITE_API_BASE_URL`.

**Component-Based Architecture**: Follows Vue 3 composition API patterns with clear separation of concerns:
- **Components**: Reusable UI components
- **Views**: Page-level components 
- **Stores**: Centralized state management (Pinia)
- **Services**: API and business logic layer
- **Composables**: Reusable composition functions

### Key Directory Structure

```
src/
├── components/           # Reusable Vue components
│   ├── common/          # Shared UI components (Toast, Modal, etc.)
│   ├── charts/          # Chart components (ApexCharts)
│   ├── forms/           # Form-related components
│   ├── layout/          # Layout components (Header, Sidebar)
│   └── tables/          # Table components
├── views/               # Page-level components
│   ├── Demo/            # Demo pages and examples
│   ├── auth/            # Authentication pages
│   └── others/          # Additional page types
├── stores/              # Pinia state stores
│   ├── app.ts          # Global app state (theme, notifications)
│   ├── auth.ts         # Authentication state
│   └── user.ts         # User management state
├── services/            # API services layer
│   ├── api.ts          # Axios configuration
│   ├── admin.service.ts # Admin API endpoints
│   └── index.ts        # Service exports
├── config/              # Configuration management
│   ├── index.ts        # Unified configuration
│   └── constants.ts    # Environment constants
├── router/              # Vue Router configuration
├── composables/         # Reusable composition functions
├── i18n/               # Internationalization
│   └── locales/        # Language files (en.json, vi.json)
├── icons/              # SVG icon components
├── types/              # TypeScript type definitions
└── assets/             # Static assets
```

### Configuration Files (Root Directory)

**Critical Build Files:**
- `package.json` - Dependencies and npm scripts
- `vite.config.ts` - Vite bundler configuration
- `tsconfig.json` - TypeScript configuration (project references)
- `tsconfig.app.json` - Main app TypeScript config
- `eslint.config.ts` - ESLint linting rules
- `postcss.config.js` - PostCSS configuration for Tailwind

**Environment Files:**
- `.env.development` - Development environment variables
- `.env` - Local environment overrides (create from docs/env.example.md)

**Other Important Files:**
- `.prettierrc.json` - Code formatting rules
- `.editorconfig` - Editor configuration
- `.gitignore` - Git ignore patterns
- `env.d.ts` - Vite environment type definitions

### Component Patterns

**Toast Notifications:**
```typescript
// Use app store for notifications
import { useAppStore } from '@/stores/app'
const appStore = useAppStore()
appStore.notifySuccess('Success!', 'Data saved.')
appStore.notifyError('Error!', 'Connection failed.')
```

**API Calls:**
```typescript
// Centralized API services
import { adminService } from '@/services/admin.service'
const users = await adminService.getUsers()
```

**State Management:**
```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores'
const authStore = useAuthStore()
await authStore.login(credentials)
</script>
```

### Validation & CI/CD

**No GitHub Actions Detected**: This repository does not currently have GitHub Actions workflows. Manual validation is required.

**Pre-commit Validation Steps:**
1. `npm run lint` - Fix linting issues
2. `npm run type-check` - Verify TypeScript (expect known failures)
3. `npm run build` - Ensure production build succeeds
4. `npm run dev` - Test development server starts

**Manual Testing:**
- Navigate to `http://localhost:5173` (or 5174) after `npm run dev`
- Test key user flows in the admin dashboard
- Verify toast notifications and modal dialogs work
- Check responsive design on different screen sizes

### Important Dependencies

**Runtime Dependencies (Always Required):**
- Vue 3 + Vue Router 4 + Pinia (core framework)
- Axios (HTTP client)
- Tailwind CSS (styling)
- ApexCharts (data visualization)
- Flatpickr (date picker)
- Lucide Vue (icons)

**Development Dependencies:**
- Vite (build tool)
- TypeScript + vue-tsc (type checking)
- ESLint + Prettier (code quality)

### Documentation Resources

**Primary Documentation:**
- `docs/README.md` - Technical documentation hub
- `docs/env.example.md` - Environment configuration guide
- `docs/components/` - Component-specific guides
- `src/config/README.md` - Configuration system guide

## Agent Instructions

**Trust These Instructions**: These instructions are comprehensive and tested. Only search the codebase if information here is incomplete or found to be incorrect.
Always answer in English

### Feature Development Workflow

**When creating any new feature, ALWAYS follow this pattern:**

#### 1. Plan & Structure
- **Identify required types**: Determine what API types, store interfaces, and component props are needed
- **Plan component hierarchy**: Break down the feature into reusable components
- **Determine data flow**: Identify what stores, services, and API endpoints are required

#### 2. Create Types First (if needed)
- **API and store Types**: Add to `src/types/{store}/` for any new backend contracts and state management interfaces
- **Utility Types**: Add to `src/types/util.type.ts/` for common helpers
- **Export in index**: Update `src/types/index.ts` to export new types

#### 3. Build Services & Stores
- **Create API Service**: Add to `src/services/` with proper TypeScript typing
- **Create/Update Store**: Add Pinia store in `src/stores/` if state management needed
- **Use centralized imports**: `import type { TypeName } from '@/types'`

#### 4. Build Components
- **Create reusable components**: Place in appropriate `src/components/` subdirectory
- **Create page/view**: Place in `src/views/` for page-level components
- **Use TypeScript**: Properly type all props, emits, and local state
- **Component-specific types**: Define within component unless reusable

#### 5. Implement Features
- **Follow Vue 3 Composition API**: Use `<script setup>` syntax exclusively
- **Use Tailwind CSS**: Apply utility classes for all styling
- **Add proper error handling**: Implement loading states and error boundaries
- **Add internationalization**: Use i18n keys for all user-facing text

#### 6. Update Routing & Navigation
- **Add routes**: Update `src/router/` configuration
- **Update navigation**: Add menu items, breadcrumbs as needed
- **Add icons**: Create SVG components in `src/icons/` and export in index

#### ✅ Mandatory Checklist for Every Feature
Before completing any feature development, verify:
- [ ] All new types are properly organized in `src/types/` structure
- [ ] API services use centralized type imports: `import type { } from '@/types'`
- [ ] Components use `<script setup lang="ts">` with proper TypeScript
- [ ] All user-facing text uses i18n translation keys
- [ ] Tailwind CSS classes used for all styling (no custom CSS unless necessary)
- [ ] Error handling and loading states implemented, remember to add new backend.errorCode i18n
- [ ] Component props and emits properly typed with `defineProps` and `defineEmits`
- [ ] Pinia stores used for shared state (no prop drilling)
- [ ] Components are modular and reusable
- [ ] Code follows project naming conventions (PascalCase components, camelCase functions)
- [ ] Arrow functions used whenever possible for consistency and readability

### Core Development Principles

#### 1. Modular & Reusable Components
All UI elements must be created as single-file components (.vue). Components should be small, focused, and reusable. Avoid monolithic components.

#### 2. Vue Composition API
Utilize the `<script setup>` syntax for all components. Manage state, lifecycle hooks, and logic using `ref`, `reactive`, `computed`, and other Composition API functions. Avoid the Options API.

#### 3. TypeScript First
All code must be written in TypeScript. Use strict typing for props (`defineProps`), emits (`defineEmits`), component state, and functions to ensure type safety.

**Type Organization Guidelines:**
- **Shared Types**: Place shared types for API services and stores in `src/types/` directory
  - `src/types/api/` - API request/response interfaces and backend contracts
  - `src/types/store/` - Pinia store state and action interfaces
  - `src/types/utils/` - Common utility types and helper interfaces
- **Component-Specific Types**: Define component props, emits, and local interfaces directly within the component file unless they are reusable across multiple components
- **Import Pattern**: Use centralized imports from `@/types` for shared types: `import type { UserData, CreateAdminRequest } from '@/types'`

#### 4. Semantic & Accessible HTML
Write clean, semantic HTML5. Use ARIA attributes and other accessibility best practices to ensure the application is usable for all users.

#### 5. Reactive Styling
Utilize Tailwind CSS utility classes to handle all styling. Implement responsive design using Tailwind's breakpoints (`sm:`, `md:`, `lg:`). Custom CSS should be minimal and only used for complex, non-utility-based styles.

#### 6. Pinia for State Management
All shared application state must be managed with Pinia stores. Do not use global variables or prop drilling for state that is shared across multiple components.

#### 7. Asynchronous Data Handling
Use a consistent pattern for fetching data. Implement proper loading and error states for all asynchronous operations.

#### 8. Internationalization (i18n) Organization
Organize i18n translation keys based on modules or shared usage:
- **Module-based translations**: Create separate JSON files for each major feature module (e.g., `admins.json`, `users.json`, `pages.json`) in `src/i18n/locales/{lang}/`
- **Common translations**: Place shared translations (UI elements, actions, navigation) in `common.json`
- **File naming**: Follow the pattern `{module}.json` where module corresponds to store modules or major feature areas
- **Key structure**: Use nested objects for logical grouping within each module (e.g., `admins.createAdmin`, `admins.actions.delete`)
- **Import pattern**: Import and organize translations by module in `src/i18n/index.ts` following the existing pattern

#### 9. Clear & Concise Code
Write well-commented code. All functions should have clear docstrings explaining their purpose, parameters, and return value. The code should be self-documenting as much as possible.

**Arrow Function Usage:**
- **ALWAYS use arrow functions** whenever possible for better readability and consistency
- **Prefer arrow functions** for all function expressions, event handlers, and callback functions
- **Use arrow functions** in Vue Composition API for computed properties, watchers, and lifecycle hooks
- **Exception**: Only use regular function declarations for top-level functions that need hoisting or when `this` binding is specifically required

#### 10. Error Handling
Implement graceful error handling. Use try/catch blocks for asynchronous calls and display user-friendly error messages on the UI.

#### 11. Performance Optimization
Be mindful of performance. Avoid unnecessary re-renders, use lazy loading for routes, and optimize image assets.

### Common Tasks
- **Adding Components**: Place in appropriate `src/components/` subdirectory
- **Adding Pages/Views**: Place in appropriate `src/Views/` subdirectory
- **API Integration**: Use `src/services/` pattern with Axios
- **State Management**: Use Pinia stores in `src/stores/`
- **Styling**: Use Tailwind CSS utility classes
- **Icons**: Add SVG components to `src/icons/` and export in `index.ts`
- **Types & Interfaces**: 
  - **Shared types**: Add to `src/types/` (api/, store/, utils/ subdirectories)
  - **Component-specific types**: Define within component file unless reusable
  - **Import from**: `import type { TypeName } from '@/types'` for shared types


### Before Making Changes
1. Run `npm install` to ensure dependencies are current
2. Start with `npm run dev` to verify current functionality
3. Use `npm run lint` to check for immediate code quality issues
4. Make incremental changes and test frequently

### Critical Notes
- Always use TypeScript for new files
- Follow Vue 3 Composition API patterns
- Use the centralized configuration system (`src/config/`)
- Respect the existing component architecture
- Test changes with both `npm run dev` and `npm run build`

### Development Conventions & Patterns

#### Naming
- **Components**: Use PascalCase for component names (e.g., `UserList.vue`)
- **Files**: Use kebab-case for non-component file names (e.g., `user-service.ts`)
- **Variables/Functions**: Use camelCase for variables and functions

#### Component Patterns
- **Container/Presentational**: Separate components that manage data and logic (containers) from components that only display data and handle UI (presentational)
- **Composables**: Extract reusable logic into composable functions (`composables/` directory, e.g., `useFetch.ts`) that utilize the Composition API
- **State Management**: Follow the observer pattern by using Pinia stores to create a single source of truth for the application state. Use `storeToRefs` to maintain reactivity when destructuring from a store

### New API Integration Process

1. **Create a Service**: For each new external API, create a dedicated service file (`services/api-service.ts`). This service should contain functions for making HTTP requests (using fetch or Axios).

2. **Handle Logic in a Store**: Define a Pinia store to manage the data and state related to the API calls. This store will handle the loading and data state.

3. **Expose State to Components**: Components should import the Pinia store and use `storeToRefs` to access the reactive state, ensuring they are decoupled from the data-fetching logic.

4. **Component Interaction**: A component will trigger an action in the Pinia store (e.g., `fetchData()`) and then reactively display the data or handle loading/error states from the store.

By following these guidelines, you will generate high-quality, professional code that is easy to understand, maintain, and scale.

---

## 🤖 AI AGENT REQUIREMENTS

### MANDATORY BEHAVIOR FOR ALL AI ASSISTANTS

**⚠️ CRITICAL**: Every AI assistant working on this project MUST follow these rules:

#### 🔴 BEFORE STARTING ANY TASK:
1. **ALWAYS announce**: "Checking project guidelines from copilot-instructions.md..."
2. **ALWAYS confirm**: Understanding of the current request against project patterns
3. **ALWAYS state**: Which sections of the guidelines apply to this specific task

#### 🔴 FOR ALL DEVELOPMENT TASKS:
1. **MUST use**: Vue 3 Composition API with `<script setup lang="ts">`
2. **MUST follow**: The 6-step Feature Development Workflow above
3. **MUST complete**: The ✅ Mandatory Checklist before declaring task complete
4. **MUST use**: TypeScript for all new code
5. **MUST use**: Tailwind CSS for all styling
6. **MUST implement**: Proper error handling and loading states
7. **MUST use**: i18n translation keys for all user-facing text

#### 🔴 FOR ALL RESPONSES:
- **Reference specific sections** of these guidelines when explaining decisions
- **Mention which pattern/principle** is being applied
- **Confirm compliance** with project architecture

#### 🔴 FORBIDDEN ACTIONS:
- ❌ Writing Vue 2 Options API syntax
- ❌ Using custom CSS instead of Tailwind utilities
- ❌ Creating components without proper TypeScript typing
- ❌ Skipping error handling or loading states
- ❌ Hardcoding text instead of using i18n keys
- ❌ Prop drilling instead of using Pinia stores
- ❌ Using regular function expressions when arrow functions are appropriate

### EXAMPLE COMPLIANCE STATEMENT:
```
✅ Checking project guidelines from copilot-instructions.md...
✅ This request requires: [Component Creation/API Integration/State Management]
✅ I will follow: [Specific sections from guidelines]
✅ Mandatory checklist items that apply: [List relevant items]
```

---
