import jsPDF from 'jspdf';
import { Property } from '../types';

export function generatePropertyBrochure(property: Property): string {
  const doc = new jsPDF();
  
  // Colors defined as tuples for TypeScript
  const primaryColor: [number, number, number] = [251, 191, 36]; // #fbbf24 (yellow)
  const textColor: [number, number, number] = [31, 41, 55]; // #1f2937 (dark gray)
  const secondaryColor: [number, number, number] = [75, 85, 99]; // #4b5563 (gray)
  const accentColor: [number, number, number] = [245, 158, 11]; // #f59e0b (amber)
  
  let yPosition = 20;
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 50, 'F');
  
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Real Estate Agency', 105, 25, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Trusted Property Partner', 105, 35, { align: 'center' });
  
  yPosition = 60;
  
  // Property Title
  doc.setTextColor(...textColor);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(property.title, 20, yPosition);
  
  yPosition += 15;
  
  // Property Type and Location
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  doc.text(`${property.type} | ${property.location}`, 20, yPosition);
  
  yPosition += 20;
  
  // Price Box
  doc.setFillColor(...primaryColor);
  doc.roundedRect(20, yPosition - 8, 170, 30, 3, 3, 'F');
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(property.price, 105, yPosition + 12, { align: 'center' });
  
  yPosition += 40;
  
  // Key Details Grid
  doc.setTextColor(...textColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Property Details', 20, yPosition);
  
  yPosition += 10;
  
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 190, yPosition);
  
  yPosition += 15;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  
  const details = [
    { label: 'Bedrooms', value: property.bedrooms.toString() },
    { label: 'Bathrooms', value: property.bathrooms.toString() },
    { label: 'Area', value: property.area },
    { label: 'Builder', value: property.builder },
    { label: 'Possession', value: property.possession }
  ];
  
  let xPos = 20;
  let yPos = yPosition;
  
  details.forEach((detail, index) => {
    if (index % 2 === 0 && index !== 0) {
      xPos = 20;
      yPos += 15;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text(`${detail.label}:`, xPos, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    doc.text(detail.value, xPos + 40, yPos);
    
    xPos += 100;
  });
  
  yPosition = yPos + 25;
  
  // Description
  doc.setTextColor(...textColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 20, yPosition);
  
  yPosition += 10;
  
  doc.setDrawColor(...accentColor);
  doc.line(20, yPosition, 190, yPosition);
  
  yPosition += 15;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  
  const splitDescription = doc.splitTextToSize(property.description, 170);
  doc.text(splitDescription, 20, yPosition);
  
  yPosition += splitDescription.length * 7 + 20;
  
  // Amenities
  doc.setTextColor(...textColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Amenities', 20, yPosition);
  
  yPosition += 10;
  
  doc.setDrawColor(...accentColor);
  doc.line(20, yPosition, 190, yPosition);
  
  yPosition += 15;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  
  const amenityText = property.amenities.map(a => `• ${a}`).join('\n');
  const splitAmenities = doc.splitTextToSize(amenityText, 170);
  doc.text(splitAmenities, 20, yPosition);
  
  yPosition += splitAmenities.length * 7 + 30;
  
  // Footer
  doc.setFillColor(31, 41, 55);
  doc.rect(0, 280, 210, 17, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('© 2026 Real Estate Agency. All rights reserved.', 105, 287, { align: 'center' });
  doc.text('Contact us for site visits and more information.', 105, 293, { align: 'center' });
  
  // Return PDF as base64
  return doc.output('datauristring').split(',')[1];
}

export function generateMultiPropertyBrochure(properties: Property[]): string {
  const doc = new jsPDF();
  
  // Colors defined as tuples for TypeScript
  const primaryColor: [number, number, number] = [251, 191, 36];
  const textColor: [number, number, number] = [31, 41, 55];
  const secondaryColor: [number, number, number] = [75, 85, 99];
  const accentColor: [number, number, number] = [245, 158, 11];
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Real Estate Agency', 105, 20, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Property Portfolio', 105, 30, { align: 'center' });
  
  let yPosition = 55;
  
  properties.forEach((property, index) => {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Property Card
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(15, yPosition - 5, 180, 70, 3, 3, 'F');
    
    doc.setTextColor(...textColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(property.title, 20, yPosition + 5);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    doc.text(`${property.type} | ${property.location}`, 20, yPosition + 12);
    
    doc.setTextColor(...accentColor);
    doc.setFont('helvetica', 'bold');
    doc.text(property.price, 20, yPosition + 20);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    doc.text(`${property.bedrooms} Beds | ${property.bathrooms} Baths | ${property.area}`, 20, yPosition + 28);
    
    const splitDesc = doc.splitTextToSize(property.description, 160);
    doc.text(splitDesc, 20, yPosition + 38);
    
    yPosition += splitDesc.length * 5 + 50;
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(31, 41, 55);
    doc.rect(0, 280, 210, 17, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('© 2026 Real Estate Agency. All rights reserved.', 105, 287, { align: 'center' });
    doc.text('Contact us for site visits and more information.', 105, 293, { align: 'center' });
  }
  
  return doc.output('datauristring').split(',')[1];
}
