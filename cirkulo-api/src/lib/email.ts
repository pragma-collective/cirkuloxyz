import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@xersha.xyz";
const APP_URL = process.env.APP_URL || "http://localhost:5173";

export interface SendInviteEmailParams {
	to: string;
	inviterName: string; // Lens username or fallback display name
	inviteToken?: string;
}

/**
 * Send an invite email to a user
 * @param params Email parameters including recipient, inviter name (Lens username), and optional invite token
 * @returns Resend response with email ID
 */
export async function sendInviteEmail(params: SendInviteEmailParams) {
	const { to, inviterName, inviteToken } = params;

	// Generate invite link
	const inviteLink = inviteToken
		? `${APP_URL}/invite?code=${inviteToken}`
		: `${APP_URL}/signup`;

	const subjectLine = `${inviterName} invited you to join Xersha`;

	console.log("SENDING EMAIL TO:", to, "INVITE LINK:", inviteLink);

	try {
		const data = await resend.emails.send({
			from: FROM_EMAIL,
			to,
			subject: subjectLine,
			html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Join Xersha</title>
          </head>
          <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2d2d2d; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fafaf9;">
            <!-- Header with Citrea-inspired gradient -->
            <div style="background: linear-gradient(135deg, #e67e22 0%, #d35400 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Welcome to Xersha</h1>
              <p style="color: rgba(255, 255, 255, 0.95); margin: 8px 0 0 0; font-size: 16px;">Join the circle community</p>
            </div>
            
            <!-- Main content -->
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #1f1f1f; margin-top: 0; font-size: 24px; font-weight: 600;">You've been invited!</h2>
              
              <p style="font-size: 16px; color: #525252; margin: 20px 0; line-height: 1.7;">
                <strong style="color: #e67e22;">${inviterName}</strong> has invited you to join their circle on Xersha. Xersha is a decentralized platform for creating and managing community circles.
              </p>
              
              <div style="background: linear-gradient(135deg, #fef3e2 0%, #fde8cc 100%); padding: 20px; border-radius: 12px; border-left: 4px solid #e67e22; margin: 25px 0;">
                <p style="margin: 0; color: #78350f; font-size: 15px;">
                  <strong style="color: #92400e;">${inviterName}</strong> thinks you'd be a great addition to their circle community!
                </p>
              </div>
              
              <p style="font-size: 16px; color: #525252; margin: 25px 0;">
                Click the button below to accept your invitation and create your account:
              </p>
              
              <!-- CTA Button with Citrea orange -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${inviteLink}" 
                   style="background: linear-gradient(135deg, #e67e22 0%, #d35400 100%); 
                          color: white; 
                          padding: 16px 40px; 
                          text-decoration: none; 
                          border-radius: 12px; 
                          font-weight: 600;
                          display: inline-block;
                          font-size: 16px;
                          box-shadow: 0 4px 6px -1px rgba(230, 126, 34, 0.3);
                          transition: all 0.2s;">
                  Accept Invitation →
                </a>
              </div>
              
              <!-- Alternative link -->
              <div style="margin-top: 35px; padding-top: 25px; border-top: 1px solid #e5e5e5;">
                <p style="font-size: 13px; color: #737373; margin: 0 0 10px 0;">
                  Or copy and paste this link into your browser:
                </p>
                <p style="font-size: 12px; color: #e67e22; word-break: break-all; background: #fef3e2; padding: 12px; border-radius: 8px; margin: 0; border: 1px solid #fde8cc;">
                  ${inviteLink}
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 25px; padding: 20px;">
              <p style="font-size: 12px; color: #a3a3a3; margin: 0;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
              <p style="font-size: 11px; color: #d4d4d4; margin: 10px 0 0 0;">
                © ${new Date().getFullYear()} Xersha. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
			// Plain text fallback
			text: `
${inviterName} has invited you to join their circle on Xersha!

${inviterName} thinks you'd be a great addition to their circle community.

Xersha is a decentralized platform for creating and managing community circles.

Click the link below to accept your invitation and create your account:
${inviteLink}

If you didn't expect this invitation, you can safely ignore this email.

© ${new Date().getFullYear()} Xersha. All rights reserved.
      `,
		});

		return data;
	} catch (error) {
		console.error("Failed to send invite email:", error);
		throw new Error(
			`Failed to send invite email: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}
