import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export class DataExporter {
  static async toCSV(data, fields) {
    try {
      const parser = new Parser({ fields });
      return parser.parse(data);
    } catch (error) {
      console.error('CSV Export error:', error);
      throw error;
    }
  }

  static async toExcel(data, sheetName = 'Data') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Add headers
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);
      
      // Style headers
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E7FF' }
      };
    }

    // Add data
    data.forEach(row => {
      worksheet.addRow(Object.values(row));
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  static async toPDF(data, title, options = {}) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20)
         .text('BuildTrack Report', { align: 'center' })
         .moveDown();

      doc.fontSize(14)
         .text(title, { align: 'center' })
         .moveDown();

      doc.fontSize(10)
         .text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' })
         .moveDown();

      // Content
      data.forEach((item, index) => {
        if (index > 0) doc.moveDown();
        doc.fontSize(12).text(`Item ${index + 1}:`, { underline: true });
        
        Object.entries(item).forEach(([key, value]) => {
          doc.fontSize(10)
             .text(`${key}: ${value || 'N/A'}`, { indent: 20 });
        });
      });

      doc.end();
    });
  }
}
