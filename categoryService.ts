import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  serverTimestamp, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OFFICIAL_RESEARCH_CATEGORIES } from '../data/researchCategories';

export const CATEGORIES_COLLECTION = 'categories';

export interface ResearchCategoryDoc {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  createdAt?: any;
}

const DEFAULT_CATEGORIES = [
  'ปัญญาประดิษฐ์และการเรียนรู้ของเครื่อง',
  'วิทัศน์คอมพิวเตอร์และการประมวลผลภาพ',
  'ระบบสมองกลฝังตัวและไอโอที',
  'ระบบเครือข่ายและความมั่นคงปลอดภัยไซเบอร์',
  'วิศวกรรมซอฟต์แวร์และการพัฒนาเว็บ/บล็อกเชน',
  'การทำเหมืองข้อมูลและเครือข่ายสังคม',
  'อัลกอริทึมและการหาค่าเหมาะสมที่สุด',
  'เกษตรแม่นยำและการจัดการพลังงานอัจฉริยะ'
];

/**
 * Subscribe to research categories in Firestore with real-time updates
 */
export function subscribeToCategories(
  callback: (categories: ResearchCategoryDoc[]) => void,
  onError?: (err: any) => void
): () => void {
  const colRef = collection(db, CATEGORIES_COLLECTION);
  const q = query(colRef, orderBy('name', 'asc'));

  return onSnapshot(q, async (snap) => {
    if (snap.empty) {
      // Auto-seed default categories if empty
      try {
        await seedDefaultCategories();
      } catch (err) {
        console.warn('Could not auto-seed categories:', err);
      }
      callback(DEFAULT_CATEGORIES.map((name, idx) => ({ id: `cat-${idx + 1}`, name })));
      return;
    }

    const list: ResearchCategoryDoc[] = snap.docs.map(d => ({
      id: d.id,
      name: d.data().name || d.id,
      nameEn: d.data().nameEn,
      description: d.data().description,
      createdAt: d.data().createdAt
    }));
    callback(list);
  }, (err) => {
    console.error('Error in subscribeToCategories:', err);
    if (onError) onError(err);
    // Fallback to default
    callback(DEFAULT_CATEGORIES.map((name, idx) => ({ id: `cat-${idx + 1}`, name })));
  });
}

/**
 * Fetch all categories one-time from Firestore
 */
export async function getCategoriesFromDb(): Promise<ResearchCategoryDoc[]> {
  try {
    const colRef = collection(db, CATEGORIES_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      await seedDefaultCategories();
      return DEFAULT_CATEGORIES.map((name, idx) => ({ id: `cat-${idx + 1}`, name }));
    }
    return snap.docs.map(d => ({
      id: d.id,
      name: d.data().name || d.id,
      nameEn: d.data().nameEn,
      description: d.data().description,
      createdAt: d.data().createdAt
    })).sort((a, b) => a.name.localeCompare(b.name, 'th'));
  } catch (error) {
    console.warn('Fallback to local categories:', error);
    return DEFAULT_CATEGORIES.map((name, idx) => ({ id: `cat-${idx + 1}`, name }));
  }
}

/**
 * Add a new research category to Firestore
 */
export async function addCategoryInDb(name: string, description?: string): Promise<ResearchCategoryDoc> {
  const cleanName = name.trim();
  if (!cleanName) {
    throw new Error('กรุณาระบุชื่อหมวดหมู่งานวิจัย');
  }

  // Create document ID from timestamp or safe string
  const docId = `cat_${Date.now()}`;
  const docRef = doc(db, CATEGORIES_COLLECTION, docId);
  const newCat: ResearchCategoryDoc = {
    id: docId,
    name: cleanName,
    description: description?.trim() || '',
    createdAt: serverTimestamp()
  };

  await setDoc(docRef, newCat);
  return newCat;
}

/**
 * Delete a category from Firestore
 */
export async function deleteCategoryFromDb(id: string): Promise<void> {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Seed initial official categories if Firestore collection is empty
 */
export async function seedDefaultCategories(): Promise<void> {
  try {
    for (const cat of OFFICIAL_RESEARCH_CATEGORIES) {
      const docRef = doc(db, CATEGORIES_COLLECTION, cat.id);
      await setDoc(docRef, {
        id: cat.id,
        name: cat.name,
        nameEn: cat.nameEn,
        description: cat.description,
        createdAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.warn('Seed categories non-blocking error:', err);
  }
}
