import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Downloads a DOM element as a real, authentic PDF document
 * @param element The container element containing the formatted form/document
 * @param fileName The output filename (e.g. "CPE-01.pdf")
 */
export async function downloadElementAsPdf(element: HTMLElement, fileName: string): Promise<boolean> {
  try {
    // Clone or capture element with html2canvas
    const canvas = await html2canvas(element, {
      scale: 2, // 2x resolution for sharp text and emblems
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 210; // A4 standard width in mm
    const pdfHeight = 297; // A4 standard height in mm
    
    // Calculate aspect ratio
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Additional pages if the document spans multiple pages
    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    pdf.save(cleanFileName);
    return true;
  } catch (error) {
    console.error('Failed to export PDF:', error);
    // Fallback: trigger standard browser print dialog
    window.print();
    return false;
  }
}

/**
 * Direct print utility tailored for document printing
 */
export function printDocument() {
  window.print();
}
