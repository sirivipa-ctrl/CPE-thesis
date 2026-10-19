import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  addDoc,
  onSnapshot 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Thesis, ThesisFile, Review, ActivityLog, ThesisStatus } from '../types';
import { saveLocalPdfFile, getLocalPdfUrl, deleteLocalPdfFile } from './localFileStorage';

const THESES_COLLECTION = 'theses';
const FILES_COLLECTION = 'thesisFiles';
const REVIEWS_COLLECTION = 'reviews';
const LOGS_COLLECTION = 'activityLogs';

export interface ThesisFilterOptions {
  searchQuery?: string;
  category?: string;
  academicYear?: string;
  status?: ThesisStatus | 'all';
  studentId?: string;
  advisorId?: string;
  advisorName?: string;
  sortBy?: 'popular' | 'rating' | 'reviews' | 'views' | 'latest' | 'oldest';
}

// Fetch list of theses
export async function getTheses(filters: ThesisFilterOptions = {}): Promise<Thesis[]> {
  try {
    const colRef = collection(db, THESES_COLLECTION);
    const snap = await getDocs(colRef);
    let list: Thesis[] = snap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Thesis));

    // Remove any legacy demo / sample seed data: Only keep real user-submitted theses
    list = list.filter(item => item.createdBy !== 'system-seed' && !item.id.startsWith('demo-'));

    // Apply Filters
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(item => 
        item.titleTh.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.studentNames.some(name => name.toLowerCase().includes(q)) ||
        item.advisorNames.some(name => name.toLowerCase().includes(q)) ||
        (item.keywords && item.keywords.some(k => k.toLowerCase().includes(q)))
      );
    }

    if (filters.category && filters.category !== 'ทุกหมวดหมู่งานวิจัย' && filters.category !== 'all') {
      list = list.filter(item => item.category === filters.category);
    }

    if (filters.academicYear && filters.academicYear !== 'ทุกปีการศึกษา (พ.ศ.)' && filters.academicYear !== 'all') {
      list = list.filter(item => item.academicYear === filters.academicYear);
    }

    if (filters.advisorName && filters.advisorName !== 'ทุกอาจารย์ที่ปรึกษา' && filters.advisorName !== 'all') {
      list = list.filter(item => item.advisorNames.some(name => name.includes(filters.advisorName!)));
    }

    if (filters.status && filters.status !== 'all') {
      list = list.filter(item => item.status === filters.status);
    }

    if (filters.studentId) {
      list = list.filter(item => item.studentIds.includes(filters.studentId!));
    }

    if (filters.advisorId) {
      list = list.filter(item => item.advisorIds.includes(filters.advisorId!));
    }

    // Sort
    if (filters.sortBy === 'popular') {
      list.sort((a, b) => {
        const scoreA = ((a.rating || 0) * 100) + ((a.reviewCount || 0) * 10) + ((a.viewCount || 0) * 0.1);
        const scoreB = ((b.rating || 0) * 100) + ((b.reviewCount || 0) * 10) + ((b.viewCount || 0) * 0.1);
        return scoreB - scoreA;
      });
    } else if (filters.sortBy === 'rating') {
      list.sort((a, b) => ((b.rating || 0) - (a.rating || 0)));
    } else if (filters.sortBy === 'reviews') {
      list.sort((a, b) => ((b.reviewCount || 0) - (a.reviewCount || 0)));
    } else if (filters.sortBy === 'views') {
      list.sort((a, b) => ((b.viewCount || 0) - (a.viewCount || 0)));
    } else if (filters.sortBy === 'oldest') {
      list.sort((a, b) => (a.code.localeCompare(b.code)));
    } else {
      // Default: latest
      list.sort((a, b) => (b.academicYear === a.academicYear ? b.code.localeCompare(a.code) : b.academicYear.localeCompare(a.academicYear)));
    }

    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, THESES_COLLECTION);
  }
}

