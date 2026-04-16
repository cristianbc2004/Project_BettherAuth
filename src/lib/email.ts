import nodemailer from "nodemailer";

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

type SendPasswordResetEmailParams = {
  email: string;
  name?: string | null;
  url: string;
};

export async function sendPasswordResetEmail({
  email,
  name,
  url,
}: SendPasswordResetEmailParams) {
  if (!transporter || !smtpFrom) {
    console.log(`[RESET-PASSWORD] ${email} -> ${url}`);
    throw new Error(
      "Reset password email is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM to .env.",
    );
  }

  await transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject: "Reset your password",
    text: `Hello ${name ?? ""}, use this link to reset your password: ${url}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Reset your password</h2>
        <p>Hello ${name ?? "there"},</p>
        <p>Click the button below to choose a new password.</p>
        <p>
          <a href="${url}" style="display:inline-block;padding:12px 18px;background:#283734;color:#ffffff;text-decoration:none;border-radius:8px;">
            Reset password
          </a>
        </p>
        <p>If the button does not work, open this link:</p>
        <p>${url}</p>
      </div>
    `,
  });
}
