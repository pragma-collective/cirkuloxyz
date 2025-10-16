# Database Guide

This guide covers everything you need to know about working with the database in the Cirkulo API.

## 📚 Overview

The Cirkulo API uses:
- **PostgreSQL** as the database
- **Drizzle ORM** for type-safe database queries
- **Docker** for easy local development
- **Drizzle Kit** for schema migrations

---

## 🚀 Quick Start

### Start Database

```bash
# Using Docker (recommended)
bun run docker:up

# Check if it's running
bun run docker:logs
```

### Apply Schema

```bash
# Push schema changes directly (development)
bun run db:push

# OR generate and run migrations (production-ready)
bun run db:generate
bun run db:migrate
```

### Explore Data

```bash
# Open Drizzle Studio
bun run db:studio
```

---

## 🐘 PostgreSQL Setup

### Using Docker (Recommended)

The easiest way to get started:

```bash
# Start PostgreSQL container
bun run docker:up

# Stop it when you're done
bun run docker:down
```

**Connection Details:**
- Host: `localhost`
- Port: `5432`
- Database: `cirkulo`
- Username: `postgres`
- Password: `postgres`

### Local PostgreSQL

If you prefer a local installation:

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql@16
   brew services start postgresql@16
   
   # Ubuntu/Debian
   sudo apt install postgresql-16
   ```

2. **Create Database**
   ```bash
   createdb cirkulo
   ```

3. **Update `.env`**
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cirkulo
   ```

---

## 🗃️ Schema Management

### Defining Schema

Schemas are defined in `src/db/schema.ts` using Drizzle's declarative syntax:

```typescript
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### Common Column Types

```typescript
import { 
  pgTable, 
  text, 
  integer, 
  boolean, 
  timestamp, 
  uuid, 
  varchar,
  json,
  serial
} from "drizzle-orm/pg-core";

export const examples = pgTable("examples", {
  // Auto-incrementing ID
  id: serial("id").primaryKey(),
  
  // UUID (recommended for distributed systems)
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  
  // Text fields
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Numbers
  count: integer("count").default(0),
  
  // Boolean
  isActive: boolean("is_active").default(true),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  
  // JSON data
  metadata: json("metadata"),
});
```

### Relationships

```typescript
import { pgTable, text, uuid, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
});

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id),
});

// Define relations for easier querying
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));
```

---

## 🔄 Migrations

### Development Workflow

For rapid development, use `db:push`:

```bash
# Modify schema in src/db/schema.ts
# Then push changes directly
bun run db:push
```

⚠️ **Note**: `db:push` doesn't create migration files. Use it only in development.

### Production Workflow

For production, generate proper migration files:

```bash
# 1. Modify schema in src/db/schema.ts

# 2. Generate migration
bun run db:generate

# 3. Review the generated SQL in src/db/migrations/

# 4. Apply migration
bun run db:migrate
```

### Migration Commands

```bash
# Generate migration from schema changes
bun run db:generate

# Apply pending migrations
bun run db:migrate

# Push schema without migrations (dev only)
bun run db:push
```

---

## 🔍 Querying Data

### Basic Queries

```typescript
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, or, like, gt } from "drizzle-orm";

// Select all
const allUsers = await db.select().from(users);

// Select with condition
const user = await db.select()
  .from(users)
  .where(eq(users.email, "user@example.com"));

// Select specific fields
const emails = await db.select({ 
  email: users.email 
}).from(users);

// Multiple conditions
const activeAdmins = await db.select()
  .from(users)
  .where(and(
    eq(users.isActive, true),
    eq(users.role, "admin")
  ));
```

### Insert

```typescript
// Insert one
const newUser = await db.insert(users)
  .values({
    email: "new@example.com",
    name: "New User",
  })
  .returning();

// Insert multiple
await db.insert(users)
  .values([
    { email: "user1@example.com", name: "User 1" },
    { email: "user2@example.com", name: "User 2" },
  ]);
