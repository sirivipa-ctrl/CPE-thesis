import { Thesis } from '../types';

/**
 * Known student profiles fallback lookup
 */
const KNOWN_STUDENTS: Record<string, { name: string; studentId: string; department: string }> = {
  'QZQzxmWtygVvbsLFzh11Fg1JfxO2': {
    name: 'สิริวิภา ไชมะโย',
    studentId: '6640206097',
    department: 'สาขาวิชาวิศวกรรมคอมพิวเตอร์',
  },
  '7W3FW4qtxcR1uN0UpbGSpw2xWyU2': {
    name: 'สิริวิภา ไชมะโย',
    studentId: '6640206097',
    department: 'สาขาวิชาวิศวกรรมคอมพิวเตอร์',
  },
};

/**
 * Formats student author names cleanly for display.
 * Replaces generic placeholders with the actual registered student author name.
 */
export function getDisplayStudentNames(thesis: Partial<Thesis> | null | undefined): string[] {
  if (!thesis) return ['สิริวิภา ไชมะโย (รหัสนิสิต 6640206097)'];

  if (thesis.studentNames && Array.isArray(thesis.studentNames) && thesis.studentNames.length > 0) {
    const validNames = thesis.studentNames
      .map(name => (typeof name === 'string' ? name.trim() : ''))
      .filter(name => name.length > 0 && !name.includes('นิสิตผู้เสนอโครงงาน'));
    
    if (validNames.length > 0) {
      return validNames;
    }
  }

  // Check known author fallback by creator or studentId
  if (thesis.createdBy && KNOWN_STUDENTS[thesis.createdBy]) {
    const s = KNOWN_STUDENTS[thesis.createdBy];
    return [`${s.name} (รหัสนิสิต ${s.studentId})`];
  }

  if (thesis.studentIds && Array.isArray(thesis.studentIds)) {
    for (const sid of thesis.studentIds) {
      if (KNOWN_STUDENTS[sid]) {
        const s = KNOWN_STUDENTS[sid];
        return [`${s.name} (รหัสนิสิต ${s.studentId})`];
      }
    }
  }

  // Default real student author for this CPE project
  return ['สิริวิภา ไชมะโย (รหัสนิสิต 6640206097)'];
}

export function formatStudentNamesText(thesis: Partial<Thesis> | null | undefined, separator: string = ', '): string {
  const names = getDisplayStudentNames(thesis);
  return names.join(separator);
}

export function formatStudentNamesAnd(thesis: Partial<Thesis> | null | undefined): string {
  const names = getDisplayStudentNames(thesis);
  return names.join(' และ ');
}
