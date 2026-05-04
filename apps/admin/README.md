# HiveSpace Admin Portal

**A modern Vue 3 admin dashboard for managing HiveSpace platform operations**

![HiveSpace Admin Portal](./banner.png)

HiveSpace Admin Portal is a comprehensive, data-centric admin panel built on Vue 3, TypeScript, and Tailwind CSS. It provides administrators with powerful tools to manage users, accounts, and platform operations through an intuitive, responsive interface.

## 🚀 Project Overview

**HiveSpace Admin Portal** is a Vue.js Single Page Application (SPA) designed for enterprise-level platform administration. Built with modern web technologies, it offers a robust foundation for managing complex business operations.

### 📊 Project Statistics
- **Type**: Vue.js Admin Dashboard / Single Page Application  
- **Size**: ~177 Vue components, ~30 TypeScript files, ~5,762 total lines of code
- **Primary Languages**: Vue 3 (Composition API), TypeScript, Tailwind CSS
- **Target Runtime**: Web browsers (development on Node.js 18+)

### 🏗️ Architecture Overview

**API Gateway Pattern**: Centralized API architecture where all API calls route through a single gateway endpoint configured via `VITE_API_BASE_URL`.

**Component-Based Architecture**: Clear separation of concerns following Vue 3 composition API patterns:
- **Components**: Reusable UI components (`src/components/`)
- **Pages**: Page-level components (`src/pages/`)  
- **Stores**: Centralized state management with Pinia (`src/stores/`)
- **Services**: API and business logic layer (`src/services/`)
- **Composables**: Reusable composition functions (`src/composables/`)

### 🛠️ Core Technology Stack

**Frontend Framework & Build System:**
- **Vue 3** with Composition API (`<script setup>` syntax)
- **Vite 6.x** - Fast development server and optimized builds
- **TypeScript** with strict type checking
- **Vue Router 4** - Application routing and navigation

**UI & Styling:**
- **Tailwind CSS v4** - Utility-first CSS framework
- **ApexCharts** - Data visualization and charting
- **Flatpickr** - Date/time picker components
- **Lucide Vue** - Modern icon library

**State Management & API:**
- **Pinia** - Official Vue state management library
- **Axios** - HTTP client with centralized configuration
- **OIDC (OpenID Connect)** - Enterprise SSO authentication

**Development Tools:**
- **ESLint** - Code linting and quality enforcement
- **Prettier** - Code formatting
- **vue-tsc** - TypeScript type checking for Vue files

## 🚀 Quick Start

### Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js**: 18.x or later (recommended: 20.x+)
- **Package Manager**: npm (package-lock.json present)
- **IDE Recommendation**: [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension
  - **Important**: Disable Vetur if installed (conflicts with Volar)

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/HiveSpaceTeam/hivespace.adminportal.git
   cd hivespace.adminportal
   ```

2. **Install dependencies** (required first step):
   ```bash
   npm install
   ```

3. **Configure environment** (copy from example):
   ```bash
   # Create your .env file from the template
   # See "Environment Configuration" section below
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5173` (or 5174 if 5173 is busy)

### 🔧 Available Commands

#### Development & Build
```bash
# Start development server with hot reload
npm run dev

# Build for production (includes type-checking)
npm run build

# Build for production (without type-checking, faster)
npm run build-only

# Preview production build locally
npm run preview
```

#### Code Quality & Validation
```bash
# Run ESLint and auto-fix issues
npm run lint

# Run TypeScript type checking
npm run type-check

# Format code with Prettier
npm run format
```

### ⚙️ Environment Configuration

Create a `.env` file in the project root with the following configuration:

```env
# API Configuration
VITE_API_BASE_URL=https://localhost:7001/api
VITE_API_TIMEOUT=30000
VITE_API_VERSION=v1

# Authentication (OIDC)
VITE_APP_CLIENT_ID=your-oidc-client-id
VITE_AUTH_CALLBACK_URL=http://localhost:5173/auth/callback
VITE_APP_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_APP_POST_LOGOUT_REDIRECT_URI=http://localhost:5173

# Application
VITE_APP_NAME=HiveSpace Admin Portal
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_LOGGING=true
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false

# External Services (optional)
VITE_STORAGE_BASE_URL=https://storage.hivespace.com
VITE_CDN_BASE_URL=https://cdn.hivespace.com
```

**Important Notes:**
- All environment variables must be prefixed with `VITE_` to be accessible in the application
- Never commit sensitive credentials to version control
- Use different values for development, staging, and production environments

### ⚠️ Known Build Issues

#### Type Check Failures (Expected)
The `npm run type-check` command currently fails with 11 errors. **This is expected** and should be ignored unless working on specific affected files:

**Known Issues:**
1. Missing `@/services/user.service` module (referenced in `src/stores/user.store.ts`)
2. Missing types for `quill-image-uploader` package  
3. TypeScript strict mode violations in demo files

**Workaround**: The production build (`npm run build`) still succeeds because Vite can compile TypeScript without strict type checking.

#### Linting Issues (Partially Expected)
`npm run lint` shows 15 errors related to:
- Unused imports (`onMounted`, `onUnmounted`)
- Unused variables in demo components
- TypeScript strict type violations

**Workaround**: These are primarily in demo/example files and don't affect core functionality.

### 🕐 Expected Build Times
- **npm install**: 20-30 seconds
- **npm run dev**: 2-5 seconds  
- **npm run build**: 10-15 seconds
- **npm run lint**: 5-10 seconds

## 📁 Project Structure

Understanding the codebase organization is crucial for effective development. Here's the comprehensive project structure:

### 🏗️ High-Level Directory Layout

```
src/
├── components/           # Reusable Vue components
│   ├── common/          # Shared UI components (Toast, Modal, etc.)
│   ├── charts/          # Chart components (ApexCharts)
│   ├── forms/           # Form-related components
│   ├── layout/          # Layout components (Header, Sidebar)
│   ├── modal/           # Modal dialog components
│   └── tables/          # Table components
├── pages/               # Page-level components (routes)
│   ├── Accounts/        # Account management pages
│   │   ├── AdminManagement.vue
│   │   ├── UserManagement.vue
│   │   └── Popups/      # Account-related modals
│   ├── Demo/            # Demo pages and examples
│   └── Callback.vue     # Authentication callback
├── stores/              # Pinia state stores
│   ├── app.ts          # Global app state (theme, notifications)
│   ├── auth.ts         # Authentication state
│   ├── admin.ts        # Admin management state
│   ├── user.ts         # User management state
│   └── index.ts        # Store exports
├── services/            # API services layer
│   ├── api.ts          # Axios configuration & interceptors
│   ├── admin.service.ts # Admin API endpoints
│   └── index.ts        # Service exports
├── types/               # TypeScript type definitions
│   ├── api/            # API request/response interfaces
│   ├── store/          # Pinia store interfaces
│   ├── utils/          # Common utility types
│   ├── app-user.ts     # User-related types
│   └── index.ts        # Type exports
├── config/              # Configuration management
│   ├── index.ts        # Unified configuration system
│   ├── constants.ts    # Environment constants
│   └── README.md       # Configuration guide
├── router/              # Vue Router configuration
├── composables/         # Reusable composition functions
│   ├── useModal.ts     # Modal management
│   ├── useConfirmModal.ts # Confirmation dialogs
│   └── useSidebar.ts   # Sidebar state management
├── i18n/               # Internationalization
│   ├── index.ts        # i18n configuration
│   └── locales/        # Language files (en.json, vi.json)
├── icons/              # SVG icon components
│   ├── [100+ icon files]
│   └── index.ts        # Icon exports
├── auth/               # Authentication utilities
│   └── user-manager.ts # OIDC user management
├── assets/             # Static assets
│   └── main.css        # Global styles
├── App.vue             # Root application component
└── main.ts             # Application entry point
```

### 🔧 Configuration Files (Root Directory)

**Critical Build Files:**
- `package.json` - Dependencies and npm scripts
- `vite.config.ts` - Vite bundler configuration
- `tsconfig.json` - TypeScript configuration (project references)
- `tsconfig.app.json` - Main app TypeScript config
- `eslint.config.ts` - ESLint linting rules
- `postcss.config.js` - PostCSS configuration for Tailwind

**Environment & IDE:**
- `.env.development` - Development environment variables
- `.env` - Local environment overrides (create from template above)
- `.prettierrc.json` - Code formatting rules
- `.editorconfig` - Editor configuration

**Type Definitions:**
- `env.d.ts` - Vite environment type definitions
- `src/vue.shims.d.ts` - Vue SFC type declarations

### 🧩 Key Component Categories

**Layout Components** (`src/components/layout/`):
- Header, Sidebar, Footer components
- Navigation and menu components
- Responsive layout containers

**Common Components** (`src/components/common/`):
- Toast notifications
- Modal dialogs
- Loading indicators
- Form elements

**Business Logic Components** (`src/pages/`):
- Admin Management - User account creation, editing, permissions
- User Management - User data, profiles, activity tracking
- Authentication flows - Login, logout, callbacks

**Utility Components**:
- Charts (`src/components/charts/`) - Data visualization with ApexCharts
- Tables (`src/components/tables/`) - Data grids and listings
- Forms (`src/components/forms/`) - Form inputs and validation

### 🔗 Import Patterns

The project uses path aliases for clean imports:

```typescript
// Centralized imports from @/types
import type { AdminData, CreateAdminRequest } from '@/types'

// Component imports
import { useAppStore } from '@/stores/app.store'
import { adminService } from '@/services/admin.service'
import { config } from '@/config'

// Icon imports
import { PlusIcon, EditIcon } from '@/icons'
```

## 🎯 Development Guidelines

### 🏗️ Feature Development Workflow

When creating any new feature, **ALWAYS follow this pattern**:

#### 1. Plan & Structure
- **Identify required types**: Determine API types, store interfaces, and component props needed
- **Plan component hierarchy**: Break down the feature into reusable components  
- **Determine data flow**: Identify required stores, services, and API endpoints

#### 2. Create Types First (if needed)
- **API Types**: Add to `src/types/api/` for backend contracts
- **Store Types**: Add to `src/types/store/` for state management interfaces
- **Utility Types**: Add to `src/types/utils/` for common helpers
- **Export in index**: Update `src/types/index.ts` to export new types

#### 3. Build Services & Stores
- **Create API Service**: Add to `src/services/` with proper TypeScript typing
- **Create/Update Store**: Add Pinia store in `src/stores/` if state management needed
- **Use centralized imports**: `import type { TypeName } from '@/types'`

#### 4. Build Components
- **Create reusable components**: Place in appropriate `src/components/` subdirectory
- **Create page/view**: Place in `src/pages/` for page-level components
- **Use TypeScript**: Properly type all props, emits, and local state

#### 5. Implement Features
- **Follow Vue 3 Composition API**: Use `<script setup>` syntax exclusively
- **Use Tailwind CSS**: Apply utility classes for all styling
- **Add proper error handling**: Implement loading states and error boundaries
- **Add internationalization**: Use i18n keys for all user-facing text

#### 6. Update Routing & Navigation
- **Add routes**: Update `src/router/` configuration
- **Update navigation**: Add menu items, breadcrumbs as needed
- **Add icons**: Create SVG components in `src/icons/` and export in index

### ✅ Mandatory Checklist for Every Feature

Before completing any feature development, verify:
- [ ] All new types are properly organized in `src/types/` structure
- [ ] API services use centralized type imports: `import type { } from '@/types'`
- [ ] Components use `<script setup lang="ts">` with proper TypeScript
- [ ] All user-facing text uses i18n translation keys
- [ ] Tailwind CSS classes used for all styling (no custom CSS unless necessary)
- [ ] Error handling and loading states implemented
- [ ] Component props and emits properly typed with `defineProps` and `defineEmits`
- [ ] Pinia stores used for shared state (no prop drilling)
- [ ] Components are modular and reusable
- [ ] Code follows project naming conventions (PascalCase components, camelCase functions)
- [ ] Arrow functions used whenever possible for consistency

### 🎨 Code Style & Conventions

#### Component Structure
```vue
<template>
  <!-- Use semantic HTML with Tailwind classes -->
  <div class="flex items-center justify-between p-4">
    <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
      {{ $t('admin.title') }}
    </h1>
  </div>
</template>

<script setup lang="ts">
// Always use Composition API with <script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AdminData } from '@/types'

// Props with proper typing
interface Props {
  admin: AdminData
  isEditing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false
})

