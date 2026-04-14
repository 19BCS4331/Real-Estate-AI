import PDFDocument from 'pdfkit';
import { Property } from '../types';
import { Buffer } from 'buffer';

export function generatePropertyBrochure(property: Property): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const base64 = pdfBuffer.toString('base64');
        resolve(base64);
      });
      doc.on('error', reject);

      // Colors
      const primaryColor = '#fbbf24';
      const textColor = '#1f2937';
      const secondaryColor = '#4b5563';
      const accentColor = '#f59e0b';
      const whiteColor = '#ffffff';

      // Header
      doc.rect(0, 0, doc.page.width, 80, { fill: primaryColor });
      
      doc.fontSize(28).fillColor(textColor).font('Helvetica-Bold').text('Real Estate Agency', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).fillColor(textColor).font('Helvetica').text('Your Trusted Property Partner', { align: 'center' });

      // Property Title
      doc.moveDown(2);
      doc.fontSize(22).fillColor(textColor).font('Helvetica-Bold').text(property.title);
      
      doc.moveDown(0.5);
      doc.fontSize(14).fillColor(secondaryColor).font('Helvetica').text(`${property.type} | ${property.location}`);
      
      // Price Box
      doc.moveDown(1);
      doc.rect(50, doc.y, doc.page.width - 100, 40, { fill: primaryColor });
      doc.moveDown(1.5);
      doc.fontSize(32).fillColor(textColor).font('Helvetica-Bold').text(property.price, { align: 'center' });
      
      // Key Details
      doc.moveDown(2);
      doc.fontSize(18).fillColor(textColor).font('Helvetica-Bold').text('Property Details');
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke(accentColor);
      
      doc.moveDown(1);
      doc.fontSize(12).fillColor(secondaryColor).font('Helvetica');
      
      const details = [
        { label: 'Bedrooms', value: property.bedrooms.toString() },
        { label: 'Bathrooms', value: property.bathrooms.toString() },
        { label: 'Area', value: property.area },
        { label: 'Builder', value: property.builder },
        { label: 'Possession', value: property.possession }
      ];
      
      let xPos = 50;
      let yPos = doc.y;
      
      details.forEach((detail, index) => {
        if (index % 2 === 0 && index !== 0) {
          xPos = 50;
          yPos += 25;
        }
        
        doc.fontSize(11).fillColor(textColor).font('Helvetica-Bold').text(`${detail.label}:`, xPos, yPos);
        doc.fontSize(11).fillColor(secondaryColor).font('Helvetica').text(detail.value, xPos + 60, yPos);
        
        xPos += 200;
      });
      
      // Description
      doc.moveDown(3);
      doc.fontSize(18).fillColor(textColor).font('Helvetica-Bold').text('Description');
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke(accentColor);
      
      doc.moveDown(1);
      doc.fontSize(11).fillColor(secondaryColor).font('Helvetica').text(property.description, { width: doc.page.width - 100, align: 'justify' });
      
      // Amenities
      doc.moveDown(2);
      doc.fontSize(18).fillColor(textColor).font('Helvetica-Bold').text('Amenities');
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke(accentColor);
      
      doc.moveDown(1);
      doc.fontSize(11).fillColor(secondaryColor).font('Helvetica');
      property.amenities.forEach(amenity => {
        doc.text(`• ${amenity}`);
      });
      
      // Footer
      doc.rect(0, doc.page.height - 50, doc.page.width, 50, { fill: textColor });
      doc.fontSize(10).fillColor(whiteColor).font('Helvetica').text('© 2026 Real Estate Agency. All rights reserved.', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(9).fillColor('#9ca3af').font('Helvetica').text('Contact us for site visits and more information.', { align: 'center' });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function generateMultiPropertyBrochure(properties: Property[]): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const base64 = pdfBuffer.toString('base64');
        resolve(base64);
      });
      doc.on('error', reject);

      // Header
      doc.rect(0, 0, doc.page.width, 70, { fill: '#fbbf24' });
      doc.fontSize(24).fillColor('#1f2937').font('Helvetica-Bold').text('Real Estate Agency', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#1f2937').font('Helvetica').text('Property Portfolio', { align: 'center' });

      // Properties
      let yPos = doc.y + 20;
      
      properties.forEach((property) => {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }
        
        // Property Card
        doc.rect(40, yPos - 10, doc.page.width - 80, 100, { fill: '#f8fafc', stroke: '#e5e7eb', strokeWidth: 1 });
        
        yPos += 10;
        doc.fontSize(16).fillColor('#1f2937').font('Helvetica-Bold').text(property.title);
        doc.moveDown(0.3);
        doc.fontSize(11).fillColor('#4b5563').font('Helvetica').text(`${property.type} | ${property.location}`);
        doc.moveDown(0.3);
        doc.fontSize(14).fillColor('#f59e0b').font('Helvetica-Bold').text(property.price);
        doc.moveDown(0.3);
        doc.fontSize(10).fillColor('#4b5563').font('Helvetica').text(`${property.bedrooms} Beds | ${property.bathrooms} Baths | ${property.area}`);
        doc.moveDown(0.3);
        doc.fontSize(9).fillColor('#6b7280').font('Helvetica').text(property.description, { width: doc.page.width - 120, align: 'justify' });
        
        yPos += 110;
      });
      
      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.rect(0, doc.page.height - 40, doc.page.width, 40, { fill: '#1f2937' });
        doc.fontSize(9).fillColor('#9ca3af').font('Helvetica').text('© 2026 Real Estate Agency. All rights reserved.', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(8).fillColor('#6b7280').font('Helvetica').text('Contact us for site visits and more information.', { align: 'center' });
      }
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
