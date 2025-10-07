import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email functionality will be disabled.');
}

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@kroiautocenter.fi';
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'kroiautocenter@gmail.com';