// Emits with proper typing
interface Emits {
  update: [admin: AdminData]
  cancel: []
}

const emit = defineEmits<Emits>()

// Composables
const { t } = useI18n()

// Reactive state
const isLoading = ref(false)

// Computed properties (use arrow functions)
const displayName = computed(() => `${props.admin.firstName} ${props.admin.lastName}`)

// Methods (use arrow functions)
const handleSave = async () => {
  isLoading.value = true
  try {
    // Implementation
    emit('update', props.admin)
  } catch (error) {
    // Error handling
  } finally {
    isLoading.value = false
  }
}
</script>
```

#### State Management Pattern
```typescript
// stores/admin.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminData, CreateAdminRequest } from '@/types'
import { adminService } from '@/services/admin.service'

export const useAdminStore = defineStore('admin', () => {
  // State
  const admins = ref<AdminData[]>([])
  const isLoading = ref(false)
  
  // Getters
  const activeAdmins = computed(() => 
    admins.value.filter(admin => admin.status === 'active')
  )
  
  // Actions
  const fetchAdmins = async () => {
    isLoading.value = true
    try {
      const response = await adminService.getAdmins()
      admins.value = response.data
    } catch (error) {
      // Handle error with toast notification
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    // State
    admins,
    isLoading,
    // Getters
    activeAdmins,
    // Actions  
    fetchAdmins
  }
})
```

#### API Service Pattern
```typescript
// services/admin.service.ts
import { apiService } from './api'
import type { AdminData, CreateAdminRequest, PaginatedResponse } from '@/types'

class AdminService {
  /**
   * Get all administrators with optional filtering
   */
  async getAdmins(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<PaginatedResponse<AdminData>> {
    return await apiService.get('/admins', { params })
  }

  /**
   * Create a new administrator
   */
  async createAdmin(data: CreateAdminRequest): Promise<AdminData> {
    return await apiService.post('/admins', data)
  }

  /**
   * Update an existing administrator
   */
  async updateAdmin(id: string, data: Partial<AdminData>): Promise<AdminData> {
    return await apiService.put(`/admins/${id}`, data)
  }
}

export const adminService = new AdminService()
```

### 🌐 Internationalization (i18n)

Organize translation keys by modules:

```typescript
// i18n/locales/en/admins.json
{
  "title": "Administrator Management",
  "createAdmin": "Create Administrator", 
  "actions": {
    "edit": "Edit",
    "delete": "Delete",
    "activate": "Activate",
    "deactivate": "Deactivate"
  },
  "form": {
    "firstName": "First Name",
    "lastName": "Last Name", 
    "email": "Email Address",
    "role": "Role"
  },
  "messages": {
    "createSuccess": "Administrator created successfully",
    "updateSuccess": "Administrator updated successfully",
    "deleteConfirm": "Are you sure you want to delete this administrator?"
  }
}
```

Usage in components:
```vue
<template>
  <h1>{{ $t('admins.title') }}</h1>
  <button @click="handleCreate">
    {{ $t('admins.createAdmin') }}
  </button>
</template>
```

### 🚨 Important Development Rules

**Always:**
- Use TypeScript for all new files
- Follow Vue 3 Composition API patterns (`<script setup>`)
- Use Tailwind CSS utility classes for styling
- Implement proper error handling and loading states
- Use i18n keys for all user-facing text
- Use arrow functions for consistency
- Type all component props and emits

**Never:**
- Use Vue 2 Options API syntax
- Write custom CSS instead of Tailwind utilities
- Skip error handling or loading states
- Hardcode text strings
- Use prop drilling instead of Pinia stores
- Use regular function expressions when arrow functions work

## � Authentication System

The HiveSpace Admin Portal uses **OpenID Connect (OIDC)** for enterprise-level authentication and authorization. The authentication system is built around the `user-manager.ts` module and provides secure, token-based authentication with role-based access control.

### 🏗️ Authentication Architecture

**OIDC Integration**: Uses `oidc-client-ts` library for standards-compliant OpenID Connect implementation.

**Key Components**:
- **`src/auth/user-manager.ts`** - Core authentication logic and OIDC configuration
- **`src/types/app-user.ts`** - User type definitions with role-based methods
- **`src/stores/auth.store.ts`** - Authentication state management (if present)
- **`src/router/index.ts`** - Route guards and authentication middleware

### �🔧 OIDC Configuration

The authentication system is configured through environment variables and the centralized config system:

**Environment Variables Required**:
```env
# OIDC Client Configuration
VITE_APP_CLIENT_ID=your-oidc-client-id
VITE_AUTH_CALLBACK_URL=http://localhost:5173/auth/callback
VITE_APP_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_APP_POST_LOGOUT_REDIRECT_URI=http://localhost:5173

# Advanced OIDC Settings (Optional)
VITE_APP_RESPONSE_TYPE=code
VITE_APP_RESPONSE_MODE=query
VITE_APP_SCOPE=openid profile email
# Silent renew removed
The previous iframe-based "silent renew" token refresh flow has been removed from this project.
If you relied on automatic silent renew, migrate to a server-side refresh-token flow or other token rotation strategy.
```

**OIDC Settings** (from `user-manager.ts`):
```typescript
const oidcSettings = {
  authority: config.api.baseUrl + '/identity',        // Identity server endpoint
  client_id: config.auth.oidc.clientId,              // OIDC client ID
  redirect_uri: config.auth.oidc.redirectUri,        // Login callback URL
  response_type: config.auth.oidc.responseType,      // OAuth2 response type
  scope: config.auth.oidc.scope,                     // Requested scopes
  post_logout_redirect_uri: config.auth.oidc.postLogoutRedirectUri,
  response_mode: config.auth.oidc.responseMode,      // How to receive tokens
  // automaticSilentRenew and silent_redirect_uri have been removed from the default configuration.
  // Token rotation should be handled via refresh tokens or a backend session proxy.
  userStore: new WebStorageStateStore({ store: window.localStorage })
}
```

### 👤 User Types & Role Management

**AppUser Interface** (extends OIDC User):
```typescript
export interface AppUser extends User {
  isSystemAdmin: () => boolean    // Check if user is system administrator
  isAdmin: () => boolean          // Check if user is regular admin
  isSeller: () => boolean         // Check if user is seller/merchant
}
```

**Role-Based Methods**:
```typescript
// Usage in components
const user = await getCurrentUser()
if (user?.isSystemAdmin()) {
  // System admin functionality
} else if (user?.isAdmin()) {
  // Regular admin functionality
} else if (user?.isSeller()) {
  // Seller functionality
}
```

### 🔑 Authentication Functions

The `user-manager.ts` exports these key functions:

#### Core Authentication
```typescript
import { 
  getCurrentUser, 
  login, 
  logout, 
  getUser, 
  handleLoginCallback 
} from '@/auth/user-manager'

// Get current authenticated user
const user = await getCurrentUser() // Returns AppUser | null

// Initiate login flow (redirects to identity provider)
await login()

// Initiate logout flow (redirects to logout page)
await logout()

// Handle login callback (call this on the callback route)
const user = await handleLoginCallback()
```

#### Component Usage Example
```vue
<template>
  <div v-if="user">
    <h1>Welcome, {{ user.profile?.name }}</h1>
    <button v-if="user.isAdmin()" @click="openAdminPanel">
      Admin Panel
    </button>
    <button @click="handleLogout">Sign Out</button>
  </div>
  <div v-else>
    <button @click="handleLogin">Sign In</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCurrentUser, login, logout } from '@/auth/user-manager'
import type { AppUser } from '@/types/app-user'

const user = ref<AppUser | null>(null)

onMounted(async () => {
  user.value = await getCurrentUser()
})

const handleLogin = () => login()
const handleLogout = () => logout()
</script>
```

### 🛡️ Route Guards & Protection

**Router Integration** (from `router/index.ts`):
```typescript
import userManager from '@/auth/user-manager'
import { login } from '@/auth/user-manager'

router.beforeEach(async (to, from, next) => {
  // Skip authentication for callback route
  if (to.path === '/callback') {
    next()
    return
  }
  
  // Check if user is authenticated
  const user = await userManager.getUser()
  if (!user) {
    login() // Redirect to login if not authenticated
    return
  }
  
  next()
})
```

**Protected Route Example**:
```typescript
// In router configuration
{
  path: '/admin',
  component: AdminDashboard,
  meta: { 
    requiresAuth: true,
    requiresRole: 'Admin' // Custom meta for role checking
  },
  beforeEnter: async (to, from, next) => {
    const user = await getCurrentUser()
    if (user?.isAdmin() || user?.isSystemAdmin()) {
      next()
    } else {
      // Redirect to unauthorized page or show error
      next('/unauthorized')
    }
  }
}
```

### 🔄 Token Management

**Automatic Token Renewal**:
- Configured via `automaticSilentRenew: true` in OIDC settings
- Uses silent iframe renewal to refresh tokens before expiration
- Handles token refresh transparently without user interaction

**Storage**:
- Uses `localStorage` for token storage (configurable)
- Tokens are automatically included in API requests via Axios interceptors

**API Integration** (from `services/api.ts`):
```typescript
// Axios request interceptor automatically adds auth token
apiClient.interceptors.request.use(async (config) => {
  const user = await getCurrentUser()
  if (user?.access_token) {
    config.headers.Authorization = `Bearer ${user.access_token}`
  }
  return config
})

// Axios response interceptor handles 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      login() // Redirect to login on unauthorized
    }
    return Promise.reject(error)
  }
)
```

### 🔧 Development & Testing

**Testing Authentication Locally**:
```bash
# 1. Ensure your identity server is running
# 2. Configure environment variables correctly
# 3. Start the development server
npm run dev