// Real-time listener for theses collection
export function subscribeToTheses(callback: (theses: Thesis[]) => void): () => void {
  try {
    const colRef = collection(db, THESES_COLLECTION);
    return onSnapshot(
      colRef,
      (snap) => {
        let list: Thesis[] = snap.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Thesis));

        // Filter out legacy demo seed items
        list = list.filter(item => item.createdBy !== 'system-seed' && !item.id.startsWith('demo-'));

        // Default sort: latest academic year and code
        list.sort((a, b) => {
          if (b.academicYear !== a.academicYear) {
            return (b.academicYear || '').localeCompare(a.academicYear || '');
          }
          return (b.code || '').localeCompare(a.code || '');
        });

        callback(list);
      },
      (error) => {
        console.error("Theses realtime subscription error:", error);
      }
    );
  } catch (err) {
    console.error("Error setting up theses snapshot listener:", err);
    return () => {};
  }
}

// Get single thesis by ID
export async function getThesisById(id: string): Promise<Thesis | null> {
  try {
    const docRef = doc(db, THESES_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Thesis;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${THESES_COLLECTION}/${id}`);
  }
}

// Create new thesis proposal
export async function createThesis(data: Omit<Thesis, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const user = auth.currentUser;
    const colRef = collection(db, THESES_COLLECTION);
    const docRef = doc(colRef);
    const creatorUid = user?.uid || data.createdBy;

    const studentIds = Array.isArray(data.studentIds) ? [...data.studentIds] : [];
    if (user?.uid && !studentIds.includes(user.uid)) {
      studentIds.push(user.uid);
    }

    const payload = {
      ...data,
      id: docRef.id,
      createdBy: creatorUid,
      studentIds,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(docRef, payload);

    await recordActivityLog({
      thesisId: docRef.id,
      action: 'CREATED_THESIS',
      details: `ยื่นข้อเสนอโครงงานใหม่: ${data.titleTh} (${data.code})`,
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, THESES_COLLECTION);
  }
}

// Update thesis
export async function updateThesis(id: string, updates: Partial<Thesis>): Promise<void> {
  try {
    const docRef = doc(db, THESES_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    await recordActivityLog({
      thesisId: id,
      action: 'UPDATED_THESIS',
      details: `อัปเดตข้อมูลโครงงานสถานะ: ${updates.status || 'ข้อมูลทั่วไป'}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${THESES_COLLECTION}/${id}`);
  }
}

// Delete thesis
export async function deleteThesis(id: string): Promise<void> {
  try {
    const docRef = doc(db, THESES_COLLECTION, id);
    await deleteDoc(docRef);

    await recordActivityLog({
      thesisId: id,
      action: 'DELETED_THESIS',
      details: `ลบข้อมูลโครงงานรหัส ${id}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${THESES_COLLECTION}/${id}`);
  }
}

// Submit review & approval
export async function submitReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
  try {
    const colRef = collection(db, REVIEWS_COLLECTION);
    const docRef = doc(colRef);
    const payload = {
      ...reviewData,
      id: docRef.id,
      createdAt: serverTimestamp(),
    };
    await setDoc(docRef, payload);

    if (reviewData.decision === 'proposal_approved') {
      await updateThesis(reviewData.thesisId, {
        status: 'under_review',
        progressPercent: 40,
        currentMilestone: reviewData.comments 
          ? `หัวข้อผ่านการอนุมัติ: ${reviewData.comments}` 
          : 'หัวข้อโครงงานผ่านการอนุมัติแล้ว • กำลังดำเนินการทำเล่มโครงงานและรอสอบ 100%',
        nextDeadline: 'สัปดาห์ที่ 14-15 (สอบป้องกันโครงงานฉบับสมบูรณ์)'
      });
    } else if (reviewData.decision === 'approved') {
      await updateThesis(reviewData.thesisId, {
        status: 'approved',
        progressPercent: 100,
        currentMilestone: reviewData.comments 
          ? `อนุมัติเล่มสมบูรณ์: ${reviewData.comments}` 
          : 'ผ่านการสอบป้องกันและอนุมัติเล่มสมบูรณ์ 100% เรียบร้อยแล้ว (เผยแพร่สู่คลังผลงาน)',
        nextDeadline: 'สำเร็จการศึกษา (ผ่านการอนุมัติ 100%)'
      });
    } else if (reviewData.decision === 'revision_required') {
      await updateThesis(reviewData.thesisId, {
        status: 'revision_required',
        currentMilestone: reviewData.comments 
          ? `แจ้งแก้ไข: ${reviewData.comments}` 
          : 'แจ้งให้นิสิตแก้ไขตามข้อเสนอแนะอาจารย์ที่ปรึกษา',
        nextDeadline: '7 วัน (ส่งเล่มแก้ไข)'
      });
    }

    // Recalculate real average rating and reviewCount from all reviews in Firestore
    const reviewsQuery = query(colRef, where('thesisId', '==', reviewData.thesisId));
    const reviewsSnap = await getDocs(reviewsQuery);
    const allReviews = reviewsSnap.docs.map(d => d.data() as Review);
    const totalReviews = allReviews.length;
    
    const ratedReviews = allReviews.filter(r => typeof (r as any).rating === 'number' || typeof r.score === 'number');
    let avgRating = 5.0;
    if (ratedReviews.length > 0) {
      const sum = ratedReviews.reduce((acc, r) => {
        const val = typeof (r as any).rating === 'number' ? (r as any).rating : (r.score ? r.score / 20 : 5);
        return acc + val;
      }, 0);
      avgRating = Number((sum / ratedReviews.length).toFixed(1));
    }

    await updateThesis(reviewData.thesisId, {
      rating: avgRating,
      reviewCount: totalReviews
    });

    await recordActivityLog({
      thesisId: reviewData.thesisId,
      action: 'SUBMITTED_REVIEW',
      details: `${reviewData.reviewerName} (${reviewData.reviewerRole}) บันทึกการประเมิน: ${reviewData.decision} - ${reviewData.comments.substring(0, 50)}...`,
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, REVIEWS_COLLECTION);
  }
}

// Increment real thesis view count in Firestore
export async function incrementThesisViews(thesisId: string): Promise<void> {
  try {
    const docRef = doc(db, THESES_COLLECTION, thesisId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const current = snap.data().viewCount || 0;
      await updateDoc(docRef, { viewCount: current + 1 });
    }
  } catch (err) {
    console.warn("View increment error:", err);
  }
}

// Get reviews for a thesis
export async function getReviews(thesisId: string): Promise<Review[]> {
  try {
    const colRef = collection(db, REVIEWS_COLLECTION);
    const q = query(colRef, where('thesisId', '==', thesisId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, REVIEWS_COLLECTION);
  }
}

// Upload file to storage & record metadata in Firestore
export async function uploadThesisFile(
  file: File, 
  thesisId: string, 
  fileType: ThesisFile['fileType'], 
  notes?: string
): Promise<ThesisFile> {
  const user = auth.currentUser;

  if (file.size > 50 * 1024 * 1024) {
    throw new Error('ขนาดไฟล์เกินกำหนด (สูงสุดไม่เกิน 50 MB)');
  }

  const fileDocRef = doc(collection(db, FILES_COLLECTION));
  const fileId = fileDocRef.id;

  const { objectUrl, dataUrl } = await saveLocalPdfFile(`${thesisId}_${fileId}`, file);
  await saveLocalPdfFile(fileId, file);
  if (fileType === 'full_thesis') {
    await saveLocalPdfFile(thesisId, file);
  }
  let finalFileUrl = dataUrl || objectUrl;

  try {
    const storagePath = `theses/${thesisId}/${fileId}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storageRef = ref(storage, storagePath);

    const uploadPromise = new Promise<string>((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file);
      task.then(
        async (snapshot) => {
          try {
            const url = await getDownloadURL(snapshot.ref);
            resolve(url);
          } catch (e) {
            reject(e);
          }
        },
        (err) => reject(err)
      );
    });

    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('Firebase Storage timeout')), 3500);
    });

    const cloudUrl = await Promise.race([uploadPromise, timeoutPromise]);
    if (cloudUrl) {
      finalFileUrl = cloudUrl;
    }
  } catch (storageErr) {
    console.warn("Storage upload fallback to local persistent data:", storageErr);
  }

  const newFileRecord: ThesisFile = {
    id: fileId,
    thesisId,
    fileType,
    fileName: file.name,
    fileUrl: finalFileUrl,
    fileSize: file.size,
    mimeType: file.type || 'application/pdf',
    version: 1,
    uploadedBy: user?.uid || 'student',
    uploaderName: user?.displayName || user?.email || 'นิสิตผู้จัดทำ',
    notes: notes || '',
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(fileDocRef, newFileRecord);
  } catch (dbErr) {
    console.warn("Failed to write thesisFiles to Firestore:", dbErr);
  }

  if (fileType === 'full_thesis' || fileType === 'proposal') {
    try {
      await updateThesis(thesisId, {
        pdfUrl: finalFileUrl,
        pdfFileName: file.name
      });
    } catch (err) {
      console.warn("Could not update thesis with pdfUrl:", err);
    }
  }

  await recordActivityLog({
    thesisId,
    action: 'UPLOADED_FILE',
    details: `อัปโหลดเอกสาร ${file.name} (${fileType})`,
  });

  return newFileRecord;
}

