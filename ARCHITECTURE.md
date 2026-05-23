# PHASE 1: PROJECT SETUP & ARCHITECTURE

## Overview

This document outlines the architectural decisions made during Phase 1 of the Wiggle e-commerce platform.

---

## BACKEND ARCHITECTURE

### Framework & Stack

**Django 4.2 + Django REST Framework**

- **Why Django?**
  - Mature, battle-tested ecosystem
  - Built-in admin dashboard (powerful for product management)
  - Excellent ORM for complex database queries
  - Strong security features (CSRF, XSS, SQL injection protection)
  - Comprehensive authentication and permissions system

**PostgreSQL**

- Chosen over SQLite for production-grade data integrity
- Supports advanced indexing and complex queries
- Better performance for e-commerce-scale operations
- Concurrent write capabilities

**Redis + Celery**

- Redis: Caching, session storage, background job queue
- Celery: Async task processing (email, order updates, analytics)

**JWT Authentication (SimpleJWT)**

- Stateless token-based auth for API
- Enables scalability without session stickiness
- Better for mobile and distributed systems

### App Structure

```
backend/apps/
├── users/          # Authentication, profiles, addresses, wishlists
├── products/       # Product catalog, categories, variants, media
├── orders/         # Order creation, order items
├── payments/       # Payment processing, transaction tracking
├── shipping/       # Shipping methods, tracking, shipments
├── analytics/      # Store analytics, page views, product views
└── reviews/        # Product reviews and ratings
```

**Architecture Principles:**

1. **Modular Design** — Each feature is self-contained with its own models, serializers, views, and URLs
2. **Separation of Concerns** — Business logic separate from API layer
3. **RESTful Conventions** — Standard HTTP methods for CRUD operations
4. **Scalability** — Apps can be horizontally scaled independently

### API Endpoints Structure

```
/api/v1/
├── auth/
│   ├── users/
│   ├── token/
│   └── users/me/
├── products/
│   ├── /
│   ├── /{slug}/
│   ├── /categories/
│   ├── /featured/
│   ├── /trending/
│   └── /new_arrivals/
├── orders/
│   ├── /
│   └── /{id}/
├── payments/
│   └── /
├── shipping/
│   ├── /methods/
│   └── /shipments/
├── reviews/
│   └── /
└── analytics/
    ├── /overview/
    ├── /page-views/
    └── /product-views/
```

### Database Design

**Key Decisions:**

1. **Foreign Keys with CASCADE/PROTECT** — Prevents orphaned data
2. **Indexing on Performance-Critical Fields** — category, slug, created_at, is_featured
3. **JSONField for Flexible Product Attributes** — Future extensibility
4. **Denormalized Fields (rating, review_count)** — Performance optimization
5. **Soft Deletes Not Used** — Hard deletes with careful PROTECT constraints instead

### Security Implementation

- CORS properly configured (frontend-only origins)
- JWT expiry with refresh tokens
- Rate limiting on API endpoints
- Input validation with Django validators
- SQL injection protection via ORM
- CSRF protection enabled
- Secure password hashing (Django default: PBKDF2)

---

## FRONTEND ARCHITECTURE

### Framework & Stack

**Vite + React 18 + TypeScript (Strict)**

- **Why Vite?**
  - ~10x faster dev startup than Webpack
  - Native ESM support for instant HMR
  - Optimized production builds
  - Smaller bundle sizes

- **Why React?**
  - Component-based architecture
  - Virtual DOM efficiency
  - Massive ecosystem and community
  - Excellent for complex UIs

- **Why TypeScript (Strict)?**
  - Type safety catches bugs at compile time
  - Better IDE support and autocomplete
  - Self-documenting code
  - Enforces strict mode for max safety

**Tailwind CSS**

- Utility-first CSS framework
- Reduced CSS bundle size
- Consistent design system
- Rapid UI development
- Built-in responsive utilities

**Framer Motion**

- Smooth, performant animations
- Used subtly for:
  - Page transitions
  - Hover states
  - Modal animations
  - Product reveals
- Zero compromise on performance

**TanStack Query (React Query)**

- Powerful server state management
- Automatic caching and refetching
- Background sync
- Perfect for e-commerce data fetching

**Zustand**

- Lightweight global state (alternative to Redux)
- Used for:
  - Cart state (persistent)
  - Auth state
  - UI preferences
- Minimal boilerplate, maximum clarity

**React Router v6**

- File-based routing concepts
- Nested routes support
- Standard navigation
- Excellent TypeScript support

### Folder Structure