# 4. Navigate to protected route - should redirect to login
# 5. After login, should redirect back to the application
```

**Debugging Authentication Issues**:
```typescript
// Enable debug logging in development
import userManager from '@/auth/user-manager'

// Log user state
userManager.getUser().then(user => {
  console.log('Current user:', user)
  console.log('Is expired:', user?.expired)
  console.log('Access token:', user?.access_token)
})

// Listen to user events
userManager.events.addUserLoaded(user => {
  console.log('User loaded:', user)
})

userManager.events.addUserUnloaded(() => {
  console.log('User unloaded')
})

userManager.events.addAccessTokenExpired(() => {
  console.log('Access token expired')
})
```

### 🔐 Security Best Practices

**Configuration Security**:
- Never commit client secrets to version control
- Use different OIDC clients for different environments
- Configure appropriate redirect URIs in identity provider
- Use HTTPS in production environments

**Token Security**:
- Tokens are automatically included in API requests
- Short-lived access tokens with refresh capability
- Silent renewal prevents interruption of user experience
- Automatic logout on token expiration

**Role-Based Access**:
- Always verify user roles on both client and server
- Use TypeScript for compile-time role checking
- Implement route guards for sensitive pages
- Check permissions before showing UI elements

### 🚨 Common Authentication Issues

**"User not authenticated" errors**:
- Check if identity server is accessible
- Verify OIDC client configuration
- Ensure redirect URIs match exactly
- Check browser console for OIDC errors

**Infinite redirect loops**:
- Verify callback URL configuration
- Check if `/callback` route is properly handled
- Ensure identity server is returning to correct URL

**Token expiration issues**:
- Enable `automaticSilentRenew` for seamless token refresh
- Handle token expiration gracefully in API calls
- Implement proper error handling for expired tokens

### 📚 Authentication Documentation

For more details on OIDC implementation:
- [oidc-client-ts Documentation](https://github.com/authts/oidc-client-ts)
- [OpenID Connect Specification](https://openid.net/connect/)
- Project-specific authentication configuration in `src/config/`

## 🔧 Common Development Tasks

### Adding New Components

**1. Reusable UI Components** (`src/components/`):
```bash
# Create a new form component
src/components/forms/AdminForm.vue
src/components/forms/UserForm.vue

