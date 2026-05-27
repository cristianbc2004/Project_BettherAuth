import { Resend } from "resend";

import { appConfig } from "@repo/config";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

type SendVerificationEmailParams = {
  email: string;
  name?: string | null;
  token: string;
  url: string;
};

export async function sendVerificationEmail({
  email,
  name,
  token,
  url,
}: SendVerificationEmailParams) {
  if (!resend || !resendFrom) {
    console.log(`[EMAIL-VERIFICATION] ${email} -> ${url}`);
    throw new Error(
      "Email verification is not configured. Add RESEND_API_KEY and RESEND_FROM to .env.",
    );
  }

  const verificationUrl = `${appConfig.emailVerificationAppUrl}?token=${encodeURIComponent(token)}`;

  await resend.emails.send({
    from: resendFrom,
    to: email,
    subject: "Verify your email address",
    text: `Hello ${name ?? ""}, use this link to verify your email: ${url}\n\nIf your device supports the app deep link, you can also open: ${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Verify your email address</h2>
        <p>Hello ${name ?? "there"},</p>
        <p>Click the button below to confirm your email address.</p>
        <p>
          <a href="${url}" style="display:inline-block;padding:12px 18px;background:#283734;color:#ffffff;text-decoration:none;border-radius:8px;">
            Verify email
          </a>
        </p>
        <p>If the button does not work, open this verification link:</p>
        <p>${url}</p>
        <p style="font-size:12px;color:#666;">App deep link: ${verificationUrl}</p>
      </div>
    `,
  });
}