```
frontend/src/
├── components/
│   ├── layout/           # Navbar, Footer, Layout wrapper
│   ├── products/         # Product cards, galleries
│   ├── common/           # Buttons, modals, spinners
│   └── forms/            # Form components (future)
├── pages/                # Route-level components
├── hooks/                # Custom React hooks
│   ├── useProducts.ts
│   └── useReviews.ts
├── services/             # API client and methods
│   ├── api.ts           # Axios instance with interceptors
│   ├── products.ts
│   ├── auth.ts
│   └── orders.ts
├── stores/               # Zustand stores
│   ├── cartStore.ts
│   └── authStore.ts
├── types/                # TypeScript interfaces
│   └── index.ts
├── utils/                # Helper functions
│   └── helpers.ts
├── App.tsx               # Root component with routing
├── main.tsx              # Entry point
└── index.css             # Global styles + Tailwind
```

**Design Principles:**

1. **Feature-Based Organization** — Easy to locate related code
2. **Separation of Concerns** — Components, logic, state, API clearly separated
3. **Reusability** — Shared components in `components/common/`
4. **Type Safety** — All data flows typed via TypeScript interfaces
5. **Performance** — Code splitting via route-based chunking (Vite automatic)

### State Management Strategy

**Zustand for Global UI State**

```typescript
// Lightweight, no boilerplate
const useCartStore = create((set) => ({
  items: [],
  addItem: (product, quantity) => { /* ... */ },
}))
```

**TanStack Query for Server State**

```typescript
// Automatic caching, refetching, background sync
const { data, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: () => productService.getProducts(),
})
```

**Benefits:**

- Clear separation: client state vs. server state
- No prop drilling
- Minimal re-renders
- Simple debugging
- Zero-runtime boilerplate with Zustand

### API Integration

**Axios Client with Interceptors**

```typescript
// Centralized instance with:
// - JWT token auto-injection
// - 401 redirect to login
// - Error handling
// - Base URL configuration
```

**Service Layer**

```typescript
// /services/products.ts
// All API calls in one place
export const productService = {
  getProducts: (params) => apiClient.get('/products/', { params }),
  getProductBySlug: (slug) => apiClient.get(`/products/${slug}/`),
  // ...
}
```

**Benefits:**

- Centralized error handling
- Easy testing (mock services)
- Consistent API interface
- Type-safe requests/responses

### Styling Approach

**Tailwind CSS + Utility Composing**

```css
/* Semantic utility classes */
.btn-primary { @apply px-6 py-3 bg-rose-nude text-ivory rounded-lg... }
.container-base { @apply max-w-7xl mx-auto px-4... }
.flex-between { @apply flex items-center justify-between; }
```

**Benefits:**

- No inline Tailwind clutter
- Consistent spacing and sizing
- Easy theme updates
- Performance: only used classes included in bundle

### Performance Optimizations

1. **Code Splitting** — Vite automatic per-route
2. **Lazy Loading** — React.lazy() for heavy components
3. **Image Optimization** — Cloudinary delivery with responsive sizing
4. **Caching** — TanStack Query with 5-minute staleTime
5. **Bundle Size** — Tree-shaking, minification, gzip compression

---

## DEPLOYMENT ARCHITECTURE

### Local Development

**Docker Compose** — PostgreSQL + Redis

```bash
docker-compose up -d
```

Enables consistent dev environments across the team.

### Environment Management

**Backend (.env)**
- DEBUG mode
- Secret keys
- Database credentials
- Redis URL
- JWT secrets
- External API keys (Paystack, Cloudinary, etc.)

**Frontend (.env)**
- API URL (changes per environment)
- Cloudinary cloud name
- Public API keys only

### CI/CD Ready

Structure supports GitHub Actions:
- Linting (backend + frontend)
- Testing (placeholder for Phase 2)
- Building (both static + Docker images)
- Deploying to Render

---

## SECURITY ARCHITECTURE

### Backend

1. **CORS** — Only frontend domains allowed
2. **JWT** — Stateless, time-expiring tokens
3. **Rate Limiting** — Per IP and per user
4. **Input Validation** — Zod schemas on frontend, Django validators on backend
5. **HTTPS Only** — Enforced in production
6. **CSRF Protection** — Enabled by default

### Frontend

1. **XSS Prevention** — React's built-in escaping
2. **Secure Token Storage** — localStorage (acceptable for JWT)
3. **No Secrets Hardcoded** — All via .env
4. **HTTPS Communication** — API calls encrypted in transit

---

## SCALABILITY CONSIDERATIONS

### Backend

- **Horizontal Scaling** — Stateless API design
- **Database Optimization** — Indexing strategy in place
- **Caching Layer** — Redis for high-traffic endpoints
- **Async Tasks** — Celery for background processing
- **CDN Ready** — Cloudinary for media delivery

### Frontend

- **Code Splitting** — Automatic per route
- **Lazy Loading** — Components load on demand
- **Service Worker Ready** — Structure supports PWA
- **Lighthouse Optimized** — Performance, accessibility, SEO

---

## NEXT STEPS (PHASE 2)

- Implement authentication endpoints (register, login, refresh)
- Add user models to Django admin
- Create management commands for seeding test data
- Set up GitHub Actions CI/CD pipeline
- Begin frontend authentication flow

