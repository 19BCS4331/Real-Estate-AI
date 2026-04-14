import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';
import { Property } from '../types';

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxCharsPerLine) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

export async function generatePropertyBrochure(property: Property): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const primary = rgb(...hexToRgb('#fbbf24'));
  const dark = rgb(...hexToRgb('#1f2937'));
  const gray = rgb(...hexToRgb('#4b5563'));
  const amber = rgb(...hexToRgb('#f59e0b'));
  const white = rgb(1, 1, 1);
  const lightGray = rgb(...hexToRgb('#f3f4f6'));

  // Header background
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: primary });

  // Header text
  page.drawText('Real Estate Agency', {
    x: width / 2 - boldFont.widthOfTextAtSize('Real Estate Agency', 26) / 2,
    y: height - 42, font: boldFont, size: 26, color: dark,
  });
  page.drawText('Your Trusted Property Partner', {
    x: width / 2 - regularFont.widthOfTextAtSize('Your Trusted Property Partner', 12) / 2,
    y: height - 64, font: regularFont, size: 12, color: dark,
  });

  let y = height - 110;

  // Property title
  page.drawText(property.title, { x: 50, y, font: boldFont, size: 22, color: dark });
  y -= 24;
  page.drawText(`${property.type}  |  ${property.location}`, { x: 50, y, font: regularFont, size: 13, color: gray });
  y -= 20;

  // Price box
  page.drawRectangle({ x: 50, y: y - 10, width: width - 100, height: 36, color: primary });
  const priceW = boldFont.widthOfTextAtSize(property.price, 22);
  page.drawText(property.price, { x: width / 2 - priceW / 2, y: y + 4, font: boldFont, size: 22, color: dark });
  y -= 50;

  // Details section
  page.drawText('Property Details', { x: 50, y, font: boldFont, size: 16, color: dark });
  y -= 8;
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: amber });
  y -= 20;

  const details = [
    { label: 'Bedrooms', value: property.bedrooms.toString() },
    { label: 'Bathrooms', value: property.bathrooms.toString() },
    { label: 'Area', value: property.area },
    { label: 'Builder', value: property.builder },
    { label: 'Possession', value: property.possession },
  ];

  for (let i = 0; i < details.length; i += 2) {
    const left = details[i];
    const right = details[i + 1];
    page.drawText(`${left.label}:`, { x: 50, y, font: boldFont, size: 11, color: dark });
    page.drawText(left.value, { x: 130, y, font: regularFont, size: 11, color: gray });
    if (right) {
      page.drawText(`${right.label}:`, { x: 300, y, font: boldFont, size: 11, color: dark });
      page.drawText(right.value, { x: 380, y, font: regularFont, size: 11, color: gray });
    }
    y -= 20;
  }
  y -= 12;

  // Description
  page.drawText('Description', { x: 50, y, font: boldFont, size: 16, color: dark });
  y -= 8;
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: amber });
  y -= 18;

  const descLines = wrapText(property.description, 85);
  for (const line of descLines) {
    page.drawText(line, { x: 50, y, font: regularFont, size: 11, color: gray });
    y -= 16;
  }
  y -= 12;

  // Amenities
  page.drawText('Amenities', { x: 50, y, font: boldFont, size: 16, color: dark });
  y -= 8;
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: amber });
  y -= 18;

  for (let i = 0; i < property.amenities.length; i += 2) {
    page.drawText(`•  ${property.amenities[i]}`, { x: 50, y, font: regularFont, size: 11, color: gray });
    if (property.amenities[i + 1]) {
      page.drawText(`•  ${property.amenities[i + 1]}`, { x: 280, y, font: regularFont, size: 11, color: gray });
    }
    y -= 16;
  }

  // Footer
  page.drawRectangle({ x: 0, y: 0, width, height: 40, color: dark });
  page.drawText('© 2026 Real Estate Agency. All rights reserved.', {
    x: width / 2 - regularFont.widthOfTextAtSize('© 2026 Real Estate Agency. All rights reserved.', 9) / 2,
    y: 22, font: regularFont, size: 9, color: white,
  });
  page.drawText('Contact us for site visits and more information.', {
    x: width / 2 - regularFont.widthOfTextAtSize('Contact us for site visits and more information.', 8) / 2,
    y: 10, font: regularFont, size: 8, color: rgb(0.6, 0.6, 0.6),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString('base64');
}

export async function generateMultiPropertyBrochure(properties: Property[]): Promise<string> {
  const pdfDoc = await PDFDocument.create();

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const primary = rgb(...hexToRgb('#fbbf24'));
  const dark = rgb(...hexToRgb('#1f2937'));
  const gray = rgb(...hexToRgb('#4b5563'));
  const amber = rgb(...hexToRgb('#f59e0b'));
  const white = rgb(1, 1, 1);
  const cardBg = rgb(...hexToRgb('#f8fafc'));

  const addHeader = (page: ReturnType<typeof pdfDoc.addPage>, title: string) => {
    const { width, height } = page.getSize();
    page.drawRectangle({ x: 0, y: height - 70, width, height: 70, color: primary });
    page.drawText('Real Estate Agency', {
      x: width / 2 - boldFont.widthOfTextAtSize('Real Estate Agency', 22) / 2,
      y: height - 36, font: boldFont, size: 22, color: dark,
    });
    page.drawText(title, {
      x: width / 2 - regularFont.widthOfTextAtSize(title, 11) / 2,
      y: height - 56, font: regularFont, size: 11, color: dark,
    });
  };

  let page = pdfDoc.addPage(PageSizes.A4);
  let { width, height } = page.getSize();
  addHeader(page, 'Property Portfolio');
  let y = height - 90;

  for (const property of properties) {
    const cardHeight = 115;
    if (y - cardHeight < 50) {
      // Footer on current page
      page.drawRectangle({ x: 0, y: 0, width, height: 35, color: dark });
      page.drawText('© 2026 Real Estate Agency', {
        x: width / 2 - regularFont.widthOfTextAtSize('© 2026 Real Estate Agency', 8) / 2,
        y: 12, font: regularFont, size: 8, color: white,
      });
      page = pdfDoc.addPage(PageSizes.A4);
      ({ width, height } = page.getSize());
      addHeader(page, 'Property Portfolio (continued)');
      y = height - 90;
    }

    // Card background
    page.drawRectangle({ x: 40, y: y - cardHeight + 10, width: width - 80, height: cardHeight, color: cardBg });
    page.drawRectangle({ x: 40, y: y - cardHeight + 10, width: width - 80, height: cardHeight, borderColor: rgb(0.9, 0.9, 0.9), borderWidth: 1 });

    page.drawText(property.title, { x: 55, y, font: boldFont, size: 15, color: dark });
    y -= 18;
    page.drawText(`${property.type}  |  ${property.location}`, { x: 55, y, font: regularFont, size: 10, color: gray });
    y -= 16;
    page.drawText(property.price, { x: 55, y, font: boldFont, size: 14, color: amber });
    y -= 16;
    page.drawText(`${property.bedrooms} Beds  |  ${property.bathrooms} Baths  |  ${property.area}  |  ${property.possession}`, {
      x: 55, y, font: regularFont, size: 10, color: gray,
    });
    y -= 16;
    const descLines = wrapText(property.description, 90).slice(0, 2);
    for (const line of descLines) {
      page.drawText(line, { x: 55, y, font: regularFont, size: 9, color: rgb(0.42, 0.45, 0.50) });
      y -= 13;
    }

    y -= 18;
  }

  // Footer on last page
  page.drawRectangle({ x: 0, y: 0, width, height: 35, color: dark });
  page.drawText('© 2026 Real Estate Agency. All rights reserved.', {
    x: width / 2 - regularFont.widthOfTextAtSize('© 2026 Real Estate Agency. All rights reserved.', 8) / 2,
    y: 12, font: regularFont, size: 8, color: white,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString('base64');
}
