export interface ResearchCategoryInfo {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  advisors: string[]; // 8 Official Advisors who specialize in this
  iconType: 'ai' | 'vision' | 'iot' | 'network' | 'software' | 'data' | 'algorithm' | 'energy';
}

/**
 * 8 Official Research Categories of CPE Dept., KU CSC
 * Formulated strictly from the academic expertise and research interests of the 8 faculty members:
 * 1. ผศ.ธนวัฒน์ ภัทรวรเมธ
 * 2. รศ.ศุษมา โชคเพิ่มพูน
 * 3. ผศ.ดร.ถนอมศักดิ์ วงศ์มีแก้ว
 * 4. ผศ.ดร.นิตยา เมืองนาค
 * 5. ผศ.ดร.ชัยวัฒน์ ศิระวัฒนานนท์
 * 6. อ.ดร.สมชาย เบ้าทอง
 * 7. ผศ.ดร.เพ็ญศิริ สมพงษ์
 * 8. อ.เทียมเทพ คำเกษ
 */
export const OFFICIAL_RESEARCH_CATEGORIES: ResearchCategoryInfo[] = [
  {
    id: 'cat-ai',
    name: 'ปัญญาประดิษฐ์และการเรียนรู้ของเครื่อง',
    nameEn: 'Artificial Intelligence & Machine Learning',
    description: 'การเรียนรู้เชิงลึก การรู้จำแบบ โครงข่ายประสาทเทียม และการวิเคราะห์ข้อมูลอัจฉริยะ',
    advisors: ['รศ.ศุษมา โชคเพิ่มพูน', 'ผศ.ดร.ถนอมศักดิ์ วงศ์มีแก้ว', 'อ.เทียมเทพ คำเกษ'],
    iconType: 'ai'
  },
  {
    id: 'cat-vision',
    name: 'วิทัศน์คอมพิวเตอร์และการประมวลผลภาพ',
    nameEn: 'Computer Vision & Digital Image Processing',
    description: 'การตรวจจับวัตถุ การจำแนกประเภทภาพ การรู้จำภาพ และการประมวลผลภาพดิจิทัล',
    advisors: ['รศ.ศุษมา โชคเพิ่มพูน', 'ผศ.ดร.นิตยา เมืองนาค', 'อ.เทียมเทพ คำเกษ'],
    iconType: 'vision'
  },
  {
    id: 'cat-iot',
    name: 'ระบบสมองกลฝังตัวและไอโอที',
    nameEn: 'Embedded Systems & Internet of Things (IoT)',
    description: 'การพัฒนาฮาร์ดแวร์ฝังตัว ไมโครคอนโทรลเลอร์ โครงข่ายเซนเซอร์ไร้สาย และระบบตรวจวัด',
    advisors: [
      'ผศ.ธนวัฒน์ ภัทรวรเมธ',
      'ผศ.ดร.ถนอมศักดิ์ วงศ์มีแก้ว',
      'ผศ.ดร.นิตยา เมืองนาค',
      'อ.ดร.สมชาย เบ้าทอง',
      'อ.เทียมเทพ คำเกษ'
    ],
    iconType: 'iot'
  },
  {
    id: 'cat-network',
    name: 'ระบบเครือข่ายและความมั่นคงปลอดภัยไซเบอร์',
    nameEn: 'Computer Networks & Cybersecurity',
    description: 'โพรโทคอลเครือข่าย การบริหารจัดการเครือข่าย ความมั่นคงปลอดภัยสารสนเทศ และคลาวด์คอมพิวติง',
    advisors: [
      'ผศ.ธนวัฒน์ ภัทรวรเมธ',
      'ผศ.ดร.ชัยวัฒน์ ศิระวัฒนานนท์',
      'ผศ.ดร.ถนอมศักดิ์ วงศ์มีแก้ว'
    ],
    iconType: 'network'
  },
  {
    id: 'cat-software',
    name: 'วิศวกรรมซอฟต์แวร์และการพัฒนาเว็บ/บล็อกเชน',
    nameEn: 'Software Engineering, Web & Blockchain',
    description: 'การพัฒนาซอฟต์แวร์แบบฟูลสแต็ก สถาปัตยกรรมซอฟต์แวร์ เทคโนโลยีบล็อกเชน และสมาร์ตคอนแทร็กต์',
    advisors: ['ผศ.ดร.ชัยวัฒน์ ศิระวัฒนานนท์', 'ผศ.ดร.ถนอมศักดิ์ วงศ์มีแก้ว'],
    iconType: 'software'
  },
  {
    id: 'cat-data',
    name: 'การทำเหมืองข้อมูลและเครือข่ายสังคม',
    nameEn: 'Social Network & Data Mining',
    description: 'การสกัดและวิเคราะห์ข้อมูลจากสื่อสังคมออนไลน์ การวิเคราะห์ความรู้สึก และกราฟความรู้',
    advisors: ['อ.เทียมเทพ คำเกษ'],
    iconType: 'data'
  },
  {
    id: 'cat-algorithm',
    name: 'อัลกอริทึมและการหาค่าเหมาะสมที่สุด',
    nameEn: 'Algorithms & Optimization',
    description: 'การวิจัยดำเนินงาน ระเบียบวิธีเชิงตัวเลข การจัดตารางเวลา และการแก้ปัญหาที่มีข้อจำกัดซับซ้อน',
    advisors: ['ผศ.ดร.เพ็ญศิริ สมพงษ์'],
    iconType: 'algorithm'
  },
  {
    id: 'cat-energy',
    name: 'เกษตรแม่นยำและการจัดการพลังงานอัจฉริยะ',
    nameEn: 'Smart Agriculture & Energy Management',
    description: 'ระบบติดตามการใช้พลังงาน ระบบบริหารจัดการแบตเตอรี่ (BMS) และเทคโนโลยีเกษตรแม่นยำ',
    advisors: ['อ.ดร.สมชาย เบ้าทอง'],
    iconType: 'energy'
  }
];
