"use server";

import { transporter } from "./config";

export const sendCustomRequestEmail = async (data: {
  userEmail: string;
  userPhone: string;
  requestDetails: string;
  fileUrls?: string[];
}) => {
  const { userEmail, userPhone, requestDetails, fileUrls } = data;

  const mailOptions = {
    from: "info@sighattirebynaseem.com",
    to: "info@sighattirebynaseem.com",
    replyTo: userEmail,
    subject: "New Custom Design Request",
    html: `
        <h2>New Custom Design Request Received</h2>
        <p><strong>Customer Email:</strong> ${userEmail}</p>
        <p><strong>Customer Phone:</strong> ${userPhone}</p>
        <h3>Request Details:</h3>
        <p>${requestDetails}</p>
        ${
          fileUrls && fileUrls.length > 0
            ? `
          <h3>Reference Images:</h3>
          <p>Please find the reference images at the following links:</p>
          <ul>
            ${fileUrls
              .map(
                (url, index) => `
              <li><a href="${url}">Reference Image ${index + 1}</a></li>
            `
              )
              .join("")}
          </ul>
        `
            : ""
        }
      `,
  };

  // Verify transporter before sending
  await transporter.verify();

  // Send the email
  const info = await transporter.sendMail(mailOptions);
  console.log("Email sent successfully:", info.messageId);
};