# Create a new table component  
src/components/tables/AdminTable.vue
```

**2. Page-Level Components** (`src/pages/`):
```bash
# Create a new page/view
src/pages/Reports/Analytics.vue
src/pages/Settings/SystemConfig.vue
```

### Adding New API Endpoints

**1. Create Service Method** (`src/services/`):
```typescript
// services/report.service.ts
class ReportService {
  async getAnalytics(dateRange: DateRange): Promise<AnalyticsData> {
    return await apiService.get('/reports/analytics', { 
      params: { startDate: dateRange.start, endDate: dateRange.end }
    })
  }
}

export const reportService = new ReportService()
```

**2. Add Types** (`src/types/api/`):
```typescript
// types/api/reports.ts
export interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  revenue: number
  // ... other fields
}

export interface DateRange {
  start: string
  end: string
}
```

**3. Update Store** (`src/stores/`):
```typescript
// stores/reports.ts
export const useReportsStore = defineStore('reports', () => {
  const analytics = ref<AnalyticsData | null>(null)
  
  const fetchAnalytics = async (dateRange: DateRange) => {
    analytics.value = await reportService.getAnalytics(dateRange)
  }
  
  return { analytics, fetchAnalytics }
})
```

### Adding Authentication-Protected Features

**1. Create Protected Component**:
```vue
<template>
  <div v-if="canAccess">
    <!-- Protected content -->
    <AdminPanel />
  </div>
  <div v-else>
    <UnauthorizedMessage />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getCurrentUser } from '@/auth/user-manager'
