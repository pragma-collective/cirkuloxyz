# User Invites Setup

This document explains how to set up and use the user invite functionality.

## Overview

The invite endpoint allows authenticated users to invite others to the platform via email. It uses:
- **Resend** for email delivery
- **JWT Authentication** via Lens Protocol
- **Auth Middleware** for protected routes

## Setup Instructions

### 1. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to [API Keys](https://resend.com/api-keys)
3. Create a new API key
4. Copy the key (starts with `re_`)

### 2. Configure Domain (Production)

For production emails:
1. Go to [Resend Domains](https://resend.com/domains)
2. Add your domain
3. Add the required DNS records (SPF, DKIM, DMARC)
4. Verify the domain

**Note:** For development, you can use Resend's test domain which allows sending to your own verified email.

### 3. Environment Variables

Add these to your `.env` file:

```bash
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@yourdomain.com
APP_URL=http://localhost:8000

# Lens Protocol Configuration
LENS_ENVIRONMENT=development  # Use 'production' for mainnet, anything else for testnet
```

- `RESEND_API_KEY`: Your Resend API key
- `FROM_EMAIL`: The sender email address (must be verified in Resend)
- `APP_URL`: Your application URL for invite links
- `LENS_ENVIRONMENT`: Controls Lens Protocol environment (`production` for mainnet, `development`/`testnet` for testnet)

### 4. Test the Endpoint

Start the server:
```bash
bun run dev
```

Visit the Swagger UI at `http://localhost:8000/swagger` to test the endpoint.

## API Usage

### Endpoint: POST /api/invites/send

**Authentication Required:** Yes (Bearer token)

**Request Body:**
```json
{
  "email": "newuser@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "email": "newuser@example.com",
  "emailId": "some-email-id"
}
```

**Error Responses:**

- `400`: Invalid email format
- `401`: Missing or invalid authentication token
- `500`: Failed to send email

### Using with cURL

```bash
curl -X POST http://localhost:8000/api/invites/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"email": "newuser@example.com"}'
```

## Architecture

### Files Created

```
src/
├── lib/
│   ├── middleware.ts     # Auth middleware for protected routes
│   └── email.ts          # Email service with Resend
├── schemas/
│   └── invites.ts        # OpenAPI schemas for invite endpoint
└── routes/
    └── invites.ts        # Invite route handlers
```

### Flow

1. **Request arrives** → Auth middleware validates JWT token
2. **Token valid** → Extract user info (including name, email, alias)
3. **Extract inviter name** → From JWT fields: given_name + family_name, or given_name, or alias, or email
4. **Route handler** → Validate email, send personalized invite
5. **Email sent** → Return success response with inviter context

## 🎨 Email Template

The invite email includes:
- ✅ Responsive HTML design
- ✅ Citrea-inspired orange gradient styling
- ✅ Personalized inviter name (extracted from JWT)
- ✅ Call-to-action button
- ✅ Plain text fallback
- ✅ Copy-paste link option

**Key Features:**
- Uses Citrea brand colors (orange gradient: #e67e22 to #d35400)
- Personalizes message with inviter's name from Lens Protocol JWT token
- Falls back gracefully if inviter name not available
- Modern, clean design matching your frontend theme

**To customize:** Edit `src/lib/email.ts`

## Future Enhancements

- [ ] Generate unique invite tokens for tracking
- [ ] Store invites in database
- [ ] Add invite expiration
- [ ] Track invite acceptance
- [ ] Add invite templates (admin, user, etc.)
- [ ] Rate limiting per user
- [ ] Bulk invite endpoint

## Resend Free Tier

- **3,000 emails/month** for free
- 100 emails/day
- Perfect for getting started

For higher volumes, check [Resend pricing](https://resend.com/pricing).

## Troubleshooting

### Email not sending
- Check `RESEND_API_KEY` is set correctly
- Verify `FROM_EMAIL` domain in Resend dashboard
- Check server logs for detailed error messages

### Authentication errors
- Ensure valid JWT token from Lens Protocol
- Token must not be expired
- Check `LENS_ENVIRONMENT` matches your Lens Protocol setup (production/development)

### Domain verification issues
- Follow Resend's DNS setup guide
- DNS changes can take up to 48 hours
- Use Resend's test mode for development
