# Quick Start: User Invites

## ✅ What's Been Implemented

A complete user invite system with:
- **POST /api/invites/send** - Send email invitations to users
- **JWT Authentication** - Protected by auth middleware
- **Resend Integration** - Professional email delivery
- **OpenAPI Documentation** - Auto-generated Swagger docs

## 🚀 Quick Setup (3 steps)

### 1. Get Resend API Key
```bash
# Sign up at https://resend.com
# Get API key from: https://resend.com/api-keys
```

### 2. Add to .env
```bash
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@yourdomain.com
APP_URL=http://localhost:3000
```

### 3. Test It
```bash
# Start server
bun run dev

# Visit Swagger UI
open http://localhost:3000/swagger

# Test the POST /api/invites/send endpoint
```

## 📝 Example Request

```bash
curl -X POST http://localhost:3000/api/invites/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"email": "newuser@example.com"}'
```

## 📂 Files Created

```
src/
├── lib/
│   ├── middleware.ts     # Reusable auth middleware
│   └── email.ts          # Resend email service
├── schemas/
│   └── invites.ts        # OpenAPI schemas
└── routes/
    └── invites.ts        # Invite endpoint

docs/
└── INVITES_SETUP.md      # Detailed setup guide
```

## 🎨 Email Template

The invite email includes:
- ✅ Citrea-inspired orange gradient design
- ✅ Personalized with inviter's name
- ✅ Responsive HTML layout
- ✅ Call-to-action button with brand colors
- ✅ Plain text fallback
- ✅ Copy-paste link option

**Brand Colors:**
- Primary Orange: `#e67e22` to `#d35400` (gradient)
- Accent: `#fef3e2` (light orange background)
- Matches your frontend Citrea theme

**Personalization:**
- Automatically extracts inviter's name from Dynamic JWT
- Falls back to alias, email, or generic greeting
- Message: "{Name} has invited you to join their pool on Cirkulo"

**To customize:** Edit `src/lib/email.ts`

## 🔐 Security Features

- ✅ JWT validation using Dynamic.xyz
- ✅ Bearer token authentication
- ✅ Auth middleware on all invite routes
- ✅ User context available in handlers

## 📊 Architecture Highlights

### Auth Middleware
Reusable middleware that:
- Validates JWT tokens
- Extracts user info
- Attaches to context
- Returns proper error responses

### Email Service
Modular email service that:
- Uses Resend SDK
- Generates invite links
- Professional HTML templates
- Error handling

### API Standards Compliance
- ✅ OpenAPI/Swagger documentation
- ✅ Zod schema validation
- ✅ Proper HTTP status codes
- ✅ Consistent error responses
- ✅ TypeScript type safety

## 🎯 Next Steps

1. **Add your Resend API key** to `.env`
2. **Test the endpoint** in Swagger UI
3. **Customize email template** if needed
4. **Add invite tracking** (optional - see INVITES_SETUP.md)

## 💡 Why Resend?

- ✅ **3,000 emails/month free** - Perfect for starting
- ✅ **Modern API** - Clean, simple integration
- ✅ **Great TypeScript support** - Type-safe
- ✅ **Excellent deliverability** - Professional emails
- ✅ **Fast setup** - No complex configuration

## 📚 Full Documentation

See `docs/INVITES_SETUP.md` for:
- Detailed setup instructions
- Domain configuration
- Email customization
- Troubleshooting
- Future enhancements

## ⚡️ Ready to Use!

The endpoint is fully functional and follows your API standards. Just add the Resend API key and start inviting users!