// Get files for a thesis
export async function getThesisFiles(thesisId: string): Promise<ThesisFile[]> {
  try {
    const colRef = collection(db, FILES_COLLECTION);
    const q = query(colRef, where('thesisId', '==', thesisId));
    const snap = await getDocs(q);
    const files = snap.docs.map(d => ({ id: d.id, ...d.data() } as ThesisFile));

    for (const file of files) {
      if (!file.fileUrl || file.fileUrl.startsWith('blob:')) {
        const local = await getLocalPdfUrl(`${thesisId}_${file.id}`);
        if (local) {
          file.fileUrl = local;
        }
      }
    }

    return files;
  } catch (error) {
    console.warn("Error getting thesis files:", error);
    return [];
  }
}

// Remove uploaded file from thesis and system (เอาออกจากหน้าแสดงผล)
export async function deleteThesisFile(thesisId: string, fileId: string): Promise<void> {
  try {
    const fileDocRef = doc(db, FILES_COLLECTION, fileId);
    await deleteDoc(fileDocRef);

    // Also clean from IndexedDB
    await deleteLocalPdfFile(fileId);
    await deleteLocalPdfFile(`${thesisId}_${fileId}`);
    await deleteLocalPdfFile(thesisId);

    // If thesis document points to this file, clear pdfUrl & pdfFileName
    const thesisDocRef = doc(db, THESES_COLLECTION, thesisId);
    const snap = await getDoc(thesisDocRef);
    if (snap.exists()) {
      await updateDoc(thesisDocRef, {
        pdfUrl: '',
        pdfFileName: '',
        updatedAt: serverTimestamp()
      });
    }

    await recordActivityLog({
      thesisId,
      action: 'REMOVED_FILE',
      details: `เอาไฟล์เอกสารออกจากหน้าแสดงผล (รหัส ${fileId})`
    });
  } catch (err) {
    console.error("Error deleting thesis file:", err);
    throw err;
  }
}

