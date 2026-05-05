# 🎨 ডিজাইন টুল (Editor) উন্নতি গাইড

## 📋 সারসংক্ষেপ
ডিজাইন টুলটি একটি শক্তিশালী ফিচার, কিন্তু মোবাইল ডিভাইসে কিছু সমস্যা রয়েছে। এই গাইডটি সেই সমস্যাগুলো সমাধানের জন্য সুপারিশ প্রদান করে।

---

## 🔧 চিহ্নিত সমস্যা এবং সমাধান

### ১. **মোবাইল রেসপন্সিভনেস**

#### সমস্যা:
- ডেস্কটপে ভাল কাজ করে, কিন্তু মোবাইলে টুলবার এবং ক্যানভাস সঠিকভাবে সাজানো হয় না।
- টাচ ইভেন্ট সঠিকভাবে হ্যান্ডল করা হয় না।

#### সমাধান:
```typescript
// Editor.tsx এ যোগ করুন
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function Editor() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <div style={{
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: "1rem",
      height: isMobile ? "auto" : "100vh",
    }}>
      {/* Toolbar */}
      <div style={{
        width: isMobile ? "100%" : "250px",
        overflowY: "auto",
        borderRight: isMobile ? "none" : "1px solid #ddd",
        borderBottom: isMobile ? "1px solid #ddd" : "none",
      }}>
        {/* Toolbar content */}
      </div>
      
      {/* Canvas */}
      <div style={{
        flex: 1,
        overflow: "auto",
        touchAction: "manipulation", // টাচ ইভেন্ট অপ্টিমাইজেশন
      }}>
        {/* Canvas content */}
      </div>
    </div>
  );
}
```

### ২. **টাচ ইভেন্ট হ্যান্ডলিং**

#### সমস্যা:
- মোবাইলে ড্র্যাগ অপারেশন কাজ করে না।
- টাচ জেসচার সঠিকভাবে রেজিস্টার হয় না।

#### সমাধান:
```typescript
// useCanvasTouch.ts হুক তৈরি করুন
import { useRef, useEffect } from "react";

export function useCanvasTouch(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const touchStartPos = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartPos.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // স্ক্রল প্রতিরোধ করুন
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartPos.current.x;
      const deltaY = touch.clientY - touchStartPos.current.y;
      
      // ক্যানভাস আপডেট করুন
      // ... আপনার লজিক এখানে
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      // টাচ শেষ হওয়ার লজিক
    };
    
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);
    
    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [canvasRef]);
}
```

### ৩. **UI উপাদান অ্যাক্সেসিবিলিটি**

#### সমস্যা:
- টুলবার বাটনগুলোতে ARIA লেবেল নেই।
- কীবোর্ড নেভিগেশন সাপোর্ট নেই।

#### সমাধান:
```typescript
// Editor.tsx এ যোগ করুন
import { createAccessibilityAttributes } from "@/lib/seoAccessibility";

<button
  {...createAccessibilityAttributes("ব্রাশ টুল নির্বাচন করুন", "button")}
  onClick={() => selectTool("brush")}
  style={{
    padding: "0.5rem 1rem",
    cursor: "pointer",
    border: "1px solid #ddd",
    borderRadius: "4px",
  }}
>
  🖌️ ব্রাশ
</button>
```

### ৪. **পারফরম্যান্স অপ্টিমাইজেশন**

#### সমস্যা:
- বড় ক্যানভাসে ড্রয়িং ধীর হয়ে যায়।
- মেমরি লিক থাকতে পারে।

#### সমাধান:
```typescript
// Canvas রেন্ডারিং অপ্টিমাইজ করুন
const handleCanvasDraw = useCallback((e: React.MouseEvent) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d", { alpha: false }); // অ্যালফা চ্যানেল অক্ষম করুন
  if (!ctx) return;
  
  // ড্রয়িং লজিক
  // ...
}, []);

// useEffect এ ক্লিনআপ করুন
useEffect(() => {
  return () => {
    // ক্যানভাস রিসোর্স পরিষ্কার করুন
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
}, []);
```

### ৫. **ডার্ক মোড সাপোর্ট**

#### সমস্যা:
- ডিজাইন টুল ডার্ক মোড সাপোর্ট করে না।

#### সমাধান:
```typescript
// Editor.tsx এ যোগ করুন
import { useEffect, useState } from "react";

export default function Editor() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);
  }, []);
  
  return (
    <div style={{
      background: isDarkMode ? "#1a1a1a" : "#fff",
      color: isDarkMode ? "#fff" : "#000",
      // ... অন্যান্য স্টাইল
    }}>
      {/* Editor content */}
    </div>
  );
}
```

---

## 📱 মোবাইল-ফার্স্ট চেকলিস্ট

- [ ] ভার্টিকাল লেআউট মোবাইলে কাজ করে
- [ ] টাচ ইভেন্ট সঠিকভাবে হ্যান্ডল করা হয়
- [ ] টুলবার স্ক্রোলযোগ্য এবং অ্যাক্সেসযোগ্য
- [ ] ক্যানভাস সঠিকভাবে স্কেল করা হয়
- [ ] ডার্ক মোড সাপোর্ট করা হয়
- [ ] ARIA লেবেল সব বাটনে যোগ করা হয়েছে
- [ ] কীবোর্ড নেভিগেশন কাজ করে

---

## 🚀 বাস্তবায়ন পদক্ষেপ

1. **useMediaQuery হুক তৈরি করুন** (`client/src/hooks/useMediaQuery.ts`)
2. **useCanvasTouch হুক তৈরি করুন** (`client/src/hooks/useCanvasTouch.ts`)
3. **Editor.tsx আপডেট করুন** মোবাইল রেসপন্সিভনেস সহ
4. **অ্যাক্সেসিবিলিটি অ্যাট্রিবিউট যোগ করুন** সব ইন্টারঅ্যাক্টিভ এলিমেন্টে
5. **পারফরম্যান্স টেস্ট করুন** বড় ক্যানভাসে
6. **ডার্ক মোড সাপোর্ট যোগ করুন**

---

## 🔗 সম্পর্কিত ফাইল

- `client/src/pages/Editor.tsx` - মূল এডিটর কম্পোনেন্ট
- `client/src/lib/seoAccessibility.ts` - অ্যাক্সেসিবিলিটি ইউটিলিটি
- `client/src/lib/performanceOptimization.ts` - পারফরম্যান্স অপ্টিমাইজেশন

---

## 📞 সহায়তা

যদি কোনো প্রশ্ন থাকে, অনুগ্রহ করে যোগাযোগ করুন: `lekhokmahbubsardarsabuj@gmail.com`
