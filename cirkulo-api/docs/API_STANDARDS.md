# API Development Standards

This document outlines the standards and best practices for developing API endpoints in the Cirkulo API project.

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Creating New Endpoints](#creating-new-endpoints)
4. [Schema Guidelines](#schema-guidelines)
5. [Route Guidelines](#route-guidelines)
6. [Error Handling](#error-handling)
7. [Authentication](#authentication)
8. [Testing](#testing)
9. [Code Review Checklist](#code-review-checklist)

---

## Overview

We use **Hono** with **OpenAPI/Swagger** integration for type-safe, well-documented APIs. All endpoints must:

- ✅ Have OpenAPI schemas defined
- ✅ Include proper TypeScript types
- ✅ Follow RESTful conventions
- ✅ Include comprehensive error handling
- ✅ Be documented in Swagger UI

---

## File Structure

```
src/
├── index.ts                 # Main app entry, Swagger setup
├── routes/                  # Route handlers
│   ├── index.ts            # Routes aggregator
│   ├── auth.ts             # Auth-related endpoints
│   └── [feature].ts        # Feature-specific endpoints
├── schemas/                 # OpenAPI schemas
│   ├── auth.ts             # Auth schemas
│   └── [feature].ts        # Feature schemas
└── lib/                     # Shared utilities
    └── auth.ts             # Auth utilities
```

### When to Create New Files

- **New Schema File**: When adding a new feature/domain (e.g., `users`, `payments`)
- **New Route File**: When adding routes for a new feature
- **Shared Schemas**: Place in `schemas/common.ts` for reusable schemas

---

## Creating New Endpoints

### Step-by-Step Process

#### 1. Define Schemas (`src/schemas/[feature].ts`)

Create your Zod schemas and route definitions:

```typescript
import { z } from "zod";
import { createRoute } from "@hono/zod-openapi";

// Request/Response Schemas
export const CreateUserSchema = z.object({
  email: z.string().email().describe("User email address"),
  name: z.string().min(2).max(100).describe("User full name"),
  age: z.number().int().min(18).optional().describe("User age"),
});

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  age: z.number().optional(),
  createdAt: z.string().datetime(),
});

export const ErrorSchema = z.object({
  error: z.string().describe("Error message"),
  details: z.string().optional().describe("Additional error details"),
});

// Route Definition
export const createUserRoute = createRoute({
  method: "post",
  path: "/users",
  tags: ["Users"],
  summary: "Create a new user",
  description: "Creates a new user account with the provided information",
  security: [{ bearerAuth: [] }], // If authentication required
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: {
        "application/json": {
          schema: UserResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request data",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});
```

#### 2. Implement Route Handler (`src/routes/[feature].ts`)

```typescript
import { OpenAPIHono } from "@hono/zod-openapi";
import { createUserRoute, type UserResponseSchema } from "../schemas/users";
import type { z } from "zod";

const users = new OpenAPIHono();

// Implement the route
users.openapi(createUserRoute, async (c) => {
  // Get validated request body
  const body = c.req.valid("json");
  
  try {
    // Your business logic here
    const user = await createUserInDatabase(body);
    
    // Return response with correct status code
    return c.json(user, 201);
  } catch (error) {
    // Handle errors appropriately
    return c.json(
      { 
        error: "Failed to create user",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      400
    );
  }
});

export default users;
```

#### 3. Register Routes (`src/routes/index.ts`)

```typescript
import { OpenAPIHono } from "@hono/zod-openapi";
import auth from "./auth";
import users from "./users"; // Import new route

const routes = new OpenAPIHono();

// Mount all routes
routes.route("/auth", auth);
routes.route("/users", users); // Register new route

export default routes;
```

---

## Schema Guidelines

### Naming Conventions

- **Request Schemas**: `[Action][Resource]Schema` (e.g., `CreateUserSchema`, `UpdatePostSchema`)
- **Response Schemas**: `[Resource]ResponseSchema` (e.g., `UserResponseSchema`, `PostListResponseSchema`)
- **Error Schemas**: `ErrorSchema`, `ValidationErrorSchema`, etc.
- **Route Definitions**: `[action][Resource]Route` (e.g., `createUserRoute`, `listPostsRoute`)

### Schema Best Practices

#### ✅ DO

```typescript
// Clear descriptions for API documentation
export const UserSchema = z.object({
  email: z.string().email().describe("User email address"),
  age: z.number().int().min(18).describe("Must be 18 or older"),
});

// Use .openapi() for examples
export const LoginSchema = z.object({
  username: z.string().openapi({ example: "john.doe@example.com" }),
  password: z.string().openapi({ example: "********" }),
});

// Reuse common schemas
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Use enums for fixed values
export const UserRoleSchema = z.enum(["admin", "user", "guest"]);
```

#### ❌ DON'T

```typescript
// No descriptions
export const UserSchema = z.object({
  email: z.string(),
  age: z.number(),
});

// Duplicate schemas
export const User1Schema = z.object({ ... });
export const User2Schema = z.object({ ... }); // Similar to User1

// No validation
export const UserSchema = z.object({
  age: z.number(), // Should validate min age
});
```

### Common Schema Patterns

#### Pagination

```typescript
export const PaginationParamsSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default("1"),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default("20"),
});

export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    totalPages: z.number().int(),
  });
```

#### Error Responses

```typescript
export const ErrorSchema = z.object({
  error: z.string().describe("Error message"),
  details: z.string().optional().describe("Additional error details"),
  code: z.string().optional().describe("Error code for client handling"),
});

export const ValidationErrorSchema = z.object({
  error: z.string(),
  fields: z.record(z.array(z.string())).describe("Field-specific errors"),
});
```

---

## Route Guidelines

### HTTP Methods

- **GET**: Retrieve resources (read-only, idempotent)
- **POST**: Create new resources
- **PUT**: Full update of a resource
- **PATCH**: Partial update of a resource
- **DELETE**: Remove a resource

### Status Codes

Use appropriate HTTP status codes:

- **200 OK**: Successful GET, PUT, PATCH, DELETE
- **201 Created**: Successful POST creating a resource
- **204 No Content**: Successful DELETE with no response body
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Authenticated but not authorized
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Resource conflict (e.g., duplicate email)
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server-side errors

### RESTful URL Patterns

```
GET    /api/users              # List users
GET    /api/users/:id          # Get specific user
POST   /api/users              # Create user
PUT    /api/users/:id          # Update user (full)
PATCH  /api/users/:id          # Update user (partial)
DELETE /api/users/:id          # Delete user

# Nested resources
GET    /api/users/:id/posts    # Get user's posts
POST   /api/users/:id/posts    # Create post for user
```

### Path Parameters

```typescript
export const getUserRoute = createRoute({
  method: "get",
  path: "/users/{id}",
  request: {
    params: z.object({
      id: z.string().uuid().describe("User ID"),
    }),
  },
  // ...
});

// In handler
users.openapi(getUserRoute, async (c) => {
  const { id } = c.req.valid("param");
  // ...
});
```

### Query Parameters

```typescript
export const listUsersRoute = createRoute({
  method: "get",
  path: "/users",
  request: {
    query: z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      search: z.string().optional(),
    }),
  },
  // ...
});

// In handler
users.openapi(listUsersRoute, async (c) => {
  const query = c.req.valid("query");
  // ...
});
```

---

## Error Handling

### Standard Error Response

Always return consistent error structures:

```typescript
// Success
return c.json({ id: "123", name: "John" }, 200);

// Error
return c.json(
  { 
    error: "User not found",
    details: "No user exists with ID: 123"
  },
  404
);
```

### Try-Catch Pattern

```typescript
auth.openapi(someRoute, async (c) => {
  try {
    const result = await someAsyncOperation();
    return c.json(result, 200);
  } catch (error) {
    // Log error for debugging
    console.error("Error in someRoute:", error);
    
    // Handle specific error types
    if (error instanceof ValidationError) {
      return c.json({ error: error.message }, 400);
    }
    
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    
    // Generic fallback
    return c.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      500
    );
  }
});
```

---

## Authentication

### Protected Endpoints

Add `security` to route definition:

```typescript
export const protectedRoute = createRoute({
  method: "get",
  path: "/protected",
  security: [{ bearerAuth: [] }],
  // ...
});
```

### Extracting User Info

```typescript
import { extractToken, validateJWT } from "../lib/auth";

users.openapi(protectedRoute, async (c) => {
  const authHeader = c.req.header("Authorization");
  const token = extractToken(authHeader);
  
  if (!token) {
    return c.json({ error: "Missing authorization" }, 401);
  }
  
  try {
    const user = await validateJWT(token);
    // Use user.sub, user.email, etc.
  } catch (error) {
    return c.json({ error: "Invalid token" }, 401);
  }
});
```

---

## Testing

### Test Your Endpoints

1. **In Swagger UI**: Visit `/swagger` to test interactively
2. **With curl**:
   ```bash
   curl -X POST http://localhost:3000/api/users \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"email": "test@example.com", "name": "Test User"}'
   ```

### Validation Checklist

- [ ] Endpoint appears in Swagger UI
- [ ] Request/response schemas are correct
- [ ] Authentication works (if protected)
- [ ] Error responses are consistent
- [ ] Status codes are appropriate
- [ ] Documentation is clear

---

## Code Review Checklist

Before submitting a PR with new endpoints:

### Schema Checklist
- [ ] Schemas are in `src/schemas/[feature].ts`
- [ ] All fields have `.describe()` for documentation
- [ ] Validation rules are appropriate (min, max, email, etc.)
- [ ] Examples provided with `.openapi({ example: ... })`
- [ ] Reused common schemas where applicable

### Route Checklist
- [ ] Route uses `OpenAPIHono`
- [ ] Route definition created with `createRoute()`
- [ ] Handler uses `.openapi()` method
- [ ] Correct HTTP method and path
- [ ] Appropriate status codes returned
- [ ] Request validation used (`c.req.valid()`)

### Documentation Checklist
- [ ] `tags` added for grouping in Swagger
- [ ] `summary` is clear and concise
- [ ] `description` provides details
- [ ] All responses documented (success + errors)
- [ ] Security requirements specified if needed

### Error Handling Checklist
- [ ] Try-catch blocks implemented
- [ ] Specific error types handled
- [ ] Consistent error response format
- [ ] Appropriate error status codes
- [ ] Errors logged for debugging

### General Checklist
- [ ] TypeScript types are correct (no `any`)
- [ ] Code follows existing patterns
- [ ] No console.logs in production code
- [ ] Tested in Swagger UI
- [ ] Works with authentication if required

---

## Quick Reference

### File Creation Order

1. Create schema file: `src/schemas/[feature].ts`
2. Create route file: `src/routes/[feature].ts`
3. Register in: `src/routes/index.ts`
4. Test in Swagger UI: `http://localhost:3000/swagger`

### Common Imports

```typescript
// For schemas
import { z } from "zod";
import { createRoute } from "@hono/zod-openapi";

// For routes
import { OpenAPIHono } from "@hono/zod-openapi";
import { yourRoute } from "../schemas/[feature]";

// For auth
import { extractToken, validateJWT } from "../lib/auth";
```

---

## Need Help?

- 📖 [Hono OpenAPI Docs](https://hono.dev/guides/zod-openapi)
- 📖 [Zod Documentation](https://zod.dev/)
- 📖 [OpenAPI Specification](https://swagger.io/specification/)
- 💬 Ask the team in #dev-api channel
