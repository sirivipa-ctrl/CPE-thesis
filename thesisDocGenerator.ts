import jsPDF from 'jspdf';
import { Thesis } from '../types';
import { formatStudentNamesText } from './studentHelper';

/**
 * Generates an official, standard Computer Engineering Senior Project Document
 * formatted according to Kasetsart University CSC standards.
 */
export function buildThesisPdfDoc(thesis: Thesis): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const studentName = formatStudentNamesText(thesis);
  const advisors = thesis.advisorNames.join(', ');
  const year = thesis.academicYear || '2568';
  const code = thesis.code || 'CPE-2568-661';

  // Page 1: Official Front Cover
  doc.setFillColor(15, 118, 110); // Emerald brand bar
  doc.rect(0, 0, 210, 12, 'F');

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`KASETSART UNIVERSITY CSC - DEPARTMENT OF COMPUTER ENGINEERING • ${code}`, 105, 22, { align: 'center' });

  doc.setFontSize(20);
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.text(thesis.titleTh || 'ปริญญานิพนธ์วิศวกรรมคอมพิวเตอร์', 105, 55, { align: 'center', maxWidth: 170 });

  if (thesis.titleEn) {
    doc.setFontSize(14);
    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'italic');
    doc.text(thesis.titleEn, 105, 75, { align: 'center', maxWidth: 170 });
  }

  // Emblem / Decorative Box
  doc.setDrawColor(209, 213, 219);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(30, 95, 150, 45, 3, 3, 'FD');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('SENIOR PROJECT REPORT (CPE)', 105, 110, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.setFont('helvetica', 'normal');
  doc.text(`Academic Year: ${year} • Semester: ${thesis.semester || '1'}`, 105, 120, { align: 'center' });
  doc.text(`Category: ${thesis.category}`, 105, 128, { align: 'center' });

  // Author details
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.text('BY', 105, 160, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(15, 118, 110);
  doc.text(studentName, 105, 172, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text('Department of Electrical and Computer Engineering', 105, 182, { align: 'center' });
  doc.text('Faculty of Science and Engineering', 105, 188, { align: 'center' });
  doc.text('Kasetsart University Chalermphrakiat Sakon Nakhon Province Campus', 105, 194, { align: 'center' });

  // Advisors
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.text('PROJECT ADVISORS', 105, 220, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(75, 85, 99);
  doc.setFont('helvetica', 'normal');
  doc.text(advisors, 105, 230, { align: 'center' });

  // Approval status stamp
  doc.setDrawColor(16, 185, 129);
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(65, 250, 80, 16, 2, 2, 'FD');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70);
  doc.text('STATUS: FULLY APPROVED & DEFENDED', 105, 260, { align: 'center' });

  // Page 2: Abstract & Table of Contents
  doc.addPage();
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, 210, 8, 'F');

  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.text('ABSTRACT / บทคัดย่อ', 20, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  const abstractText = thesis.abstractTh || 'โครงงานนี้มุ่งเน้นการพัฒนาระบบเทคโนโลยีวิศวกรรมคอมพิวเตอร์อย่างมีประสิทธิภาพ ครอบคลุมการออกแบบ การวิเคราะห์ และการทดสอบระบบ';
  const splitAbstract = doc.splitTextToSize(abstractText, 170);
  doc.text(splitAbstract, 20, 35);

  if (thesis.abstractEn) {
    const nextY = 35 + (splitAbstract.length * 6) + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('English Abstract', 20, nextY);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    const splitEn = doc.splitTextToSize(thesis.abstractEn, 170);
    doc.text(splitEn, 20, nextY + 8);
  }

  // Keywords
  const kwY = 140;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text(`Keywords: ${(thesis.keywords || ['AI', 'Computer Engineering', 'Machine Learning']).join(', ')}`, 20, kwY);

  // Table of Contents Preview
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text('TABLE OF CONTENTS (สารบัญ)', 20, 160);

  const tocItems = [
    { no: 'Chapter 1', title: 'บทนำ ความเป็นมาและวัตถุประสงค์ (Introduction)', page: '1' },
    { no: 'Chapter 2', title: 'ทฤษฎีและงานวิจัยที่เกี่ยวข้อง (Literature Review)', page: '12' },
    { no: 'Chapter 3', title: 'การออกแบบระบบและขั้นตอนวิธี (System Methodology)', page: '28' },
    { no: 'Chapter 4', title: 'ผลการทดลองและการวิเคราะห์ผล (Results & Evaluation)', page: '54' },
    { no: 'Chapter 5', title: 'สรุปผลและข้อเสนอแนะ (Conclusions & Recommendations)', page: '72' },
    { no: 'Appendix', title: 'ภาคผนวกและซอร์สโค้ด (Appendix & Source Code)', page: '80' },
  ];

  let currentY = 175;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  tocItems.forEach((item) => {
    doc.text(`${item.no}: ${item.title}`, 20, currentY);
    doc.text(`หน้า ${item.page}`, 180, currentY, { align: 'right' });
    currentY += 10;
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Department of Computer Engineering - Kasetsart University CSC • Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }

  return doc;
}

/**
 * Download official senior project document
 */
export function generateOfficialThesisPdf(thesis: Thesis): void {
  const doc = buildThesisPdfDoc(thesis);
  const safeFileName = `${thesis.code || 'CPE-Project'}_Full_Thesis.pdf`;
  doc.save(safeFileName);
}

/**
 * Generate binary Blob of official senior project document
 */
export function createOfficialThesisPdfBlob(thesis: Thesis): Blob {
  const doc = buildThesisPdfDoc(thesis);
  return doc.output('blob');
}

/**
 * Generate active object URL for opening and reading the PDF in reader
 */
export function createOfficialThesisPdfUrl(thesis: Thesis): string {
  const blob = createOfficialThesisPdfBlob(thesis);
  return URL.createObjectURL(blob);
}
