'use server';

import { transporter } from './config';

export async function sendNewsletterSubscriptionEmail(subscriberEmail: string) {
  const mailOptions = {
    from: {
      name: 'SighAttire',
      address: 'info@sighattirebynaseem.com'
    },
    to: 'info@sighattirebynaseem.com', // Admin email
    subject: 'New Newsletter Subscription',
    html: `
      <h2>New Newsletter Subscription</h2>
      <p>A new user has subscribed to your newsletter:</p>
      <p><strong>Email:</strong> ${subscriberEmail}</p>
      <p><strong>Subscription Date:</strong> ${new Date().toLocaleString()}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending newsletter subscription email:', error);
    return { success: false, error: 'Failed to send email notification' };
  }
} 