export type UserRole = 'student' | 'advisor' | 'admin';

export type ThesisStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'revision_required' 
  | 'approved' 
  | 'archived';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  department?: string;
  campus?: string;
  studentId?: string;
  phoneNumber?: string;
  status?: 'active' | 'suspended';
  academicRank?: string;
  room?: string;
  expertise?: string[];
  quotaTotal?: number;
  quotaUsed?: number;
  registeredAt?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Thesis {
  id: string;
  code: string; // e.g. CPE-2567-001
  titleTh: string;
  titleEn: string;
  abstractTh: string;
  abstractEn?: string;
  academicYear: string; // e.g. 2567
  semester: string; // e.g. 1 or 2
  category: string;
  status: ThesisStatus;
  studentIds: string[];
  studentNames: string[];
  advisorIds: string[];
  advisorNames: string[];
  committeeIds?: string[];
  committeeNames?: string[];
  keywords: string[];
  progressPercent: number; // 0-100
  viewCount?: number;
  rating?: number;
  reviewCount?: number;
  downloadCount?: number;
  currentMilestone?: string;
  nextDeadline?: string;
  pdfUrl?: string;
  pdfFileName?: string;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

export interface ThesisFile {
  id: string;
  thesisId: string;
  fileType: 'proposal' | 'cpe01' | 'cpe02' | 'cpe03' | 'progress_report' | 'full_thesis' | 'presentation' | 'other';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  version: number;
  uploadedBy: string;
  uploaderName: string;
  notes?: string;
  createdAt: any;
}

export interface Review {
  id: string;
  thesisId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: 'advisor' | 'committee' | 'admin';
  decision: 'approved' | 'revision_required' | 'rejected' | 'comment_only';
  comments: string;
  score?: number;
  formType?: string;
  createdAt: any;
}

export interface ActivityLog {
  id: string;
  thesisId?: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
  createdAt: any;
}

export interface AdvisorFaculty {
  id: string;
  name: string;
  title: string;
  academicRank: string;
  expertise: string[];
  room: string;
  email: string;
  kuForestUrl?: string;
  quotaUsed: number;
  quotaMax: number;
  status: 'available' | 'almost_full' | 'full';
}

export interface FormTemplateItem {
  id: string;
  code: string;
  title: string;
  description: string;
  fileSize: string;
  academicYear: string;
  format: 'DOCX' | 'PDF' | 'ZIP' | 'LATEX';
  downloadUrl: string;
  category: 'forms' | 'templates';
}
