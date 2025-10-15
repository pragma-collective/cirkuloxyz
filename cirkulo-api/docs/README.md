# Cirkulo API Documentation

Welcome to the Cirkulo API documentation! This folder contains comprehensive guides for developing and maintaining the API.

## 📚 Documentation Files

### [GETTING_STARTED.md](./GETTING_STARTED.md)
**Quick start guide for new developers**
- Installation and setup
- Running the development server
- Accessing Swagger UI
- Testing endpoints
- Tech stack overview
- Project structure

👉 **Start here** if you're new to the project.

### [API_STANDARDS.md](./API_STANDARDS.md)
**Complete guide to API development standards**
- File structure and organization
- Step-by-step endpoint creation process
- Schema and route guidelines
- Error handling patterns
- Authentication best practices
- Code review checklist

👉 **Read this** when creating new endpoints.

### [EXAMPLES.md](./EXAMPLES.md)
**Ready-to-use code examples for common patterns**
- Simple GET/POST endpoints
- Path and query parameters
- Protected endpoints with JWT
- Pagination implementation
- PATCH/DELETE operations
- Nested resources
- Complete feature examples

👉 **Use these as templates** when implementing new features.

---

## 🚀 Quick Start

### New to the Project?

1. **Get Started**: Read [GETTING_STARTED.md](./GETTING_STARTED.md)
   - Install dependencies
   - Run the development server
   - Access Swagger UI at `/swagger`

### Creating Your First Endpoint

1. **Learn the standards**: Read [API_STANDARDS.md](./API_STANDARDS.md)
2. **Find a similar example**: Check [EXAMPLES.md](./EXAMPLES.md)
3. **Follow the pattern**:
   - Create schema in `src/schemas/[feature].ts`
   - Create route in `src/routes/[feature].ts`
   - Register in `src/routes/index.ts`
4. **Test in Swagger**: Visit `http://localhost:3000/swagger`

### File Organization

```
src/
├── schemas/          # OpenAPI schemas with Zod
│   ├── auth.ts      # Authentication schemas
│   ├── common.ts    # Shared/reusable schemas
│   └── [feature].ts # Feature-specific schemas
│
├── routes/          # Route handlers
│   ├── index.ts     # Routes aggregator
│   ├── auth.ts      # Auth endpoints
│   └── [feature].ts # Feature endpoints
│
└── lib/             # Shared utilities
    └── auth.ts      # Auth helpers
```

---

## 🎯 Key Principles

### 1. Schema-First Development
Every endpoint starts with a schema definition:
- Defines request/response structure
- Provides validation
- Generates TypeScript types
- Creates API documentation

### 2. Type Safety
- Use Zod schemas for runtime validation
- Leverage TypeScript for compile-time checks
- No `any` types
- Validated data from `c.req.valid()`

### 3. Consistent Patterns
- Standard file structure
- Consistent naming conventions
- Uniform error responses
- Common utilities and helpers

### 4. Documentation-Driven
- All endpoints documented in OpenAPI
- Available in Swagger UI at `/swagger`
- Examples in request/response schemas
- Clear descriptions for all fields

---

## 🔑 Common Tasks

### Adding a New Endpoint

```typescript
// 1. Define schema (src/schemas/feature.ts)
export const createItemRoute = createRoute({
  method: "post",
  path: "/items",
  tags: ["Items"],
  summary: "Create item",
  request: { body: { content: { "application/json": { schema: ItemSchema } } } },
  responses: { 201: { ... } },
});

// 2. Implement handler (src/routes/feature.ts)
items.openapi(createItemRoute, async (c) => {
  const body = c.req.valid("json");
  const item = await createItem(body);
  return c.json(item, 201);
});

// 3. Register route (src/routes/index.ts)
routes.route("/items", items);
```

### Adding Authentication to an Endpoint

```typescript
// In schema
export const protectedRoute = createRoute({
  // ...
  security: [{ bearerAuth: [] }],
  // ...
});

// In handler
const token = extractToken(c.req.header("Authorization"));
const user = await validateJWT(token!);
```

### Adding Pagination

```typescript
// Use shared pagination schema
import { PaginationQuerySchema, createPaginatedResponseSchema } from "../schemas/common";

export const listRoute = createRoute({
  request: { query: PaginationQuerySchema },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createPaginatedResponseSchema(YourItemSchema),
        },
      },
    },
  },
});
```

---

## 🧪 Testing Your Endpoints

### 1. Swagger UI (Recommended)
- Visit: `http://localhost:3000/swagger`
- Interactive interface
- Test authentication
- See all endpoints and schemas

### 2. cURL
```bash
# GET request
curl http://localhost:3000/api/items

# POST with auth
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "test"}'
```

### 3. OpenAPI Spec
- Visit: `http://localhost:3000/doc`
- Raw OpenAPI JSON
- Import into Postman, Insomnia, etc.

---

## 📋 Pre-Commit Checklist

Before committing new endpoints:

- [ ] Schema file created with proper validation
- [ ] Route handler implements error handling
- [ ] Endpoint registered in routes/index.ts
- [ ] Tested in Swagger UI
- [ ] Status codes are appropriate
- [ ] Error responses are consistent
- [ ] Documentation is clear (summary, description, examples)
- [ ] Authentication works if required
- [ ] TypeScript compiles without errors
- [ ] Follows naming conventions

---

## 🆘 Getting Help

### Documentation Resources
- **This folder**: Complete guides and examples
- **Swagger UI**: `/swagger` - Live API documentation
- **OpenAPI Spec**: `/doc` - Raw specification

### External Resources
- [Hono Documentation](https://hono.dev/)
- [Hono OpenAPI Guide](https://hono.dev/guides/zod-openapi)
- [Zod Documentation](https://zod.dev/)
- [OpenAPI Specification](https://swagger.io/specification/)

### Need Help?
- Check [EXAMPLES.md](./EXAMPLES.md) for similar patterns
- Review existing code in `src/routes/` and `src/schemas/`
- Ask the team in #dev-api channel

---

## 🔄 Keeping Documentation Updated

When you add new patterns or common use cases:
1. Add examples to [EXAMPLES.md](./EXAMPLES.md)
2. Update standards in [API_STANDARDS.md](./API_STANDARDS.md) if needed
3. Keep this README in sync

---

## 📝 Document Structure

### API_STANDARDS.md
- ✅ Development standards and guidelines
- ✅ File organization rules
- ✅ Step-by-step processes
- ✅ Best practices and conventions
- ✅ Code review checklist

### EXAMPLES.md
- ✅ Copy-paste ready code examples
- ✅ Common endpoint patterns
- ✅ Complete feature implementations
- ✅ Real-world use cases

### This README
- ✅ Overview and navigation
- ✅ Quick reference
- ✅ Getting started guide
- ✅ Common tasks

---

Happy coding! 🚀
