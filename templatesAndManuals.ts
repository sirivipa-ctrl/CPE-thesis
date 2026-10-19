import { FormTemplateItem } from '../types';

export interface OfficialProjectForm {
  id: string;
  code: string;
  title: string;
  categoryGroup: 'management' | 'other' | 'templates';
  description: string;
  pdfAvailable: boolean;
  wordAvailable: boolean;
  fileSize: string;
  year: string;
  formTypeNumber: string;
}

export const OFFICIAL_PROJECT_FORMS: OfficialProjectForm[] = [
  // 0. ข้อปฏิบัติและแนวทางการนำเสนอ (Official Guidelines)
  {
    id: 'form-guidelines',
    code: 'CPE-GUIDELINES',
    formTypeNumber: 'GUIDE',
    title: 'ข้อปฏิบัติและแนวทางการนำเสนอโครงงานวิศวกรรมคอมพิวเตอร์',
    categoryGroup: 'management',
    description: 'เอกสารระเบียบข้อปฏิบัติทางการ: การกำหนดตารางนำเสนอ, การยืนยันขอนำเสนอ, การขอเลื่อนสอบ, การเตรียมตัว, เกณฑ์ 80%, และระเบียบการให้เกรด F',
    pdfAvailable: true,
    wordAvailable: true,
    fileSize: '95 KB',
    year: '2567-2568'
  },
  // 1. แบบฟอร์มที่เกี่ยวข้องสำหรับการบริหารจัดการวิชาโครงงาน/การเตรียมความพร้อมโครงงาน
  {
    id: 'form-01',
    code: 'CPE-01',
    formTypeNumber: '1',
    title: '1-แบบขอเสนออนุมัติโครงงานวิศวกรรมคอมพิวเตอร์',
    categoryGroup: 'management',
    description: 'แบบฟอร์มยื่นเสนอโครงร่าง รายชื่อสมาชิกกลุ่ม ประเภทโครงงาน (Web, Mobile, AI/ML, IoT, Network) และอาจารย์ที่ปรึกษาหลัก/ร่วม',
    pdfAvailable: true,
    wordAvailable: true,
    fileSize: '45 KB',
    year: '2567-2568'
  },
  {
    id: 'form-02',
    code: 'CPE-02-EVAL',
    formTypeNumber: '2',
    title: '2-แบบประเมินการนำเสนอข้อเสนอโครงงานบทที่ 1 - 3',
    categoryGroup: 'management',
    description: 'แบบประเมินการสอบความก้าวหน้ารายวิชาเตรียมความพร้อมโครงงาน (วัตถุประสงค์, ขอบเขต, วิธีการดำเนินงาน, เอกสารอ้างอิง, การนำเสนอ 40 คะแนน, ทฤษฎี 30 คะแนน, เอกสาร 30 คะแนน)',
    pdfAvailable: true,
    wordAvailable: true,
    fileSize: '58 KB',
    year: '2567-2568'
  },
  {
    id: 'form-04-eval',
    code: 'CPE-04-EVAL',
    formTypeNumber: '4',
    title: '4-แบบประเมินการนำเสนอโครงงาน 100% (โปรแกรม+รูปเล่มปริญญานิพนธ์)',
    categoryGroup: 'management',
    description: 'แบบประเมินผลการสอบป้องกันโครงงานฉบับสมบูรณ์ (ส่วนที่ 1 นำเสนอ 30 คะแนน, ส่วนที่ 2 ผลงาน 50 คะแนน, ส่วนที่ 3 เล่มเอกสาร 20 คะแนน รวม 100 คะแนน เกรด A - F)',
    pdfAvailable: true,
    wordAvailable: true,
    fileSize: '65 KB',
    year: '2567-2568'
  },
  {
    id: 'form-04-rubric',
    code: 'CPE-04-RUBRIC',
    formTypeNumber: '4',
    title: '4-เกณฑ์การประเมินโครงงาน 100% (โปรแกรม+รูปเล่มปริญญานิพนธ์)',
    categoryGroup: 'management',
    description: 'เกณฑ์การให้คะแนนรูบริก (Rubric Score) การสอบโครงงานสมบูรณ์ (นิสิตไม่ต้องปริ้น)',
    pdfAvailable: true,
    wordAvailable: false,
    fileSize: '120 KB',
    year: '2567-2568'
  },
  {
    id: 'form-05-confirm',
    code: 'CPE-05-CONFIRM',
    formTypeNumber: '5',
    title: '5-แบบฟอร์มยืนยันการขอนำเสนอโครงงานวิศวกรรมคอมพิวเตอร์',
    categoryGroup: 'management',
    description: 'แบบคำร้องขออนุมัติขึ้นสอบนำเสนอบทที่ 1-3 หรือนำเสนอ 100% ลงนามโดยอาจารย์ที่ปรึกษา และอาจารย์ผู้ประสานงานรายวิชา (ยื่นก่อนสิ้นสุดถอน W)',
    pdfAvailable: true,
    wordAvailable: true,
    fileSize: '48 KB',
    year: '2567-2568'
  },

  // 2. แบบฟอร์มอื่น ๆ ที่เกี่ยวข้อง
  {
    id: 'form-other-logbook',
    code: 'CPE-LOGBOOK',
    formTypeNumber: 'LOG',
    title: 'แบบฟอร์มสมุดบันทึกรายงานการเข้าพบอาจารย์ที่ปรึกษา',
    categoryGroup: 'other',
    description: 'สมุดบันทึกสรุปงานที่เข้าพบอาจารย์ที่ปรึกษา ครั้งที่ 1, 2, 3, 4, 5... พร้อมเกณฑ์คะแนนความก้าวหน้า 10-30 คะแนนตามระดับเนื้องาน',
    pdfAvailable: true,
    wordAvailable: true,
    fileSize: '180 KB',
    year: '2567-2568'
  },
  {
    id: 'form-other-scoresheet',
    code: 'CPE-SCORE',
    formTypeNumber: 'SCORE',
    title: 'แบบฟอร์มคะแนนการเข้าพบอาจารย์ที่ปรึกษา',
    categoryGroup: 'other',
    description: 'แบบสรุปบันทึกการประเมินคะแนนการเข้าพบของอาจารย์ที่ปรึกษาหลักและร่วมตลอดภาคการศึกษา',
    pdfAvailable: true,
    wordAvailable: true,
    fileSize: '75 KB',
    year: '2567-2568'
  },
  {
    id: 'form-other-scope',
    code: 'CPE-SCOPE',
    formTypeNumber: 'SCOPE',
    title: 'แบบอนุมัติขอบเขตโครงงานวิศวกรรมคอมพิวเตอร์',
    categoryGroup: 'other',
    description: 'ตารางแสดงรายละเอียดขอบเขตโครงงาน 18 หัวข้อ พร้อมระบุค่าน้ำหนักของแต่ละหัวข้อรวม 100% ลงนามโดยอาจารย์ที่ปรึกษาและกรรมการ 2 ท่าน',
    pdfAvailable: true,
    wordAvailable: true,
    fileSize: '54 KB',
    year: '2567-2568'
  },

  // 3. เทมเพลตจัดทำรูปเล่ม
  {
    id: 'tmpl-word',
    code: 'TEMPLATE-WORD',
    formTypeNumber: 'TMPL',
    title: 'เทมเพลตจัดทำรูปเล่มปริญญานิพนธ์ (Microsoft Word Format)',
    categoryGroup: 'templates',
    description: 'เทมเพลตมาตรฐานตามเกณฑ์บัณฑิตวิทยาลัยและคณะวิทยาศาสตร์และวิศวกรรมศาสตร์ มก.ฉกส. รองรับฟอนต์ TH Sarabun New',
    pdfAvailable: true,
    wordAvailable: true,
    fileSize: '1.8 MB',
    year: 'ปรับปรุง 2567'
  },
  {
    id: 'tmpl-latex',
    code: 'TEMPLATE-LATEX',
    formTypeNumber: 'TMPL',
    title: 'เทมเพลตจัดทำรูปเล่มปริญญานิพนธ์ (LaTeX / Overleaf Ready)',
    categoryGroup: 'templates',
    description: 'เทมเพลตภาษา LaTeX รองรับฟอนต์ TH Sarabun New, IEEE bibliography และคำสั่งภาษาไทย',
    pdfAvailable: true,
    wordAvailable: true,
    fileSize: '4.2 MB',
    year: 'ปรับปรุง 2567'
  }
];