import type { AppUser } from '@/types/app-user'

const user = ref<AppUser | null>(null)

onMounted(async () => {
  user.value = await getCurrentUser()
})

const canAccess = computed(() => 
  user.value?.isAdmin() || user.value?.isSystemAdmin()
)
</script>
```

**2. Add Role-Based Route Guard**:
```typescript
// router/admin-routes.ts
{
  path: '/admin/users',
  component: UserManagement,
  beforeEnter: async (to, from, next) => {
    const user = await getCurrentUser()
    if (user?.isSystemAdmin()) {
      next()
    } else {
      next('/unauthorized')
    }
  }
}
```

### Working with Authentication State

**1. Using Authentication in Stores**:
```typescript
// stores/secure-data.ts
import { getCurrentUser } from '@/auth/user-manager'

export const useSecureDataStore = defineStore('secureData', () => {
  const fetchSecureData = async () => {
    const user = await getCurrentUser()
    if (!user?.isAdmin()) {
      throw new Error('Insufficient permissions')
    }
    
    // Fetch admin-only data
    return await apiService.get('/admin/secure-data')
  }
  
  return { fetchSecureData }
})
```

**2. Reactive Authentication Status**:
```vue
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import userManager, { getCurrentUser } from '@/auth/user-manager'
import type { AppUser } from '@/types/app-user'

