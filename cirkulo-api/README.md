# Cirkulo API

API backend for Cirkulo built with Hono.js, OpenAPI, and Bun.

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env

# Start database (Docker)
bun run docker:up

# Run database migrations
bun run db:push

# Run development server
bun run dev
```

Visit http://localhost:8000/swagger for interactive API documentation.

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs) folder:

- **[Getting Started](./docs/GETTING_STARTED.md)** - Setup, installation, and first steps
- **[Database Guide](./docs/DATABASE.md)** - Database setup, migrations, and queries
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
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[OpenAPI 3.1](https://swagger.io/specification/)** - API specification
- **[Zod](https://zod.dev/)** - Schema validation
- **[Bun](https://bun.sh/)** - JavaScript runtime and package manager
- **[Docker](https://www.docker.com/)** - Containerization
- **JWT** - Authentication

## 📁 Project Structure

```
cirkulo-api/
├── src/
│   ├── index.ts         # Main app entry, Swagger setup
│   ├── db/              # Database configuration
│   │   ├── index.ts     # Database connection
│   │   ├── schema.ts    # Drizzle schema
│   │   └── migrations/  # Migration files
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
│   ├── DATABASE.md
│   ├── API_STANDARDS.md
│   └── EXAMPLES.md
├── docker-compose.yml   # Docker services
├── Dockerfile           # Container definition
├── drizzle.config.ts    # Drizzle ORM config
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

# Database commands
bun run db:generate    # Generate migrations
bun run db:migrate     # Run migrations
bun run db:push        # Push schema (dev)
bun run db:studio      # Open Drizzle Studio

# Docker commands
bun run docker:up      # Start containers
bun run docker:down    # Stop containers
bun run docker:logs    # View logs
```

## 🔑 Environment Variables

- `RESEND_API_KEY` - Resend API key for email
- `FROM_EMAIL` - Verified sender email address
- `APP_URL` - Application URL for invite links
- `DATABASE_URL` - PostgreSQL connection string

See `.env.example` for all available variables.

## 📖 Learn More

- **New to the project?** Start with [Getting Started](./docs/GETTING_STARTED.md)
- **Building features?** Check [API Standards](./docs/API_STANDARDS.md) and [Examples](./docs/EXAMPLES.md)
- **Need help?** See the [docs/](./docs) folder

---

Built with ❤️ for EthOnline 2025
