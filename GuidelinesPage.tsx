import React from 'react';
import { 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Users, 
  Laptop, 
  AlertCircle,
  ShieldAlert,
  Star
} from 'lucide-react';

export const GuidelinesPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-16 bg-[#fafbfc]">
      {/* Hero Banner */}
      <div className="bg-[#052e16] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/80 text-xs font-semibold backdrop-blur-xs text-emerald-300">
            <BookOpen className="w-3.5 h-3.5" />
            แนวทางปฏิบัติและข้อกำหนดการเรียนรายวิชา
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                ข้อปฏิบัติและแนวทางการนำเสนอโครงงานวิศวกรรมคอมพิวเตอร์
              </h1>
              <p className="text-sm sm:text-base text-emerald-100 max-w-3xl leading-relaxed mt-2">
                ข้อกำหนด ระเบียบการกำหนดตารางนำเสนอ แนวทางการยืนยันขอสอบ การเตรียมตัว และเกณฑ์การประเมินผลสัมฤทธิ์
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section 1: ตารางกำหนดการนำเสนอ */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                1. การกำหนดตารางกำหนดการนำเสนอ
              </h2>
              <p className="text-xs text-gray-500">
                ช่วงเวลานำเสนอผลงานตามปฏิทินการศึกษา
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-gray-700 leading-relaxed pl-2 sm:pl-4">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <p className="font-bold text-gray-900">
                1.1 อาจารย์ผู้ประสานงานรายวิชากำหนดตารางกำหนดการนำเสนอภายในสัปดาห์ที่ 2-3 ภายหลังจากเปิดภาคการศึกษา สำหรับ:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-gray-700 text-xs sm:text-sm">
                <li><span className="font-semibold text-emerald-800">การนำเสนอหัวข้อโครงงาน (CPE-01)</span></li>
                <li><span className="font-semibold text-emerald-800">การนำเสนอผลการดำเนินงานบทที่ 1-3</span> (สำหรับรายวิชาเตรียมความพร้อมโครงงาน / ก้าวหน้า 50%)</li>
                <li><span className="font-semibold text-emerald-800">การนำเสนอโครงงานสมบูรณ์ 100%</span> (สำหรับรายวิชาโครงงานวิศวกรรมคอมพิวเตอร์ / สอบป้องกันเล่มสมบูรณ์)</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-blue-900">
                <span className="font-bold">1.2 การแจ้งกำหนดการ:</span> นิสิตจะทราบกำหนดการนำเสนอพร้อมกำหนดกรรมการสอบล่วงหน้า <strong>1-2 สัปดาห์</strong> ก่อนตารางกำหนดการนำเสนอ
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: แนวทางการยืนยันการขอนำเสนอ */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                2. แนวทางการยืนยันการขอนำเสนอ
              </h2>
              <p className="text-xs text-gray-500">
                ขั้นตอนและเอกสารที่ต้องจัดเตรียมเพื่อขึ้นสอบ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">1</span>
              <h4 className="font-bold text-gray-900">ข้อเสนอโครงงานผ่านการพิจารณา</h4>
              <p className="text-gray-600 leading-relaxed text-xs">
                ข้อเสนอโครงงานต้องได้รับความเห็นชอบและผ่านการตรวจสอบเบื้องต้นจากอาจารย์ที่ปรึกษาในระบบ
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <h4 className="font-bold text-gray-900">ส่งแบบฟอร์มบันทึกการเข้าพบ (CPE-02)</h4>
              <p className="text-gray-600 leading-relaxed text-xs">
                นิสิตที่ทำโครงงานส่งแบบฟอร์มบันทึกการเข้าพบอาจารย์ที่ปรึกษาต่ออาจารย์ผู้ประสานงานรายวิชา
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">3</span>
              <h4 className="font-bold text-gray-900">ส่งแบบฟอร์มยืนยันการขอนำเสนอ</h4>
              <p className="text-gray-600 leading-relaxed text-xs">
                นิสิตส่งแบบฟอร์มยืนยันการขอนำเสนอที่ลงนามโดยอาจารย์ที่ปรึกษา ต่ออาจารย์ผู้ประสานงานรายวิชา
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <span className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">4</span>
              <h4 className="font-bold text-emerald-950">กำหนดส่งก่อนสิ้นสุดการถอน (W)</h4>
              <p className="text-emerald-800 leading-relaxed text-xs">
                นิสิตจะต้องยื่นแบบฟอร์มที่ลงนามยืนยันอนุมัติให้ขึ้นสอบโดยอาจารย์ที่ปรึกษา ต่ออาจารย์ผู้ประสานงานรายวิชา <strong>ภายในวันสิ้นสุดการถอนรายวิชาแบบติด W</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: การขอเลื่อนกำหนดการนำเสนอ */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                3. การขอเลื่อนกำหนดการนำเสนอ
              </h2>
              <p className="text-xs text-gray-500">
                เงื่อนไขการขอเลื่อนวันและเวลาสอบ
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-700">
            นิสิตสามารถทำการขอเลื่อนกำหนดการนำเสนอได้ ทั้งนี้ภายใต้เงื่อนไขดังต่อไปนี้:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Users className="w-4 h-4 text-slate-700" />
                <span>กรณีที่คณะกรรมการสอบติดภารกิจเร่งด่วน</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                นิสิตติดต่อแจ้งต่ออาจารย์ผู้ประสานงานรายวิชา <strong>ก่อนวันกำหนดสอบ 1 สัปดาห์</strong> ทั้งนี้จะยินยอมให้เลื่อนสอบได้ไม่เกิน 1 สัปดาห์นับจากกำหนดสอบตามตาราง
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-rose-700" />
                <span>กรณีที่มีเหตุฉุกเฉิน (เจ็บป่วย / ประสบอุบัติเหตุ)</span>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                ที่ไม่สามารถมานำเสนอตามกำหนดการได้ นิสิตสามารถฝากเพื่อนแจ้งต่ออาจารย์ผู้ประสานงานรายวิชา <strong>ทันทีภายหลังจากที่เกิดเหตุ</strong> ทั้งนี้การพิจารณาวันสอบจะพิจารณาเป็นรายกรณีต่อไป
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: การเตรียมตัวในการนำเสนอและข้อกำหนดในการสอบ */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                4. การเตรียมตัวในการนำเสนอและข้อกำหนดในการสอบโครงงาน
              </h2>
              <p className="text-xs text-gray-500">
                ระเบียบการประเมินร้อยละ 80, การถอนรายวิชา และเกณฑ์การให้เกรด F
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed pl-2 sm:pl-4">
            <div className="flex items-start gap-3">
              <span className="font-bold text-gray-900 shrink-0">4.1</span>
              <p>นิสิตควรเข้าพบอาจารย์ที่ปรึกษาโครงงาน และนำเสนองานของตนเองให้อาจารย์ที่ปรึกษา ตรวจสอบความก้าวหน้าของโครงงานเป็นระยะ</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <p className="font-bold text-amber-950">
                4.2 การประเมินความพร้อมร้อยละ 80 และการถอนรายวิชา (W):
              </p>
              <p className="text-xs text-amber-900 leading-relaxed">
                เมื่อใกล้ถึงระยะเวลาในการสอบโครงงาน แต่ยังอยู่ในช่วงที่สามารถถอนรายวิชาได้ ให้นิสิตประเมินโครงงานของตนเองว่า <strong>ดำเนินการแล้วเสร็จถึงร้อยละ 80 ตามขอบเขตโครงงานหรือไม่</strong> หากไม่ถึงร้อยละ 80 นิสิตควรปรึกษาอาจารย์ที่ปรึกษาโครงงานเพื่อขอคำแนะนำว่าสมควรสอบ หรือสมควรจะถอนรายวิชา
              </p>
              <p className="text-xs text-amber-900 leading-relaxed">
                หากนิสิตพบว่าตนเองไม่พร้อมที่จะสอบในตารางเวลาที่ทางสาขาวิชาประกาศไปแล้ว นิสิตควรจะถอนรายวิชา และดำเนินการให้แล้วเสร็จตามกำหนดเวลาการขอถอนรายวิชาตามปฏิทินการศึกษาตามประกาศของมหาวิทยาลัย
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-100 border border-gray-200 text-xs text-gray-600 space-y-1">
              <span className="font-bold text-gray-800">หมายเหตุสำคัญเกี่ยวกับการถอนรายวิชา:</span>
              <p>
                อาจารย์ผู้ประสานงานโครงงานจะไม่ลงลายมือชื่อเพื่ออนุมัติการถอนรายวิชาสำหรับนิสิตที่ต้องการถอนรายวิชาหลังจากที่เลยกำหนดระยะเวลาการถอนรายวิชาตามที่มหาวิทยาลัยประกาศ ยกเว้นกรณีที่เป็นเหตุสุดวิสัย และนิสิตต้องแนบเอกสารประกอบการพิจารณาคำร้องเพื่อนำเสนอต่อคณบดีมา เช่น ใบรับรองแพทย์ เอกสารราชการอื่น ๆ หรือเอกสารบันทึกข้อความคำชี้แจงจากอาจารย์ที่ปรึกษาโครงงาน
              </p>
            </div>

            {/* Criteria F vs A-F */}
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-300 space-y-3">
              <h4 className="font-bold text-rose-950 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                4.3 เกณฑ์การประเมินเกรดกรณีไม่พร้อมสอบ:
              </h4>
              <p className="text-xs text-rose-900">
                หากนิสิตที่ไม่พร้อมสอบ ไม่ได้ดำเนินการถอนรายวิชาตามกำหนดการของมหาวิทยาลัย และเมื่ออาจารย์ผู้ประสานงานโครงงานประกาศตารางสอบเรียบร้อยแล้ว สาขาวิชามีเกณฑ์การดำเนินการดังนี้:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white border border-rose-200 flex items-center gap-3">
                  <span className="text-rose-600 font-black text-lg">☆</span>
                  <div>
                    <span className="font-bold text-rose-700 text-sm block">นิสิตที่ไม่สอบตามที่กำหนด</span>
                    <span className="text-xs text-gray-600">นิสิตจะได้รับเกรดเป็น <strong>F</strong></span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-emerald-200 flex items-center gap-3">
                  <span className="text-emerald-600 font-black text-lg">☆</span>
                  <div>
                    <span className="font-bold text-emerald-800 text-sm block">นิสิตที่สอบตามที่กำหนด</span>
                    <span className="text-xs text-gray-600">นิสิตจะได้รับเกรดเป็น <strong>A - F</strong> ตามผลสัมฤทธิ์</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: แนวปฏิบัติในการสอบโครงงาน */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                5. แนวปฏิบัติในวันสอบโครงงานวิศวกรรมคอมพิวเตอร์
              </h2>
              <p className="text-xs text-gray-500">
                การจัดเตรียมเอกสาร เครื่องมือ และการนำเสนอต่อหน้าคณะกรรมการ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-start gap-3">
              <FileText className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 block">จัดพิมพ์รายงานฉบับสมบูรณ์ (บทที่ 1 - 5)</span>
                <span className="text-gray-600 text-xs">ส่งให้กรรมการก่อนสอบอย่างน้อย <strong>3 วัน</strong> (จัดรูปแบบเอกสารตาม "คำแนะนำในการพิมพ์ปริญญานิพนธ์ KU CSC")</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-start gap-3">
              <Users className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 block">แต่งกายชุดนิสิตถูกระเบียบ & มาก่อน 30 นาที</span>
                <span className="text-gray-600 text-xs">มาถึงห้องสอบก่อนเวลาสอบ 30 นาที เพื่อจัดเตรียมระบบและติดตั้งอุปกรณ์การนำเสนอ</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
              <Star className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950 block">☆☆ ตรวจสอบอุปกรณ์ห้องประชุมเล็ก</span>
                <span className="text-amber-900 text-xs">ถ้าสอบห้องประชุมเล็ก ให้นิสิตตรวจสอบความพร้อมของอุปกรณ์ ได้แก่ โปรเจ็กเตอร์ การตั้งค่าจอภาพ และไมโครโฟน ให้เรียบร้อยก่อนเริ่มสอบ</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-start gap-3">
              <Laptop className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 block">เตรียมสไลด์กระชับ & ซ้อมนำเสนอ</span>
                <span className="text-gray-600 text-xs">เนื้อหาในสไลด์ควรกระชับ ซ้อมการนำเสนอมาก่อน พร้อมกับเตรียมข้อมูลทดสอบ (Test Data / Testbed) มาด้วย</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-start gap-3">
              <Laptop className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 block">เตรียมอุปกรณ์นำเสนอ (โทรศัพท์ / Tablet)</span>
                <span className="text-gray-600 text-xs">เตรียมอุปกรณ์ที่เกี่ยวข้องกับการนำเสนอโครงงาน เช่น สมาร์ทโฟน แท็บเล็ต หรืออุปกรณ์เซนเซอร์ IoT</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-950 block">ส่งงานแก้ไขภายใน 2 สัปดาห์</span>
                <span className="text-emerald-900 text-xs">หากต้องมีการแก้ไขงาน (เอกสาร + โปรแกรม) ให้นิสิตแก้ไขตามที่กรรมการแนะนำ และส่งให้กรรมการตรวจสอบไม่เกิน <strong>2 สัปดาห์หลังสัปดาห์สอบ</strong></span>
              </div>
            </div>
          </div>

          {/* Technical warning notice */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 flex items-start gap-3 text-xs text-rose-900">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-rose-950">ข้อควรระวังสำคัญ (ห้ามอ้างปัญหาเทคนิค):</span>
              <p className="mt-0.5 leading-relaxed">
                หากนิสิตมีเหตุผลเรื่องปัญหาทางด้านเทคนิค เช่น อุปกรณ์คอมพิวเตอร์เสีย ฮาร์ดดิสก์พัง หรือไฟล์หาย <strong>จะไม่อนุญาตให้เลื่อนกำหนดการนำเสนอโดยเด็ดขาด</strong> ดังนั้นให้นิสิตทำการสำรองข้อมูล (Backup) บน Cloud หรือ GitHub เสมอ
              </p>
            </div>
          </div>
        </div>

        {/* Section 6: การบันทึกสมุดเข้าพบอาจารย์ที่ปรึกษา CPE-02 */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                6. การบันทึกข้อมูลการเข้าพบอาจารย์ที่ปรึกษา (CPE-02 Logbook)
              </h2>
              <p className="text-xs text-gray-500">
                ระเบียบการบันทึกสรุปความก้าวหน้ารายสัปดาห์
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-700">
            หลังจากที่เข้ารับคำปรึกษาและนำเสนอความก้าวหน้าแก่อาจารย์ที่ปรึกษาแล้ว นิสิตต้องเป็นคนบันทึกข้อมูลต่าง ๆ ด้วยตนเองให้ครบถ้วน:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
              <span className="font-bold text-gray-900 block">6.1 ครั้งที่เข้าพบ</span>
              <span className="text-gray-600">นับลำดับครั้งที่เข้าพบตลอดภาคการศึกษา (ต้องไม่น้อยกว่า 6 ครั้ง)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
              <span className="font-bold text-gray-900 block">6.2 วันที่ เวลา สถานที่</span>
              <span className="text-gray-600">ระบุวัน เวลา และสถานที่นัดพบอาจารย์</span>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
              <span className="font-bold text-gray-900 block">6.3 ตอนที่ 1 ส่วนของนิสิต</span>
              <span className="text-gray-600">เขียนอธิบายรายละเอียดงานที่นำเสนอ ปัญหาและอุปสรรคที่พบ</span>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
              <span className="font-bold text-gray-900 block">6.4 ตอนที่ 2 ส่วนของ อ.ที่ปรึกษา</span>
              <span className="text-gray-600">ข้อเสนอแนะ แนวทางแก้ไข และการลงนามรับรอง</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
