import nodemailer from "nodemailer";

import { appConfig } from "@/lib/app-config";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? "587");
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM;

const isEmailConfigured = Boolean(smtpHost && smtpUser && smtpPass && smtpFrom);

const transporter =
  isEmailConfigured && smtpHost
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })
    : null;

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
  if (!transporter || !smtpFrom) {
    console.log(`[EMAIL-VERIFICATION] ${email} -> ${url}`);
    throw new Error(
      "Email verification is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM to .env.",
    );
  }

  const verificationUrl = `${appConfig.emailVerificationAppUrl}?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: smtpFrom,
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
