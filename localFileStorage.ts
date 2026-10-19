/**
 * Persistent PDF & Document Storage Service
 * Uses IndexedDB for reliable local file storage + Base64 data URLs for Firestore synchronization.
 * Preserves 100% of the raw, untouched original file bytes.
 */

const DB_NAME = 'cpe_thesis_pdf_storage';
const DB_VERSION = 1;
const STORE_NAME = 'pdf_documents';

export interface StoredPdfRecord {
  id: string; // e.g. thesisId_fileId
  fileName: string;
  mimeType: string;
  size: number;
  blob: Blob;
  dataUrl?: string;
  updatedAt: number;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Convert a File or Blob to a base64 data URL
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert a base64 data URL back to a binary Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
  const byteString = atob(parts[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uintArray = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    uintArray[i] = byteString.charCodeAt(i);
  }
  return new Blob([uintArray], { type: mime });
}

/**
 * Resolves any file (fileId, data URL, blob URL, or remote URL) to an active, renderable Object URL
 */
export async function resolveToBlobUrl(
  urlOrDataUrl?: string, 
  fileId?: string,
  thesisId?: string
): Promise<string | null> {
  // 1. Try fileId in IndexedDB
  if (fileId) {
    try {
      const blob = await getLocalPdfBlob(fileId);
      if (blob) {
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      console.warn("IndexedDB blob retrieval failed:", e);
    }
  }

  // 2. Try `${thesisId}_${fileId}` in IndexedDB
  if (thesisId && fileId) {
    try {
      const blob = await getLocalPdfBlob(`${thesisId}_${fileId}`);
      if (blob) {
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      console.warn("IndexedDB compound blob retrieval failed:", e);
    }
  }

  // 3. Try thesisId in IndexedDB
  if (thesisId) {
    try {
      const blob = await getLocalPdfBlob(thesisId);
      if (blob) {
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      console.warn("IndexedDB thesisId blob retrieval failed:", e);
    }
  }

  if (!urlOrDataUrl) return null;

  // 4. Data URL to Blob URL (Crucial: Chrome blocks navigating to data: URLs directly)
  if (urlOrDataUrl.startsWith('data:')) {
    try {
      const blob = dataUrlToBlob(urlOrDataUrl);
      return URL.createObjectURL(blob);
    } catch (e) {
      console.warn("dataUrl to blob failed:", e);
      return urlOrDataUrl;
    }
  }

  return urlOrDataUrl;
}

/**
 * Safely open a PDF in a new tab without being blocked by Chrome data-url restrictions
 */
export async function openPdfInNewTab(urlOrDataUrl?: string, fileId?: string, thesisId?: string) {
  const safeUrl = await resolveToBlobUrl(urlOrDataUrl, fileId, thesisId);
  if (!safeUrl) {
    alert('ไม่พบที่อยู่ไฟล์ PDF');
    return;
  }
  const a = document.createElement('a');
  a.href = safeUrl;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


/**
 * Save a real, untouched file into IndexedDB and return an accessible URL
 */
export async function saveLocalPdfFile(
  fileId: string, 
  file: File
): Promise<{ objectUrl: string; dataUrl?: string }> {
  try {
    const db = await openDatabase();
    
    // For files <= 2.5MB, generate base64 dataUrl for cloud sync
    let dataUrl: string | undefined = undefined;
    if (file.size <= 2.5 * 1024 * 1024) {
      try {
        dataUrl = await fileToDataUrl(file);
      } catch (e) {
        console.warn('Could not generate base64 dataUrl:', e);
      }
    }

    const record: StoredPdfRecord = {
      id: fileId,
      fileName: file.name,
      mimeType: file.type || 'application/pdf',
      size: file.size,
      blob: file, // Store the exact original File/Blob
      dataUrl,
      updatedAt: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    const objectUrl = URL.createObjectURL(file);
    return { objectUrl, dataUrl };
  } catch (err) {
    console.warn('IndexedDB save failed, falling back to blob URL:', err);
    const objectUrl = URL.createObjectURL(file);
    let dataUrl: string | undefined = undefined;
    if (file.size <= 2.5 * 1024 * 1024) {
      try {
        dataUrl = await fileToDataUrl(file);
      } catch {
        // Ignore
      }
    }
    return { objectUrl, dataUrl };
  }
}

/**
 * Retrieve the original pristine Blob by fileId
 */
export async function getLocalPdfBlob(fileId: string): Promise<Blob | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(fileId);

      req.onsuccess = () => {
        const record = req.result as StoredPdfRecord | undefined;
        if (record && record.blob) {
          resolve(record.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Retrieve a stored PDF by fileId and return an active Object URL
 */
export async function getLocalPdfUrl(fileId: string): Promise<string | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(fileId);

      req.onsuccess = () => {
        const record = req.result as StoredPdfRecord | undefined;
        if (record && record.blob) {
          const url = URL.createObjectURL(record.blob);
          resolve(url);
        } else if (record && record.dataUrl) {
          resolve(record.dataUrl);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Trigger download of the exact, original, unmodified uploaded file
 */
export async function triggerActualFileDownload(url?: string, fileName?: string, fileId?: string) {
  const targetFileName = fileName || 'document.pdf';

  // 1. If we have fileId, check IndexedDB first for the pristine raw File/Blob
  if (fileId) {
    try {
      const blob = await getLocalPdfBlob(fileId);
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = targetFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        return;
      }
    } catch (e) {
      console.warn('Could not read blob from IndexedDB:', e);
    }
  }

  if (!url) {
    alert('ไม่พบไฟล์เอกสารสำหรับดาวน์โหลด');
    return;
  }

  // 2. If url is data URL or blob URL, trigger download directly
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    const a = document.createElement('a');
    a.href = url;
    a.download = targetFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // 3. If remote URL (e.g. Firebase Storage), fetch as blob to enforce original filename download
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = targetFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  } catch {
    // Direct link fallback
    const a = document.createElement('a');
    a.href = url;
    a.download = targetFileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

/**
 * Delete a local PDF record from IndexedDB
 */
export async function deleteLocalPdfFile(fileId: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(fileId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not delete from IndexedDB:', err);
  }
}