```

### Update

```typescript
// Update with condition
await db.update(users)
  .set({ name: "Updated Name" })
  .where(eq(users.id, userId));

// Update with timestamp
await db.update(users)
  .set({ 
    name: "Updated Name",
    updatedAt: new Date(),
  })
  .where(eq(users.id, userId));
```

### Delete

```typescript
// Delete with condition
await db.delete(users)
  .where(eq(users.id, userId));

// Delete all (be careful!)
await db.delete(users);
```

### Joins

```typescript
// Inner join
const usersWithPosts = await db.select()
  .from(users)
  .innerJoin(posts, eq(users.id, posts.userId));

// Left join
const allUsersWithPosts = await db.select()
  .from(users)
  .leftJoin(posts, eq(users.id, posts.userId));
```

### Transactions

```typescript
await db.transaction(async (tx) => {
  const user = await tx.insert(users)
    .values({ email: "user@example.com" })
    .returning();
  
  await tx.insert(posts)
    .values({ 
      userId: user[0].id,
      title: "First Post" 
    });
});
```

---

## 🎨 Drizzle Studio

Drizzle Studio is a web-based database browser:

```bash
# Start studio
bun run db:studio
```

Features:
- 📊 Browse tables and data
- ✏️ Edit records directly
- 🔍 Run custom queries
- 📈 View table relationships

---

## 🐳 Docker Details

### docker-compose.yml Structure

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: cirkulo
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### Useful Docker Commands

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f postgres

# Access PostgreSQL shell
docker-compose exec postgres psql -U postgres -d cirkulo

# Restart database
docker-compose restart postgres

# Remove volumes (⚠️ deletes all data)
docker-compose down -v
```

---

## 🔧 Configuration

### drizzle.config.ts

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",        // Where schemas are defined
  out: "./src/db/migrations",          // Where migrations are saved
  dialect: "postgresql",               // Database type
  dbCredentials: {
    url: process.env.DATABASE_URL!,    // Connection string
  },
});
```

### Environment Variables

```bash
# Local development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cirkulo

# Docker
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/cirkulo

# Production (example)
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

---

## 🎯 Best Practices

### 1. **Always Use Transactions for Related Operations**

```typescript
// ✅ Good
await db.transaction(async (tx) => {
  const user = await tx.insert(users).values({...}).returning();
  await tx.insert(profiles).values({ userId: user[0].id });
});

// ❌ Bad
const user = await db.insert(users).values({...}).returning();
await db.insert(profiles).values({ userId: user[0].id });
```

### 2. **Use Prepared Statements for Repeated Queries**

```typescript
const getUserByEmail = db.select()
  .from(users)
  .where(eq(users.email, placeholder("email")))
  .prepare("get_user_by_email");

const user = await getUserByEmail.execute({ email: "user@example.com" });
```

### 3. **Index Frequently Queried Columns**

```typescript
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),  // Automatically indexed
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),  // Explicit index
}));
```

### 4. **Use Timestamps for Audit Trail**

```typescript
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  // ... other fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### 5. **Validate Data Before Insertion**

```typescript
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

// Validate first
const validData = userSchema.parse(data);

// Then insert
await db.insert(users).values(validData);
```

---

## 🚨 Troubleshooting

### Connection Refused

```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart if needed
docker-compose restart postgres
```

### Migration Errors

```bash
# Reset database (⚠️ deletes all data)
docker-compose down -v
docker-compose up -d
bun run db:push
```

### Port Already in Use

```bash
# Find process using port 5432
lsof -i :5432

# Kill it or change port in docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 on host
```

### Type Errors

```bash
# Regenerate types
bun run db:generate
```

---

## 📚 Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Drizzle Kit CLI Reference](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Reference](https://docs.docker.com/compose/)

---

**Need help?** Check the [GETTING_STARTED.md](./GETTING_STARTED.md) or ask in the team channel! 🚀