// Remove thesis from public display (เอาโครงงานออกจากหน้าแสดงผล / ซ่อนจากหน้าหลักและคลังผลงาน)
export async function removeThesisFromDisplay(thesisId: string): Promise<void> {
  try {
    const thesisDocRef = doc(db, THESES_COLLECTION, thesisId);
    await updateDoc(thesisDocRef, {
      status: 'under_review',
      updatedAt: serverTimestamp()
    });

    await recordActivityLog({
      thesisId,
      action: 'REMOVED_FROM_DISPLAY',
      details: `นำโครงงานออกจากหน้าแสดงผล (เปลี่ยนสถานะเป็นรอการตรวจสอบ)`
    });
  } catch (err) {
    console.error("Error removing thesis from display:", err);
    throw err;
  }
}

// Record activity log
export async function recordActivityLog(data: {
  thesisId?: string;
  action: string;
  details: string;
}): Promise<void> {
  try {
    const user = auth.currentUser;
    const colRef = collection(db, LOGS_COLLECTION);
    const docRef = doc(colRef);
    await setDoc(docRef, {
      id: docRef.id,
      thesisId: data.thesisId || null,
      actorId: user?.uid || 'system',
      actorName: user?.displayName || 'ระบบ Smart Thesis',
      actorRole: user?.email ? 'user' : 'system',
      action: data.action,
      details: data.details,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

// Get system activity logs
export async function getActivityLogs(maxLimit: number = 20): Promise<ActivityLog[]> {
  try {
    const colRef = collection(db, LOGS_COLLECTION);
    const q = query(colRef, limit(maxLimit));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLog));
  } catch (error) {
    console.error("Error reading logs:", error);
    return [];
  }
}
