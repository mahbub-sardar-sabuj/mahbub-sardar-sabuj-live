/**
 * ইমেজ অপ্টিমাইজেশন ইউটিলিটি
 * ওয়েবসাইটের পারফরম্যান্স উন্নত করতে ইমেজ অপ্টিমাইজ করে
 */

/**
 * ইমেজ URL থেকে WebP ফরম্যাটে রূপান্তরিত URL তৈরি করে
 * @param url - মূল ইমেজ URL
 * @param width - ইমেজের প্রস্থ (পিক্সেলে)
 * @param quality - কোয়ালিটি (1-100, ডিফল্ট 80)
 * @returns অপ্টিমাইজড ইমেজ URL
 */
export function getOptimizedImageUrl(
  url: string,
  width: number = 800,
  quality: number = 80
): string {
  if (!url) return "";

  // যদি ইতিমধ্যে অপ্টিমাইজড হয়, তাহলে রিটার্ন করুন
  if (url.includes("q=") || url.includes("w=")) {
    return url;
  }

  // Cloudinary বা অন্যান্য CDN ব্যবহার করলে
  if (url.includes("cloudinary.com")) {
    // Cloudinary URL স্ট্রাকচার: https://res.cloudinary.com/{cloud_name}/image/upload/c_scale,w_{width},q_{quality}/{public_id}
    const parts = url.split("/upload/");
    if (parts.length === 2) {
      return `${parts[0]}/upload/c_scale,w_${width},q_${quality},f_auto/${parts[1]}`;
    }
  }

  // সাধারণ ইমেজ URL-এর জন্য কোয়েরি প্যারামিটার যোগ করুন
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}w=${width}&q=${quality}&f=webp`;
}

/**
 * রেসপন্সিভ ইমেজ সেট তৈরি করে (srcset এর জন্য)
 * @param url - মূল ইমেজ URL
 * @returns srcset স্ট্রিং
 */
export function getResponsiveImageSrcSet(url: string): string {
  if (!url) return "";

  const sizes = [320, 640, 960, 1280];
  return sizes
    .map((size) => `${getOptimizedImageUrl(url, size)} ${size}w`)
    .join(", ");
}

/**
 * ইমেজ লেজি লোডিং এর জন্য Intersection Observer সেটআপ করে
 * @param imageElement - ইমেজ এলিমেন্ট
 * @param callback - ইমেজ লোড হওয়ার পর কল করার ফাংশন
 */
export function setupLazyLoading(
  imageElement: HTMLImageElement,
  callback?: () => void
): void {
  if (!("IntersectionObserver" in window)) {
    // ফলব্যাক: সরাসরি লোড করুন
    imageElement.src = imageElement.dataset.src || "";
    callback?.();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || "";
        img.classList.add("loaded");
        observer.unobserve(img);
        callback?.();
      }
    });
  });

  observer.observe(imageElement);
}

/**
 * ইমেজের আকার পরিমাপ করে এবং রিপোর্ট করে
 * @param url - ইমেজ URL
 * @returns ইমেজের আকার (বাইট)
 */
export async function getImageSize(url: string): Promise<number> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const contentLength = response.headers.get("content-length");
    return contentLength ? parseInt(contentLength, 10) : 0;
  } catch (error) {
    console.error("Failed to get image size:", error);
    return 0;
  }
}

/**
 * ইমেজ ক্যাশিং স্ট্র্যাটেজি (IndexedDB ব্যবহার করে)
 */
export class ImageCache {
  private dbName = "ImageCache";
  private storeName = "images";
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "url" });
        }
      };
    });
  }

  async get(url: string): Promise<Blob | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(url);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result?.blob || null);
      };
    });
  }

  async set(url: string, blob: Blob): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ url, blob, timestamp: Date.now() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

/**
 * গ্লোবাল ইমেজ ক্যাশ ইনস্ট্যান্স
 */
export const imageCache = new ImageCache();