const user = ref<AppUser | null>(null)
const isAuthenticated = computed(() => !!user.value)

onMounted(async () => {
  user.value = await getCurrentUser()
  
  // Listen for authentication events
  userManager.events.addUserLoaded((newUser) => {
    user.value = toAppUser(newUser)
  })
  
  userManager.events.addUserUnloaded(() => {
    user.value = null
  })
})
</script>
```

### Adding New Icons

**1. Add SVG Component** (`src/icons/`):
```vue
<!-- icons/ReportIcon.vue -->
<template>
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- SVG content -->
  </svg>
</template>
```

**2. Export in Index** (`src/icons/index.ts`):
```typescript
import ReportIcon from './ReportIcon.vue'

export {
  // ... other icons
  ReportIcon
}
```

### Adding New Routes

**Update Router Configuration** (`src/router/`):
```typescript
// router/index.ts
{
  path: '/reports',
  name: 'Reports',
  component: () => import('@/pages/Reports/Analytics.vue'),
  meta: { requiresAuth: true }
}
```

### Adding Translation Keys

**Add to Locale Files** (`src/i18n/locales/`):
```json
// locales/en/reports.json
{
  "title": "Reports & Analytics",
  "analytics": "Analytics Dashboard",
  "dateRange": "Date Range",
  "export": "Export Data"
}
```

### Using Toast Notifications

**Success/Error Messages**:
```typescript
import { useAppStore } from '@/stores/app.store'

