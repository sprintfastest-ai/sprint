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
