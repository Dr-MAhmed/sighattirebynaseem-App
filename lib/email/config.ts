import nodemailer from 'nodemailer';

// Create a transporter using SMTP
export const transporter = nodemailer.createTransport({
  host: 'smtp.ionos.co.uk',
  port: 465,
  secure: true,
  auth: {
    user: 'info@sighattirebynaseem.com',
    pass: 'sighitoutwearitproud@5',
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
  },
});

// Verify transporter configuration
export const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection verification failed:', error);
    return false;
  }
}; 