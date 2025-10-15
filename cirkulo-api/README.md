# Cirkulo API

API backend for Cirkulo built with Hono.js and Bun.

## Project Structure

```
src/
├── index.ts              # Main application entry point
├── lib/
│   └── auth.ts          # JWT validation helper functions
└── routes/
    ├── index.ts         # Routes aggregator
    └── auth.ts          # Authentication routes
```

## Setup

To install dependencies:
```sh
bun install
```

Set your Dynamic Environment ID:
```bash
export DYNAMIC_ENV_ID="your-env-id-here"
```

To run:
```sh
bun run dev
```

open http://localhost:3000

## API Endpoints

### Health Check
- `GET /` - API health check

### Authentication
- `GET /api/auth/validate` - Validate JWT token

## Adding New Routes

1. Create a new route file in `src/routes/`:
```typescript
// src/routes/example.ts
import { Hono } from 'hono'

const example = new Hono()

example.get('/', async (c) => {
  // Your logic here
  return c.json({ message: 'Example route' })
})

export default example
```

2. Import and mount in `src/routes/index.ts`:
```typescript
import example from './example'
routes.route('/example', example)
```

## Environment Variables

- `DYNAMIC_ENV_ID` - Your Dynamic Environment ID from the dashboard