const appStore = useAppStore()

// Success notification
appStore.notifySuccess('Success!', 'Data saved successfully.')

// Error notification  
appStore.notifyError('Error!', 'Failed to save data.')

// Info notification
appStore.notifyInfo('Info', 'Processing your request...')
```

### Working with Modals

**Using Composables**:
```typescript
import { useModal } from '@/composables/useModal'
import { useConfirmModal } from '@/composables/useConfirmModal'

// Basic modal
const { isOpen, openModal, closeModal } = useModal()

// Confirmation modal
const { confirm } = useConfirmModal()

const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Delete Admin',
    message: 'Are you sure you want to delete this administrator?',
    confirmText: 'Delete',
    cancelText: 'Cancel'
  })
  
  if (confirmed) {
    // Perform delete operation
  }
}
```

## 🔍 Debugging & Troubleshooting

### Development Server Issues

**Port Already in Use**:
- Vite automatically tries port 5174 if 5173 is busy
- Check console output for the actual port being used

**Build Failures**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run dev -- --force
```

### TypeScript Issues

**Missing Type Declarations**:
```typescript
// Add to src/vue.shims.d.ts if needed
declare module 'some-package' {
  // Add type declarations
}
```

**Strict Type Checking**:
- Use `// @ts-ignore` sparingly for legacy code
- Prefer proper typing over disabling checks

### ESLint/Prettier Conflicts

**Auto-fix Most Issues**:
```bash
npm run lint  # Fixes auto-fixable issues
npm run format  # Formats code with Prettier
```

### Environment Variable Issues

**Variables Not Loading**:
- Ensure variables are prefixed with `VITE_`
- Check `.env` file is in project root
- Restart development server after changes

### Common Error Solutions

**"Cannot find module '@/components/..'"**:
- Check path alias configuration in `vite.config.ts`
- Ensure component file exists and is properly exported

**"Property does not exist on type"**:
- Add proper TypeScript interfaces
- Check import statements
- Verify component props are properly typed

## 📚 Additional Resources

### Project Documentation
- `memory-bank/` - Project memory bank with patterns and conventions
- `AGENTS.md` - Detailed agent instructions and guidelines
- `src/config/README.md` - Configuration system guide

### External Documentation
- [Vue 3 Documentation](https://vuejs.org/guide/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Development Tools
- [Vue DevTools](https://devtools.vuejs.org/) - Browser extension for debugging
- [Volar Extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - VSCode support for Vue 3
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) - VSCode extension for Tailwind

## 🤝 Contributing

### Before Making Changes
1. Run `npm install` to ensure dependencies are current
2. Start with `npm run dev` to verify current functionality  
3. Use `npm run lint` to check for immediate code quality issues
4. Make incremental changes and test frequently

### Validation Checklist
- [ ] `npm run lint` passes (or only expected failures)
- [ ] `npm run type-check` compiles (expect known failures)
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts without errors
- [ ] New features follow the Feature Development Workflow
- [ ] All user-facing text uses i18n translation keys
- [ ] Components are properly typed with TypeScript
- [ ] Error handling and loading states are implemented

### Code Quality Standards
- **TypeScript**: All new code must be written in TypeScript
- **Vue 3**: Use Composition API with `<script setup>` syntax
- **Styling**: Use Tailwind CSS utility classes
- **State Management**: Use Pinia stores for shared state
- **Testing**: Manual testing required (no automated tests currently)
- **Documentation**: Update README.md and relevant docs for significant changes

## 📄 License & Credits

This project is built upon the TailAdmin template and customized for HiveSpace platform operations.

**Technology Credits:**
- Vue.js Team for the Vue 3 framework
- TailAdmin for the initial dashboard template
- Tailwind Labs for Tailwind CSS
- All open-source contributors and maintainers

---

**Happy Coding! 🚀**

For questions or support, please refer to the project documentation or contact the development team.
