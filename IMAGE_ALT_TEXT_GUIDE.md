# ইমেজ ALT টেক্সট অপ্টিমাইজেশন গাইড

## সমস্যা
বর্তমানে সাইটের অনেক ইমেজে ALT টেক্সট নেই, যা SEO এবং অ্যাক্সেসিবিলিটির জন্য গুরুত্বপূর্ণ।

## সমাধান

### ১. প্রোফাইল ইমেজ (Home.tsx)
```jsx
// বর্তমান:
<img src={PROFILE_1} />

// সংশোধিত:
<img 
  src={PROFILE_1} 
  alt="মাহবুব সরদার সবুজ - বাংলা কবি ও লেখক" 
/>
```

### ২. হিরো ব্যাকগ্রাউন্ড ইমেজ
```jsx
// বর্তমান:
<div style={{ backgroundImage: `url(${HERO_BG})` }} />

// সংশোধিত (aria-label যোগ করা):
<div 
  style={{ backgroundImage: `url(${HERO_BG})` }}
  aria-label="মাহবুব সরদার সবুজের সাহিত্য ওয়েবসাইটের হিরো ব্যাকগ্রাউন্ড"
/>
```

### ৩. বই কভার ইমেজ (Writings.tsx)
```jsx
// বর্তমান:
<img src={ebook.cover} />

// সংশোধিত:
<img 
  src={ebook.cover} 
  alt={`${ebook.title} - ${ebook.genre} বই কভার`}
/>
```

### ৪. নিউজ ইমেজ (News.tsx)
```jsx
// বর্তমান:
<img src={news.image} />

// সংশোধিত:
<img 
  src={news.image} 
  alt={`${news.title} - সরদার সংবাদ`}
/>
```

### ৫. গ্যালারি ইমেজ (Gallery.tsx)
```jsx
// বর্তমান:
<img src={photo.url} />

// সংশোধিত:
<img 
  src={photo.url} 
  alt={`মাহবুব সরদার সবুজ - ${photo.caption || 'গ্যালারি ফটো'}`}
/>
```

## ALT টেক্সট লেখার নিয়ম

### ভালো ALT টেক্সট:
✅ `মাহবুব সরদার সবুজ - বাংলা কবি ও লেখক`  
✅ `স্মৃতির বসন্তে তুমি - ই-বুক কভার`  
✅ `বাংলা কবিতা সংগ্রহ - প্রথম প্রকাশিত বই`

### খারাপ ALT টেক্সট:
❌ `ছবি`  
❌ `image1.jpg`  
❌ `photo`  
❌ খুব দীর্ঘ বর্ণনা (১২০ ক্যারেক্টারের বেশি)

## ফাইল নাম অপ্টিমাইজেশন

### বর্তমান:
- `profile_db5ff5d6.jpeg`
- `hero-bg-U7hjBDvWeoSXDDh3veCUTN.webp`
- `book-cover-20260328.jpg`

### সংশোধিত:
- `mahbub-sardar-sabuj-profile.jpg`
- `mahbub-sardar-sabuj-hero-background.webp`
- `smritir-boshonte-ebook-cover.jpg`

## React কম্পোনেন্টে বাস্তবায়ন

### উদাহরণ: Image কম্পোনেন্ট তৈরি করা
```jsx
// components/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function OptimizedImage({
  src,
  alt,
  title,
  className,
  width,
  height,
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      title={title || alt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
    />
  );
}
```

### ব্যবহার:
```jsx
<OptimizedImage
  src={PROFILE_1}
  alt="মাহবুব সরদার সবুজ - বাংলা কবি ও লেখক"
  title="লেখক মাহবুব সরদার সবুজের প্রোফাইল ছবি"
/>
```

## পরিবর্তনের প্রভাব

### SEO উন্নতি:
- ✅ ইমেজ সার্চ থেকে ট্রাফিক বৃদ্ধি
- ✅ Google Images-এ র‍্যাঙ্কিং উন্নতি
- ✅ সামগ্রিক SEO স্কোর বৃদ্ধি

### অ্যাক্সেসিবিলিটি উন্নতি:
- ✅ স্ক্রিন রিডার ব্যবহারকারীদের জন্য উন্নত অভিজ্ঞতা
- ✅ WCAG 2.1 কমপ্লায়েন্স

### AdSense অনুমোদন:
- ✅ কন্টেন্ট কোয়ালিটি স্কোর বৃদ্ধি
- ✅ ব্র্যান্ড সেফটি উন্নতি

## বাস্তবায়ন চেকলিস্ট

- [ ] সব প্রোফাইল ইমেজে ALT টেক্সট যোগ করা
- [ ] সব বই কভার ইমেজে ALT টেক্সট যোগ করা
- [ ] সব নিউজ ইমেজে ALT টেক্সট যোগ করা
- [ ] সব গ্যালারি ইমেজে ALT টেক্সট যোগ করা
- [ ] সব ব্যাকগ্রাউন্ড ইমেজে aria-label যোগ করা
- [ ] ইমেজ ফাইল নাম অপ্টিমাইজ করা
- [ ] OptimizedImage কম্পোনেন্ট তৈরি করা
- [ ] সব ইমেজ ট্যাগ আপডেট করা
- [ ] Lighthouse অডিট চালানো
- [ ] Google Images-এ পরীক্ষা করা

## সময় অনুমান
- **প্রোফাইল ইমেজ:** ১৫ মিনিট
- **বই কভার:** ৩০ মিনিট
- **নিউজ ইমেজ:** ৩০ মিনিট
- **গ্যালারি ইমেজ:** ২০ মিনিট
- **ব্যাকগ্রাউন্ড ইমেজ:** ১৫ মিনিট
- **কম্পোনেন্ট তৈরি:** ২০ মিনিট
- **টেস্টিং:** ১৫ মিনিট

**মোট সময়:** ২-২.৫ ঘণ্টা

## সম্পদ
- [Google: ইমেজ SEO সেরা অনুশীলন](https://developers.google.com/search/docs/beginner/images)
- [WCAG 2.1: ALT টেক্সট](https://www.w3.org/WAI/tutorials/images/)
- [Lighthouse: অ্যাক্সেসিবিলিটি অডিট](https://developers.google.com/web/tools/lighthouse)
