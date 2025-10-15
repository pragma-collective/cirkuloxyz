# API Endpoint Examples

This document provides complete, copy-pasteable examples for common API endpoint patterns.

## Table of Contents

1. [Simple GET Endpoint](#simple-get-endpoint)
2. [POST with Body Validation](#post-with-body-validation)
3. [GET with Path Parameters](#get-with-path-parameters)
4. [GET with Query Parameters](#get-with-query-parameters)
5. [Protected Endpoint (JWT)](#protected-endpoint-jwt)
6. [PATCH for Updates](#patch-for-updates)
7. [DELETE Endpoint](#delete-endpoint)
8. [Pagination Example](#pagination-example)
9. [File Upload](#file-upload)
10. [Nested Resources](#nested-resources)

---

## Simple GET Endpoint

**Use Case**: List all items without parameters

### Schema (`src/schemas/items.ts`)

```typescript
import { z } from "zod";
import { createRoute } from "@hono/zod-openapi";

export const ItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.string().datetime(),
});

export const listItemsRoute = createRoute({
  method: "get",
  path: "/items",
  tags: ["Items"],
  summary: "List all items",
  description: "Retrieves a list of all available items",
  responses: {
    200: {
      description: "List of items",
      content: {
        "application/json": {
          schema: z.object({
            items: z.array(ItemSchema),
          }),
        },
      },
    },
  },
});
```

### Route (`src/routes/items.ts`)

```typescript
import { OpenAPIHono } from "@hono/zod-openapi";
import { listItemsRoute } from "../schemas/items";

const items = new OpenAPIHono();

items.openapi(listItemsRoute, async (c) => {
  // Your database query here
  const allItems = await fetchItemsFromDatabase();
  
  return c.json({ items: allItems }, 200);
});

export default items;
```

---

## POST with Body Validation

**Use Case**: Create a new resource with validation

### Schema (`src/schemas/products.ts`)

```typescript
import { z } from "zod";
import { createRoute } from "@hono/zod-openapi";

export const CreateProductSchema = z.object({
  name: z.string().min(3).max(100).describe("Product name"),
  price: z.number().positive().describe("Price in USD"),
  category: z.enum(["electronics", "clothing", "food"]).describe("Product category"),
  inStock: z.boolean().default(true).describe("Whether product is in stock"),
  tags: z.array(z.string()).optional().describe("Product tags"),
});

export const ProductResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number(),
  category: z.string(),
  inStock: z.boolean(),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
});

export const ErrorSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
});

export const createProductRoute = createRoute({
  method: "post",
  path: "/products",
  tags: ["Products"],
  summary: "Create a new product",
  description: "Creates a new product with the provided details",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateProductSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Product created successfully",
      content: {
        "application/json": {
          schema: ProductResponseSchema,
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
  },
});
```

### Route (`src/routes/products.ts`)

```typescript
import { OpenAPIHono } from "@hono/zod-openapi";
import { createProductRoute } from "../schemas/products";

const products = new OpenAPIHono();

products.openapi(createProductRoute, async (c) => {
  // Request body is automatically validated
  const body = c.req.valid("json");
  
  try {
    // Create product in database
    const product = await createProductInDatabase({
      ...body,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    });
    
    return c.json(product, 201);
  } catch (error) {
    return c.json(
      {
        error: "Failed to create product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      400
    );
  }
});

export default products;
```

---

## GET with Path Parameters

**Use Case**: Get a specific resource by ID

### Schema (`src/schemas/products.ts`)

```typescript
export const getProductRoute = createRoute({
  method: "get",
  path: "/products/{id}",
  tags: ["Products"],
  summary: "Get product by ID",
  description: "Retrieves a specific product by its unique identifier",
  request: {
    params: z.object({
      id: z.string().uuid().describe("Product ID"),
    }),
  },
  responses: {
    200: {
      description: "Product found",
      content: {
        "application/json": {
          schema: ProductResponseSchema,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});
```

### Route (`src/routes/products.ts`)

```typescript
products.openapi(getProductRoute, async (c) => {
  const { id } = c.req.valid("param");
  
  const product = await findProductById(id);
  
  if (!product) {
    return c.json({ error: "Product not found" }, 404);
  }
  
  return c.json(product, 200);
});
```

---

## GET with Query Parameters

**Use Case**: Search/filter resources with query strings

### Schema (`src/schemas/products.ts`)

```typescript
export const searchProductsRoute = createRoute({
  method: "get",
  path: "/products/search",
  tags: ["Products"],
  summary: "Search products",
  description: "Search products by name or category with pagination",
  request: {
    query: z.object({
      q: z.string().optional().describe("Search query"),
      category: z.string().optional().describe("Filter by category"),
      minPrice: z.string().optional().describe("Minimum price"),
      maxPrice: z.string().optional().describe("Maximum price"),
      page: z.string().default("1").describe("Page number"),
      limit: z.string().default("20").describe("Items per page"),
    }),
  },
  responses: {
    200: {
      description: "Search results",
      content: {
        "application/json": {
          schema: z.object({
            items: z.array(ProductResponseSchema),
            total: z.number(),
            page: z.number(),
            limit: z.number(),
          }),
        },
      },
    },
  },
});
```

### Route (`src/routes/products.ts`)

```typescript
products.openapi(searchProductsRoute, async (c) => {
  const query = c.req.valid("query");
  
  // Convert string params to numbers
  const page = parseInt(query.page);
  const limit = parseInt(query.limit);
  const minPrice = query.minPrice ? parseFloat(query.minPrice) : undefined;
  const maxPrice = query.maxPrice ? parseFloat(query.maxPrice) : undefined;
  
  // Build search filters
  const filters = {
    search: query.q,
    category: query.category,
    minPrice,
    maxPrice,
  };
  
  // Fetch from database
  const { items, total } = await searchProducts(filters, page, limit);
  
  return c.json({ items, total, page, limit }, 200);
});
```

---

## Protected Endpoint (JWT)

**Use Case**: Endpoint requiring authentication

### Schema (`src/schemas/profile.ts`)

```typescript
import { z } from "zod";
import { createRoute } from "@hono/zod-openapi";

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.string(),
});

export const getProfileRoute = createRoute({
  method: "get",
  path: "/profile",
  tags: ["User"],
  summary: "Get user profile",
  description: "Get the authenticated user's profile information",
  security: [{ bearerAuth: [] }],
  request: {
    headers: z.object({
      authorization: z.string().describe("Bearer token"),
    }),
  },
  responses: {
    200: {
      description: "User profile",
      content: {
        "application/json": {
          schema: UserProfileSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
            details: z.string().optional(),
          }),
        },
      },
    },
  },
});
```

### Route (`src/routes/profile.ts`)

```typescript
import { OpenAPIHono } from "@hono/zod-openapi";
import jwt from "jsonwebtoken";
import { extractToken, validateJWT } from "../lib/auth";
import { getProfileRoute } from "../schemas/profile";

const profile = new OpenAPIHono();

profile.openapi(getProfileRoute, async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const token = extractToken(authHeader);
    
    if (!token) {
      return c.json({ error: "Missing authorization token" }, 401);
    }
    
    // Validate JWT and get user info
    const decoded = await validateJWT(token);
    
    // Fetch full user profile
    const userProfile = await getUserProfile(decoded.sub);
    
    return c.json(userProfile, 200);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return c.json({ error: "Invalid token", details: error.message }, 401);
    }
    if (error instanceof jwt.TokenExpiredError) {
      return c.json({ error: "Token expired", details: error.message }, 401);
    }
    return c.json({ error: "Authentication failed" }, 401);
  }
});

export default profile;
```

---

## PATCH for Updates

**Use Case**: Partial update of a resource

### Schema (`src/schemas/products.ts`)

```typescript
export const UpdateProductSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  price: z.number().positive().optional(),
  category: z.enum(["electronics", "clothing", "food"]).optional(),
  inStock: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateProductRoute = createRoute({
  method: "patch",
  path: "/products/{id}",
  tags: ["Products"],
  summary: "Update product",
  description: "Partially update a product's information",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateProductSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Product updated successfully",
      content: {
        "application/json": {
          schema: ProductResponseSchema,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});
```

### Route (`src/routes/products.ts`)

```typescript
products.openapi(updateProductRoute, async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");
  
  // Check if product exists
  const product = await findProductById(id);
  if (!product) {
    return c.json({ error: "Product not found" }, 404);
  }
  
  // Update only provided fields
  const updated = await updateProduct(id, updates);
  
  return c.json(updated, 200);
});
```

---

## DELETE Endpoint

**Use Case**: Remove a resource

### Schema (`src/schemas/products.ts`)

```typescript
export const deleteProductRoute = createRoute({
  method: "delete",
  path: "/products/{id}",
  tags: ["Products"],
  summary: "Delete product",
  description: "Permanently delete a product",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    204: {
      description: "Product deleted successfully",
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});
```

### Route (`src/routes/products.ts`)

```typescript
products.openapi(deleteProductRoute, async (c) => {
  const { id } = c.req.valid("param");
  
  const deleted = await deleteProduct(id);
  
  if (!deleted) {
    return c.json({ error: "Product not found" }, 404);
  }
  
  // 204 No Content - no body needed
  return c.body(null, 204);
});
```

---

## Pagination Example

**Use Case**: Paginated list with metadata

### Schema (`src/schemas/common.ts`)

```typescript
import { z } from "zod";

// Reusable pagination schema
export const PaginationQuerySchema = z.object({
  page: z.string().default("1").describe("Page number (starts at 1)"),
  limit: z.string().default("20").describe("Items per page (max 100)"),
});

// Generic paginated response
export const createPaginatedResponseSchema = <T extends z.ZodType>(
  itemSchema: T
) => {
  return z.object({
    items: z.array(itemSchema),
    pagination: z.object({
      total: z.number().describe("Total number of items"),
      page: z.number().describe("Current page number"),
      limit: z.number().describe("Items per page"),
      totalPages: z.number().describe("Total number of pages"),
      hasNext: z.boolean().describe("Whether there is a next page"),
      hasPrev: z.boolean().describe("Whether there is a previous page"),
    }),
  });
};
```

### Schema (`src/schemas/products.ts`)

```typescript
import { createRoute } from "@hono/zod-openapi";
import { PaginationQuerySchema, createPaginatedResponseSchema } from "./common";
import { ProductResponseSchema } from "./products";

export const listProductsRoute = createRoute({
  method: "get",
  path: "/products",
  tags: ["Products"],
  summary: "List products with pagination",
  request: {
    query: PaginationQuerySchema,
  },
  responses: {
    200: {
      description: "Paginated list of products",
      content: {
        "application/json": {
          schema: createPaginatedResponseSchema(ProductResponseSchema),
        },
      },
    },
  },
});
```

### Route (`src/routes/products.ts`)

```typescript
products.openapi(listProductsRoute, async (c) => {
  const query = c.req.valid("query");
  
  const page = Math.max(1, parseInt(query.page));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit)));
  const offset = (page - 1) * limit;
  
  // Fetch data
  const { items, total } = await fetchProducts({ offset, limit });
  
  const totalPages = Math.ceil(total / limit);
  
  return c.json({
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }, 200);
});
```

---

## Nested Resources

**Use Case**: Resources that belong to a parent resource

### Schema (`src/schemas/comments.ts`)

```typescript
import { z } from "zod";
import { createRoute } from "@hono/zod-openapi";

export const CommentSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  content: z.string(),
  authorId: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export const CreateCommentSchema = z.object({
  content: z.string().min(1).max(1000).describe("Comment content"),
});

export const createCommentRoute = createRoute({
  method: "post",
  path: "/posts/{postId}/comments",
  tags: ["Comments"],
  summary: "Add comment to post",
  description: "Create a new comment on a specific post",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      postId: z.string().uuid().describe("Post ID"),
    }),
    body: {
      content: {
        "application/json": {
          schema: CreateCommentSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Comment created",
      content: {
        "application/json": {
          schema: CommentSchema,
        },
      },
    },
    404: {
      description: "Post not found",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});
```

### Route (`src/routes/comments.ts`)

```typescript
import { OpenAPIHono } from "@hono/zod-openapi";
import { extractToken, validateJWT } from "../lib/auth";
import { createCommentRoute } from "../schemas/comments";

const comments = new OpenAPIHono();

comments.openapi(createCommentRoute, async (c) => {
  const { postId } = c.req.valid("param");
  const body = c.req.valid("json");
  
  // Verify post exists
  const post = await findPostById(postId);
  if (!post) {
    return c.json({ error: "Post not found" }, 404);
  }
  
  // Get authenticated user
  const token = extractToken(c.req.header("Authorization"));
  const user = await validateJWT(token!);
  
  // Create comment
  const comment = await createComment({
    ...body,
    postId,
    authorId: user.sub,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  
  return c.json(comment, 201);
});

export default comments;
```

---

## Complete Feature Example

Here's how all files work together for a "Posts" feature:

### 1. `src/schemas/posts.ts`

```typescript
import { z } from "zod";
import { createRoute } from "@hono/zod-openapi";
import { PaginationQuerySchema, createPaginatedResponseSchema } from "./common";

// Schemas
export const PostSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  authorId: z.string().uuid(),
  published: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreatePostSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  published: z.boolean().default(false),
});

// Routes
export const listPostsRoute = createRoute({
  method: "get",
  path: "/posts",
  tags: ["Posts"],
  summary: "List all posts",
  request: { query: PaginationQuerySchema },
  responses: {
    200: {
      description: "List of posts",
      content: {
        "application/json": {
          schema: createPaginatedResponseSchema(PostSchema),
        },
      },
    },
  },
});

export const createPostRoute = createRoute({
  method: "post",
  path: "/posts",
  tags: ["Posts"],
  summary: "Create a post",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: CreatePostSchema } },
    },
  },
  responses: {
    201: {
      description: "Post created",
      content: { "application/json": { schema: PostSchema } },
    },
  },
});
```

### 2. `src/routes/posts.ts`

```typescript
import { OpenAPIHono } from "@hono/zod-openapi";
import { listPostsRoute, createPostRoute } from "../schemas/posts";
import { extractToken, validateJWT } from "../lib/auth";

const posts = new OpenAPIHono();

posts.openapi(listPostsRoute, async (c) => {
  const query = c.req.valid("query");
  const page = parseInt(query.page);
  const limit = parseInt(query.limit);
  
  const { items, total } = await fetchPosts({ page, limit });
  
  return c.json({
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  }, 200);
});

posts.openapi(createPostRoute, async (c) => {
  const body = c.req.valid("json");
  const token = extractToken(c.req.header("Authorization"));
  const user = await validateJWT(token!);
  
  const post = await createPost({
    ...body,
    authorId: user.sub,
  });
  
  return c.json(post, 201);
});

export default posts;
```

### 3. `src/routes/index.ts`

```typescript
import { OpenAPIHono } from "@hono/zod-openapi";
import auth from "./auth";
import posts from "./posts";

const routes = new OpenAPIHono();

routes.route("/auth", auth);
routes.route("/posts", posts);

export default routes;
```

---

That's it! Use these examples as templates for building your own endpoints. 🚀
