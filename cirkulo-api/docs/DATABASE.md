# Database Guide

Complete guide for database development with PostgreSQL and Drizzle ORM.

## 📚 Stack

- **PostgreSQL 16** - Database
- **Drizzle ORM** - Type-safe queries
- **Drizzle Kit** - Migrations & schema management
- **Docker** - Local development environment

---

## 🚀 Quick Setup

### 1. Start Database

```bash
# Start PostgreSQL with Docker
bun run docker:up

# Verify it's running
bun run docker:logs postgres
```

**Connection:**
- URL: `postgresql://postgres:postgres@localhost:5432/cirkulo`
- Host: `localhost` (or `postgres` inside Docker)
- Port: `5432`
- Database: `cirkulo`

### 2. Define Your Schema

Edit `src/db/schema.ts`:

```typescript
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### 3. Apply Schema

**Development (quick):**
```bash
bun run db:push
```

**Production (with migrations):**
```bash
bun run db:generate  # Create migration
bun run db:migrate   # Apply migration
```

### 4. Browse Your Data

```bash
bun run db:studio
# Opens at http://localhost:4983
```

---

## � Development Workflow

### Daily Development

```bash
# 1. Start database
bun run docker:up

# 2. Edit schema in src/db/schema.ts

# 3. Push changes (no migration files)
bun run db:push

# 4. View data
bun run db:studio
```

### Production-Ready Migrations

When you're ready to commit:

```bash
# 1. Generate migration from schema changes
bun run db:generate

# 2. Review the SQL in src/db/migrations/

# 3. Apply migration
bun run db:migrate

# 4. Commit migration files to git
git add src/db/migrations/
```

### Key Differences

| Command | Use Case | Creates Migrations | Safe for Production |
|---------|----------|-------------------|---------------------|
| `db:push` | Fast development iteration | ❌ No | ❌ No |
| `db:generate` + `db:migrate` | Production changes | ✅ Yes | ✅ Yes |

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

## 🐳 Docker Commands

```bash
# Start PostgreSQL
bun run docker:up

# Stop containers
bun run docker:down

# View logs
bun run docker:logs

# Access PostgreSQL shell
docker-compose exec postgres psql -U postgres -d cirkulo

# Reset database (⚠️ deletes all data)
docker-compose down -v
docker-compose up -d
```

---

## 🎯 Best Practices

### Use Transactions for Related Operations

```typescript
// ✅ Atomic - both succeed or both fail
await db.transaction(async (tx) => {
  const user = await tx.insert(users).values({...}).returning();
  await tx.insert(profiles).values({ userId: user[0].id });
});
```

### Add Timestamps to All Tables

```typescript
export const myTable = pgTable("my_table", {
  id: uuid("id").defaultRandom().primaryKey(),
  // ... other fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### Index Frequently Queried Columns

```typescript
import { index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  email: text("email").notNull(),
  // ... other fields
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
}));
```

---

## 🚨 Troubleshooting

**Database won't start:**
```bash
docker-compose ps  # Check status
docker-compose logs postgres  # View errors
```

**Port 5432 already in use:**
```bash
lsof -i :5432  # Find what's using it
# Or change port in docker-compose.yml
```

**Reset database (⚠️ deletes all data):**
```bash
docker-compose down -v
docker-compose up -d
bun run db:push
```

**Type errors after schema changes:**
```bash
bun run db:generate  # Regenerate types
```

---

## 📚 Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview) - Complete ORM guide
- [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) - Migration tools
- [PostgreSQL Docs](https://www.postgresql.org/docs/) - Database reference

---

**Quick Links:** [Getting Started](./GETTING_STARTED.md) | [API Standards](./API_STANDARDS.md)
