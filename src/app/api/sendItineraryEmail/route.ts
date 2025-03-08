import { NextRequest, NextResponse } from "next/server";
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { itineraryData, destinationName } = await request.json();
    
    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this to another service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use app-specific password for better security
      },
    });
    
    // Format the email content
    const emailContent = `
      <h1>Your Travel Itinerary for ${itineraryData}</h1>
      <p>Please find attached your itinerary details in JSON format.</p>
      <p>Thank you for using our service!</p>
    `;
    
    // Create the JSON attachment
    const jsonContent = JSON.stringify(itineraryData, null, 2);
    const filename = `${destinationName.replace(/\s+/g, '_')}_itinerary.json`;
    
    // Send the email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'dev@rbdesigntech.com', // Hard-coded email as requested
      subject: `Travel Itinerary for ${destinationName}`,
      html: emailContent,
      attachments: [
        {
          filename: filename,
          content: jsonContent,
          contentType: 'application/json',
        },
      ],
    });
    
    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
