import nodemailer from 'nodemailer';
import logger from '@/utils/logger';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function send(options: nodemailer.SendMailOptions): Promise<void> {
  try {
    await getTransporter().sendMail(options);
    logger.info('Email sent', { to: options.to, subject: options.subject });
  } catch (err) {
    logger.error('Email send failed', { error: (err as Error).message });
    throw new AppError('Failed to send email', ERROR_CODES.EMAIL_ERROR, 503);
  }
}

export async function sendPasswordReset(
  to: string,
  resetToken: string,
): Promise<void> {
  const resetUrl = `${process.env.APP_URL ?? 'https://app.sprintfastest.com'}/reset-password?token=${resetToken}`;
  await send({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Reset your SprintFastest password',
    html: `
      <h2>Reset your password</h2>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, ignore this email.</p>
    `,
  });
}

export async function sendWeeklySummary(
  to: string,
  athleteName: string,
  sessionsCompleted: number,
  weekStartDate: string,
): Promise<void> {
  await send({
    from: process.env.EMAIL_FROM,
    to,
    subject: `SprintFastest — ${athleteName}'s weekly summary`,
    html: `
      <h2>Weekly Training Summary</h2>
      <p>Week of ${weekStartDate}</p>
      <p><strong>${athleteName}</strong> completed <strong>${sessionsCompleted}</strong> training session(s) this week.</p>
      <p>Keep up the great work!</p>
    `,
  });
}

export async function sendWelcome(to: string, role: string): Promise<void> {
  await send({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Welcome to SprintFastest',
    html: `
      <h2>Welcome to SprintFastest!</h2>
      <p>Your ${role} account has been created. Open the app to get started.</p>
    `,
  });
}

export async function sendVerificationEmail(
  to: string,
  token: string,
): Promise<void> {
  const url = `${process.env.APP_URL ?? 'https://app.sprintfastest.com'}/verify-email?token=${token}`;
  await send({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Verify your SprintFastest email address',
    html: `
      <h2>Verify your email</h2>
      <p>Click the link below to verify your email address. This link expires in 24 hours.</p>
      <a href="${url}">Verify Email</a>
      <p>If you didn't create an account, ignore this email.</p>
    `,
  });
}

export async function sendParentConsentRequest(
  parentEmail: string,
  athleteEmail: string,
  linkCode: string,
): Promise<void> {
  await send({
    from: process.env.EMAIL_FROM,
    to: parentEmail,
    subject: 'SprintFastest — parent consent required',
    html: `
      <h2>Parent / guardian consent needed</h2>
      <p>An account for <strong>${athleteEmail}</strong> (U11 age group) has been created on SprintFastest.</p>
      <p>Because this athlete is under 13, a parent or guardian must link their account before the athlete can sign in.</p>
      <p>Your link code: <strong>${linkCode}</strong></p>
      <p>This code expires in 48 hours. Enter it in the SprintFastest app under "Link Athlete".</p>
    `,
  });
}
