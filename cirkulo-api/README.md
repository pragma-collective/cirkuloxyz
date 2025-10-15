# Cirkulo API

API backend for Cirkulo built with Hono.js, OpenAPI, and Bun.

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env

# Run development server
bun run dev
```

Visit http://localhost:3000/swagger for interactive API documentation.

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs) folder:

- **[Getting Started](./docs/GETTING_STARTED.md)** - Setup, installation, and first steps
- **[API Standards](./docs/API_STANDARDS.md)** - Development standards and guidelines
- **[Examples](./docs/EXAMPLES.md)** - Copy-paste ready code examples
- **[Documentation Overview](./docs/README.md)** - Navigation and quick reference

## 🔗 Key Endpoints

| Endpoint | Description |
|----------|-------------|
| `/swagger` | Interactive API documentation (Swagger UI) |
| `/doc` | OpenAPI specification (JSON) |
| `/` | Health check |
| `/api/auth/validate` | JWT token validation |

## 🛠️ Tech Stack

- **[Hono](https://hono.dev/)** - Fast, lightweight web framework
- **[OpenAPI 3.1](https://swagger.io/specification/)** - API specification
- **[Zod](https://zod.dev/)** - Schema validation
- **[Bun](https://bun.sh/)** - JavaScript runtime and package manager
- **JWT** - Authentication

## 📁 Project Structure

```
cirkulo-api/
├── src/
│   ├── index.ts         # Main app entry, Swagger setup
│   ├── routes/          # API route handlers
│   │   ├── index.ts     # Routes aggregator
│   │   └── auth.ts      # Auth endpoints
│   ├── schemas/         # OpenAPI schemas (Zod)
│   │   └── auth.ts      # Auth schemas
│   └── lib/             # Shared utilities
│       └── auth.ts      # Auth helpers
├── docs/                # Documentation
│   ├── README.md        # Documentation overview
│   ├── GETTING_STARTED.md
│   ├── API_STANDARDS.md
│   └── EXAMPLES.md
├── package.json
└── tsconfig.json
```

## 🧑‍💻 Development

```bash
# Start dev server with hot reload
bun run dev

# Run linter
bun run lint

# Format code
bun run format:write

# Check and fix code style
bun run check:write
```

## 🔑 Environment Variables

- `DYNAMIC_ENV_ID` - Your Dynamic Environment ID from the dashboard

See `.env.example` for all available variables.

## 📖 Learn More

- **New to the project?** Start with [Getting Started](./docs/GETTING_STARTED.md)
- **Building features?** Check [API Standards](./docs/API_STANDARDS.md) and [Examples](./docs/EXAMPLES.md)
- **Need help?** See the [docs/](./docs) folder

---

Built with ❤️ for EthOnline 2025