export const MANUALS_DATA = [
  {
    id: 'manual-1',
    title: 'คู่มือการจัดทำรูปเล่มปริญญานิพนธ์ (KU CSC Thesis Format Guide)',
    description: 'ข้อกำหนดมาตรฐานการพิมพ์เล่มปริญญานิพนธ์วิศวกรรมคอมพิวเตอร์ การตั้งค่าขอบกระดาษ รูปแบบฟอนต์ การจัดลำดับบทที่ 1 ถึง 5 การอ้างอิงและบรรณานุกรมแบบ IEEE Standard',
    bullets: [
      'การเว้นระยะขอบ (ซ้าย 1.5 นิ้ว, บน-ขวา-ล่าง 1.0 นิ้ว)',
      'ฟอนต์มาตรฐาน TH Sarabun New ขนาด 16pt สำหรับเนื้อหา และ 18pt หนา สำหรับหัวข้อ',
      'รูปแบบการเขียนสารบัญ ตาราง รูปภาพ และภาคผนวก',
      'การอ้างอิงงานวิจัยตามมาตรฐาน IEEE Citation Style'
    ]
  },
  {
    id: 'manual-2',
    title: 'เกณฑ์การประเมินผลคะแนนรายวิชาโครงงาน (Evaluation Criteria)',
    description: 'สัดส่วนคะแนนการประเมินผลสัมฤทธิ์โครงงานวิศวกรรมคอมพิวเตอร์ ตลอดภาคการศึกษา รวม 100%',
    bullets: [
      '1. การเข้าพบอาจารย์ที่ปรึกษา & สมุดบันทึก CPE-02: 20%',
      '2. การสอบประเมินความก้าวหน้าโครงงาน (Midterm Progress): 30%',
      '3. การสอบป้องกันปริญญานิพนธ์ฉบับสมบูรณ์ (Final Defense): 35%',
      '4. ความสมบูรณ์ของรูปเล่มปริญญานิพนธ์และผลงานต้นแบบ: 15%'
    ]
  },
  {
    id: 'manual-3',
    title: 'ปฏิทินและกำหนดการดำเนินงานวิชาโครงงาน ประจำปีการศึกษา 2567',
    description: 'ช่วงเวลาสำคัญที่นิสิตและอาจารย์ที่ปรึกษาต้องปฏิบัติตาม เพื่อให้สำเร็จการศึกษาตามระยะเวลาหลักสูตร',
    bullets: [
      'สัปดาห์ที่ 1 - 3: ยื่นแบบเสนออนุมัติหัวข้อโครงงาน (CPE-01)',
      'สัปดาห์ที่ 8 - 9: สอบประเมินความก้าวหน้า 50% (CPE-03)',
      'สัปดาห์ที่ 14 - 15: สอบป้องกันปริญญานิพนธ์ฉบับสมบูรณ์ (CPE-04)',
      'สัปดาห์ที่ 16: ส่งมอบเล่มฉบับสมบูรณ์พร้อมแก้ไขตามคอมเมนต์ (CPE-05)'
    ]
  }
];
