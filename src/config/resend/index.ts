import { SendEmailParams } from '@/config/resend/email.types';
import { Resend } from 'resend';
import environment from '../env.config';

export const resend = new Resend(environment.resendApiKey);

export async function sendEmail({ to, subject, react, replyTo }: SendEmailParams) {
  const { data, error } = await resend.emails.send({
    from: environment.resendFromEmail,
    to,
    subject,
    react,
    ...(replyTo ? { replyTo } : {})
  });

  if (error) {
    console.error('Email send error:', error.message);
    throw new Error('Failed to send email');
  }

  return data;
}
