
import nodemailer from 'nodemailer';
import { generatePropertyBrochure, generateMultiPropertyBrochure } from '../utils/pdfGenerator';
import { PROPERTY_LISTINGS, getPropertyById } from '../properties';

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: string;
  }>;
  propertyIds?: string[]; // IDs of properties to include in brochure
  includeBrochure?: boolean; // Whether to generate and attach brochure
}

export default async function handler(req: any, res: any) {
  console.log('=== Email API Called ===');
  console.log('Method:', req.method);
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { to, subject, body, attachments, propertyIds, includeBrochure }: EmailRequest = req.body;
    
    console.log('Request received with fields:', { 
      to: to ? '[EMAIL]' : 'MISSING', 
      subject: subject ? '[SUBJECT]' : 'MISSING',
      bodyLength: body?.length || 0,
      propertyIds,
      includeBrochure
    });

    if (!to || !subject || !body) {
      console.error('Missing required fields:', { to: !!to, subject: !!subject, body: !!body });
      return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      console.error('Invalid email format:', to);
      return res.status(400).json({ error: 'Invalid email address format' });
    }

    console.log('Environment variables check:', {
      ZOHO_EMAIL: process.env.ZOHO_EMAIL ? 'SET' : 'MISSING',
      ZOHO_APP_PASSWORD: process.env.ZOHO_APP_PASSWORD ? 'SET' : 'MISSING',
      ZOHO_SMTP_HOST: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com',
      ZOHO_SMTP_PORT: process.env.ZOHO_SMTP_PORT || '465'
    });

    // Zoho SMTP Configuration
    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com',
      port: parseInt(process.env.ZOHO_SMTP_PORT || '465'),
      secure: process.env.ZOHO_SMTP_PORT === '465', // SSL for 465, TLS for 587
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_APP_PASSWORD,
      },
    });

    // Verify SMTP configuration
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return res.status(500).json({ error: 'SMTP configuration error. Please check your credentials.' });
    }

    // Generate brochure if requested with property IDs
    let finalAttachments = attachments || [];
    
    if (includeBrochure && propertyIds && propertyIds.length > 0) {
      console.log('Brochure generation requested for property IDs:', propertyIds);
      try {
        const properties = propertyIds
          .map(id => getPropertyById(id))
          .filter(p => p !== undefined);
        
        console.log('Found properties:', properties.length);
        
        if (properties.length > 0) {
          let brochureBase64: string;
          let filename: string;
          
          if (properties.length === 1) {
            brochureBase64 = generatePropertyBrochure(properties[0]);
            filename = `${properties[0].title.replace(/\s+/g, '_')}_Brochure.pdf`;
          } else {
            brochureBase64 = generateMultiPropertyBrochure(properties);
            filename = 'Property_Portfolio_Brochure.pdf';
          }
          
          finalAttachments.push({
            filename,
            content: brochureBase64
          });
          
          console.log(`Generated brochure for ${properties.length} property/properties`);
        } else {
          console.warn('No valid properties found for IDs:', propertyIds);
        }
      } catch (brochureError) {
        console.error('Brochure generation failed:', brochureError);
        // Continue without brochure if generation fails
      }
    }

    const mailOptions = {
      from: process.env.ZOHO_EMAIL,
      to,
      subject,
      html: body,
      attachments: finalAttachments.map(att => ({
        filename: att.filename,
        content: att.content,
        encoding: 'base64',
      })),
    };

    console.log('Sending email to:', to);
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    
    return res.status(200).json({ 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully',
      brochureIncluded: finalAttachments.length > (attachments?.length || 0)
    });

  } catch (error) {
    console.error('Email sending error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error message:', message);
    return res.status(500).json({ error: 'Failed to send email', details: message });
  }
}
