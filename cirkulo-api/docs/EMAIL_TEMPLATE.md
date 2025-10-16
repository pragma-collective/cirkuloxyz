# Email Template Visual Guide

## Preview

### Personalized Email (With Inviter Name)

**Subject:** John Doe invited you to join Cirkulo

The email features:
- **Citrea orange gradient header** (#e67e22 → #d35400)
- **Personalized greeting** mentioning the inviter's name
- **Highlighted inviter box** with warm orange accent
- **Prominent CTA button** with Citrea brand colors
- **Clean, modern layout** matching your frontend design

### Key Elements

1. **Header Section**
   - Orange gradient background (Citrea-inspired)
   - "Welcome to Cirkulo" title
   - "Join the pool community" subtitle

2. **Inviter Callout Box** (when inviter name available)
   - Light orange background (#fef3e2 → #fde8cc)
   - Orange left border accent (#e67e22)
   - Text: "[Name] thinks you'd be a great addition to their pool community!"

3. **Call-to-Action Button**
   - Orange gradient (#e67e22 → #d35400)
   - Text: "Accept Invitation →"
   - Drop shadow for depth

4. **Fallback Link**
   - Copy-paste option
   - Light orange background box

## Color Palette (Citrea Brand)

### Primary Orange
```
Header/Button Gradient: #e67e22 → #d35400
Button Shadow: rgba(230, 126, 34, 0.3)
```

### Accent Colors
```
Inviter Box Background: #fef3e2 → #fde8cc
Inviter Box Border: #e67e22 (4px left)
Inviter Box Text: #78350f
Inviter Name Bold: #92400e
```

### Typography Colors
```
Primary Text: #2d2d2d, #1f1f1f
Secondary Text: #525252
Muted Text: #737373, #a3a3a3
Link Text: #e67e22
```

### Backgrounds
```
Body: #fafaf9
Card: white
Link Box: #fef3e2
```

## Dynamic Personalization

### Name Extraction from JWT

The system intelligently extracts the inviter's name from the Dynamic JWT token:

```typescript
Priority order:
1. "John Doe"      (given_name + family_name)
2. "John"          (given_name only)
3. "johndoe"       (alias)
4. "john@mail.com" (email)
5. "Someone"       (fallback)
```

### Email Variations

#### With Full Name
**Subject:** John Doe invited you to join Cirkulo
**Content:** "John Doe has invited you to join their pool on Cirkulo"
**Shows:** Highlighted inviter box

#### With First Name Only
**Subject:** John invited you to join Cirkulo
**Content:** "John has invited you to join their pool on Cirkulo"
**Shows:** Highlighted inviter box

#### Without Name (Fallback)
**Subject:** You're invited to join Cirkulo
**Content:** "You've been invited to join Cirkulo"
**Shows:** Generic invitation message (no special box)

## Responsive Design

### Desktop/Mobile
- Max width: 600px
- Fluid padding
- Touch-friendly buttons (16px padding)
- Readable font sizes (16px body, 32px header)

### Email Client Compatibility
- HTML + Plain text fallback
- Inline styles (email client safe)
- No external CSS
- Tested for Gmail, Outlook, Apple Mail

## Typography

```
Font: Inter, system font stack
Header: 32px / bold (700)
Subheader: 24px / semi-bold (600)
Body: 16px / normal (400)
Small: 12-13px / normal (400)
Line Height: 1.6-1.7
```

## Layout Specs

```
Border Radius:
  - Cards: 16px
  - Buttons: 12px
  - Accent boxes: 12px
  - Link box: 8px

Shadows:
  - Header/Card: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
  - Button: 0 4px 6px -1px rgba(230, 126, 34, 0.3)

Spacing:
  - Section padding: 30-40px
  - Element margins: 20-35px
  - Internal padding: 12-20px
```

## Implementation

### Function Signature

```typescript
sendInviteEmail({
  to: "user@example.com",
  inviterName: "John Doe",    // Optional - from JWT
  inviteToken: "abc123xyz"    // Optional - for tracking
})
```

### Route Handler Usage

```typescript
// Extract inviter name from JWT
const inviterName =
  user.given_name && user.family_name
    ? `${user.given_name} ${user.family_name}`
    : user.given_name || user.alias || user.email || "Someone";

// Send personalized email
await sendInviteEmail({
  to: email,
  inviterName,
});
```

## Plain Text Version

A plain text version is automatically generated with:
- Same personalized content
- Formatted for readability
- Full URL (not shortened)
- Copyright footer

Example:
```
John Doe has invited you to join their pool on Cirkulo!

John Doe thinks you'd be a great addition to their pool community.

Cirkulo is a decentralized platform for creating and managing 
community pools.

Click the link below to accept your invitation:
https://your-app.com/invite?token=xyz

If you didn't expect this invitation, you can safely ignore this email.

© 2025 Cirkulo. All rights reserved.
```

## Testing Scenarios

✅ Test with complete JWT data (all fields present)
✅ Test with partial JWT data (missing family_name)
✅ Test with minimal JWT data (only email)
✅ Test color rendering in different email clients
✅ Verify mobile responsiveness
✅ Check link functionality
✅ Test plain text fallback
✅ Verify special characters in names

## Customization

To modify the template, edit `/src/lib/email.ts`:

1. **Change colors:** Update hex values in style attributes
2. **Modify copy:** Edit the HTML/text content
3. **Add images:** Use hosted URLs (email-safe)
4. **Adjust layout:** Modify padding, margins, widths
5. **Add sections:** Insert new HTML blocks

## Brand Alignment

This email template matches your Citrea-inspired frontend design:
- ✅ Orange primary color (#e67e22)
- ✅ Warm gray neutrals
- ✅ Modern border radius (16px, 12px)
- ✅ Soft shadows
- ✅ Clean typography (Inter font)
- ✅ Gradient accents

The design creates a cohesive experience from email → web application.
