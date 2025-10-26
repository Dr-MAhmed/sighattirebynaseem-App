'use server';

import { transporter } from './config';

export type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function sendContactEmail(data: ContactFormData) {
  const { name, email, subject, message } = data;

  const mailOptions = {
    from: 'info@sighattirebynaseem.com',
    to: 'info@sighattirebynaseem.com',
    subject: `New Contact Form Submission: ${subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Failed to send email' };
  }
} 