'use server';

import { transporter } from './config';
import { Order, OrderItem } from '@/types/order';
import { SentMessageInfo } from 'nodemailer';

// Function to generate HTML email content with improved structure
const generateOrderEmailContent = (order: Order) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - SighAttire</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://sighattirebynaseem.com/desklogo2.png" alt="SighAttire Logo" style="max-width: 200px; height: auto;">
      </div>

      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #333; margin-bottom: 20px; text-align: center;">Order Confirmation</h1>
        
        <p style="font-size: 16px;">Thank you, ${order.customerName}! Your order has been placed successfully.</p>
        <p style="font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 4px;">Order Number: ${order.order_number}</p>
        <p style="font-size: 16px;">Our team will contact you soon on WhatsApp to confirm your order once we verify your payment.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <h2 style="color: #444; margin-bottom: 15px; font-size: 18px;">Order Details:</h2>
          <p style="margin: 10px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p style="margin: 10px 0;"><strong>Total Amount:</strong> Rs${order.totalAmount.toFixed(2)}</p>
        </div>

        <div style="margin: 20px 0;">
          <h2 style="color: #444; margin-bottom: 15px; font-size: 18px;">Items Ordered:</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd;">Quantity</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">Rs${item.price.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin: 20px 0;">
          <h2 style="color: #444; margin-bottom: 15px; font-size: 18px;">Shipping Address:</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px;">
            <p style="margin: 5px 0;">${order.shippingAddress.street}</p>
            <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
            <p style="margin: 5px 0;">${order.shippingAddress.country}</p>
          </div>
        </div>

        <div style="margin: 30px 0; text-align: center;">
          <p style="font-size: 16px;">If you have any questions, please don't hesitate to contact on,</p>
          <p style="font-size: 16px;">Email: info@sighattirebynaseem.com or WhatsApp: +92 3354034038.</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">Thank you for shopping with Sigh Attire by Naseem!</p>
          <p style="color: #666; font-size: 14px;">© ${new Date().getFullYear()} Sigh Attire by Naseem. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Function to generate admin notification email content
const generateAdminNotificationContent = (order: Order) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Notification - SighAttire</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://sighattirebynaseem.com/desklogo2.png" alt="SighAttire Logo" style="max-width: 200px; height: auto;">
      </div>

      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #333; margin-bottom: 20px; text-align: center;">New Order Received</h1>
        
        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <h2 style="color: #444; margin-bottom: 15px; font-size: 18px;">Order Details:</h2>
          <p style="margin: 10px 0;"><strong>Order Number:</strong> ${order.order_number}</p>
          <p style="margin: 10px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p style="margin: 10px 0;"><strong>Total Amount:</strong> Rs${order.totalAmount.toFixed(2)}</p>
          <p style="margin: 10px 0;"><strong>Customer Name:</strong> ${order.customerName}</p>
          <p style="margin: 10px 0;"><strong>Customer Email:</strong> ${order.customerEmail}</p>
        </div>

        <div style="margin: 20px 0;">
          <h2 style="color: #444; margin-bottom: 15px; font-size: 18px;">Items Ordered:</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd;">Quantity</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">Rs${item.price.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin: 20px 0;">
          <h2 style="color: #444; margin-bottom: 15px; font-size: 18px;">Shipping Address:</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px;">
            <p style="margin: 5px 0;">${order.shippingAddress.street}</p>
            <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
            <p style="margin: 5px 0;">${order.shippingAddress.country}</p>
          </div>
        </div>

        <div style="margin: 30px 0; text-align: center;">
          <p style="font-size: 16px;">Please process this order as soon as possible.</p>
          <p style="font-size: 16px;">You can view the complete order details in your admin dashboard.</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">© ${new Date().getFullYear()} SighAttire. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Function to send admin notification email
export async function sendAdminOrderNotification(order: Order) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const mailOptions = {
        from: {
          name: 'SighAttire',
          address: 'info@sighattirebynaseem.com'
        },
        to: 'info@sighattirebynaseem.com', // Admin email
        subject: `New Order Received - Order ${order.order_number}`,
        html: generateAdminNotificationContent(order),
        headers: {
          'X-Entity-Ref-ID': order.id,
          'Message-ID': `<admin-${order.id}@gmail.com>`,
          'X-Priority': '1',
          'Importance': 'high',
          'X-MSMail-Priority': 'High',
          'Reply-To': 'info@sighattirebynaseem.com',
          'Return-Path': 'info@sighattirebynaseem.com',
          'X-Mailer': 'SighAttire Order System',
          'Date': new Date().toUTCString(),
          'MIME-Version': '1.0',
          'Content-Type': 'text/html; charset=UTF-8'
        },
        priority: 'high' as const,
        encoding: 'utf-8'
      };

      const info: SentMessageInfo = await transporter.sendMail(mailOptions);
      console.log('Admin notification email sent successfully:', info.messageId);

      return {
        success: true,
        message: 'Admin notification email sent successfully',
        messageId: info.messageId
      };
    } catch (error) {
      retryCount++;
      console.error(`Admin notification attempt ${retryCount} failed:`, error);
      
      if (retryCount === maxRetries) {
        return {
          success: false,
          message: 'Failed to send admin notification email after multiple attempts',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }

  return {
    success: false,
    message: 'Failed to send admin notification email'
  };
}

// Server action to send order confirmation email with retry logic
export async function sendOrderConfirmationEmail(order: Order) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      // Send customer confirmation email
      const customerMailOptions = {
        from: {
          name: 'SighAttire',
          address: 'info@sighattirebynaseem.com'
        },
        to: order.customerEmail,
        subject: `Order Confirmation - Order ${order.order_number}`,
        html: generateOrderEmailContent(order),
        headers: {
          'X-Entity-Ref-ID': order.id,
          'Message-ID': `<${order.id}@gmail.com>`,
          'X-Priority': '1',
          'Importance': 'high',
          'X-MSMail-Priority': 'High',
          'Reply-To': 'info@sighattirebynaseem.com',
          'Return-Path': 'info@sighattirebynaseem.com',
          'X-Mailer': 'SighAttire Order System',
          'Date': new Date().toUTCString(),
          'MIME-Version': '1.0',
          'Content-Type': 'text/html; charset=UTF-8'
        },
        priority: 'high' as const,
        encoding: 'utf-8',
        dsn: {
          id: order.id,
          return: 'headers',
          notify: ['failure', 'delay'],
          recipient: 'info@sighattirebynaseem.com'
        }
      };

      // Send customer email
      const customerInfo: SentMessageInfo = await transporter.sendMail(customerMailOptions);
      console.log('Customer email sent successfully:', customerInfo.messageId);

      // Send admin notification
      await sendAdminOrderNotification(order);

      return {
        success: true,
        message: 'Order confirmation emails sent successfully',
        messageId: customerInfo.messageId
      };
    } catch (error) {
      retryCount++;
      console.error(`Attempt ${retryCount} failed:`, error);
      
      if (retryCount === maxRetries) {
        return {
          success: false,
          message: 'Failed to send order confirmation email after multiple attempts',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }

  return {
    success: false,
    message: 'Failed to send order confirmation email'
  };
} 