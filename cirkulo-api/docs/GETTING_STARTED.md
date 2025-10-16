# Getting Started with Cirkulo API

Welcome to the Cirkulo API! This guide will help you get up ## 📦 Tech Stack

This API uses:

- **[Hono](https://hono.dev/)**: Lightweight, fast web framework
- **[Drizzle ORM](https://orm.drizzle.team/)**: TypeScript ORM for PostgreSQL
- **[PostgreSQL](https://www.postgresql.org/)**: Robust relational database
- **[OpenAPI 3.1](https://swagger.io/specification/)**: API specification standard
- **[Zod](https://zod.dev/)**: Schema validation and TypeScript type inference
- **[Swagger UI](https://swagger.io/tools/swagger-ui/)**: Interactive API documentation
- **[Bun](https://bun.sh/)**: Fast JavaScript runtime and package manager
- **[Docker](https://www.docker.com/)**: Containerization for consistent environmentsng quickly.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Set Up Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration values, including the database connection string.

### 3. Set Up Database

You can run the database either with Docker (recommended) or locally.

#### Option A: Using Docker (Recommended)

Start PostgreSQL with Docker Compose:

```bash
bun run docker:up
```

This will start a PostgreSQL database on `localhost:5432`.

#### Option B: Local PostgreSQL

If you have PostgreSQL installed locally, ensure it's running and create a database:

```bash
createdb cirkulo
```

Update `DATABASE_URL` in your `.env` file accordingly.

### 4. Run Database Migrations

Generate and run migrations:

```bash
# Generate migration files from schema
bun run db:generate

# Apply migrations to database
bun run db:migrate
```

Or use push for development (syncs schema without migrations):

```bash
bun run db:push
```

### 5. Start Development Server

```bash
bun run dev
```

The API will be available at `http://localhost:8000`

### 6. Access Database Studio (Optional)

Drizzle Studio provides a web-based database browser:

```bash
bun run db:studio
```

Visit the URL shown in the terminal to explore your database.

### 7. Access API Documentation

Once the server is running:

- **Swagger UI**: http://localhost:8000/swagger
  - Interactive API documentation
  - Test endpoints directly in your browser
  
- **OpenAPI JSON**: http://localhost:8000/doc
  - Raw OpenAPI specification
  - Import into Postman, Insomnia, etc.

---

## � Tech Stack

This API uses:

- **[Hono](https://hono.dev/)**: Lightweight, fast web framework
- **[OpenAPI 3.1](https://swagger.io/specification/)**: API specification standard
- **[Zod](https://zod.dev/)**: Schema validation and TypeScript type inference
- **[Swagger UI](https://swagger.io/tools/swagger-ui/)**: Interactive API documentation
- **[Bun](https://bun.sh/)**: Fast JavaScript runtime and package manager

---

## 🔗 Available Endpoints

### Documentation Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /swagger` | Swagger UI - Interactive API documentation |
| `GET /doc` | OpenAPI JSON specification |

### API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | GET | Health check | No |
| `/api/auth/validate` | GET | Validate JWT token | Yes |

---

## 🧪 Testing the API

### Using Swagger UI (Recommended)

1. Open http://localhost:8000/swagger
2. Find the endpoint you want to test
3. Click "Try it out"
4. Fill in parameters/body
5. For protected endpoints:
   - Click the 🔒 "Authorize" button at the top
   - Enter your JWT token (without "Bearer" prefix)
   - Click "Authorize"
6. Click "Execute" to test the endpoint

### Using cURL

```bash
# Health check
curl http://localhost:8000/

# Validate JWT (replace YOUR_TOKEN)
curl http://localhost:8000/api/auth/validate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman/Insomnia

1. Import the OpenAPI spec from http://localhost:8000/doc
2. All endpoints will be automatically configured
3. Add your JWT token to Authorization header

---

## 🔑 Authentication

This API uses **JWT (JSON Web Tokens)** with Bearer authentication.

### How to Use JWT Tokens

1. **Get a token** from your authentication provider
2. **Add to requests** via the `Authorization` header:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```
3. **In Swagger UI**: Click "Authorize" and paste your token

### Protected Endpoints

Endpoints requiring authentication will show a 🔒 icon in Swagger UI and return `401 Unauthorized` if the token is missing or invalid.

---

## 📝 Next Steps

Now that you're set up, here's what to explore next:

### For Users
- 📖 **Try the API**: Use Swagger UI to explore all endpoints
- 🧪 **Test endpoints**: Use the interactive documentation
- 📋 **Review responses**: See what data each endpoint returns

### For Developers
- 📖 **Read [API_STANDARDS.md](./API_STANDARDS.md)**: Learn our development standards
- 💡 **See [EXAMPLES.md](./EXAMPLES.md)**: Copy-paste ready code examples
- 🏗️ **Build endpoints**: Follow the patterns in existing code
- 📚 **Check [README.md](./README.md)**: Documentation overview

---

## 🛠️ Development Commands

```bash
# Start development server with hot reload
bun run dev

# Run linter
bun run lint

# Format code
bun run format

# Format and fix
bun run format:write

# Check and fix code style
bun run check:write

# Database commands
bun run db:generate    # Generate migrations from schema
bun run db:migrate     # Run migrations
bun run db:push        # Push schema changes (dev only)
bun run db:studio      # Open Drizzle Studio

# Docker commands
bun run docker:up      # Start Docker containers
bun run docker:down    # Stop Docker containers
bun run docker:logs    # View Docker logs
```

---

## 🎨 Project Structure

```
cirkulo-api/
├── src/
│   ├── index.ts           # Main app entry, Swagger setup
│   ├── db/                # Database configuration
│   │   ├── index.ts       # Database connection
│   │   ├── schema.ts      # Database schema (Drizzle)
│   │   └── migrations/    # Migration files
│   ├── routes/            # API route handlers
│   │   ├── index.ts       # Routes aggregator
│   │   └── auth.ts        # Auth endpoints
│   ├── schemas/           # OpenAPI schemas (Zod)
│   │   └── auth.ts        # Auth schemas
│   └── lib/               # Shared utilities
│       └── auth.ts        # Auth helpers
├── docs/                  # Documentation
│   ├── README.md          # Documentation overview
│   ├── GETTING_STARTED.md # This file
│   ├── API_STANDARDS.md   # Development standards
│   └── EXAMPLES.md        # Code examples
├── docker-compose.yml     # Docker services
├── Dockerfile             # Container definition
├── drizzle.config.ts      # Drizzle ORM config
├── package.json
└── tsconfig.json
```

---

## 🔒 Security Best Practices

When working with this API:

- ✅ **Never commit** `.env` files or tokens to git
- ✅ **Use environment variables** for sensitive data
- ✅ **Validate JWT tokens** on protected endpoints
- ✅ **Use HTTPS** in production
- ✅ **Rotate tokens** regularly
- ✅ **Log security events** for monitoring

## 📚 External Resources

- [Hono Documentation](https://hono.dev/)
- [Hono OpenAPI Guide](https://hono.dev/guides/zod-openapi)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Drizzle Kit CLI](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Zod Documentation](https://zod.dev/)
- [OpenAPI 3.1 Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Bun Documentation](https://bun.sh/docs)
- [Docker Documentation](https://docs.docker.com/)

---

## 🆘 Need Help?

- 📖 Check the [docs/](.) folder for detailed guides
- 💬 Ask the team in #dev-api channel
- 🐛 Report issues in the project repository

---

**Ready to build?** Head over to [API_STANDARDS.md](./API_STANDARDS.md) to learn how to create new endpoints! 🚀
