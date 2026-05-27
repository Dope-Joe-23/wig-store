# Affordable Hair and More — Wig & Beauty E-Commerce Platform

A premium, mobile-first luxury wig and beauty commerce platform built with modern web technologies.

## Project Structure

```
wig-store/
├── backend/          # Django REST API
├── frontend/         # Vite + React + TypeScript
└── docs/            # Documentation
```

## Stack

### Frontend
- Vite
- React 18
- TypeScript (strict mode)
- Tailwind CSS
- Framer Motion
- React Router
- React Query (TanStack Query)
- Zustand
- React Hook Form
- Zod validation

### Backend
- Django
- Django REST Framework
- PostgreSQL
- Redis
- Celery
- JWT Authentication

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Development

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture decisions and guidelines.

## License

Proprietary — Affordable Hair and More 2024
