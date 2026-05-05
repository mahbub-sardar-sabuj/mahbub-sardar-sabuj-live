/**
 * অ্যাক্সেসিবিলিটি (Accessibility) ইউটিলিটি
 * ওয়েবসাইটকে সকলের জন্য অ্যাক্সেসযোগ্য করে তোলে
 */

/**
 * ARIA লেবেল তৈরি করে
 * @param label - লেবেল টেক্সট
 * @returns ARIA লেবেল অবজেক্ট
 */
export function createAriaLabel(label: string): { "aria-label": string } {
  return { "aria-label": label };
}

/**
 * ARIA বর্ণনা তৈরি করে
 * @param description - বর্ণনা টেক্সট
 * @returns ARIA বর্ণনা অবজেক্ট
 */
export function createAriaDescription(description: string): {
  "aria-describedby": string;
} {
  const id = `aria-desc-${Math.random().toString(36).substr(2, 9)}`;
  return { "aria-describedby": id };
}

/**
 * কীবোর্ড নেভিগেশন হ্যান্ডেল করে
 * @param event - কীবোর্ড ইভেন্ট
 * @param callback - কল করার ফাংশন
 */
export function handleKeyboardNavigation(
  event: React.KeyboardEvent,
  callback: () => void
): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
}

/**
 * স্ক্রিন রিডার ঘোষণা করে
 * @param message - ঘোষণা করার বার্তা
 * @param priority - অগ্রাধিকার ('polite' বা 'assertive')
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
): void {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.style.position = "absolute";
  announcement.style.left = "-10000px";
  announcement.style.width = "1px";
  announcement.style.height = "1px";
  announcement.style.overflow = "hidden";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // ২ সেকেন্ড পর সরান
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 2000);
}

/**
 * ফোকাস ট্র্যাপ সেটআপ করে (মডাল ডায়ালগের জন্য)
 * @param element - ফোকাস ট্র্যাপ করার এলিমেন্ট
 */
export function setupFocusTrap(element: HTMLElement): void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  element.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  });

  firstElement.focus();
}

/**
 * কালার কন্ট্রাস্ট চেক করে
 * @param foreground - ফোরগ্রাউন্ড রঙ (hex)
 * @param background - ব্যাকগ্রাউন্ড রঙ (hex)
 * @returns কন্ট্রাস্ট রেশিও
 */
export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance <= 0.03928 ? luminance / 12.92 : Math.pow((luminance + 0.055) / 1.055, 2.4);
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * কালার কন্ট্রাস্ট WCAG স্ট্যান্ডার্ড পূরণ করে কিনা চেক করে
 * @param foreground - ফোরগ্রাউন্ড রঙ (hex)
 * @param background - ব্যাকগ্রাউন্ড রঙ (hex)
 * @param level - WCAG লেভেল ('AA' বা 'AAA')
 * @returns সত্য যদি কন্ট্রাস্ট যথেষ্ট হয়
 */
export function meetsWCAGContrast(
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA"
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === "AA" ? ratio >= 4.5 : ratio >= 7;
}

/**
 * স্কিপ লিংক তৈরি করে (মেইন কন্টেন্টে সরাসরি যাওয়ার জন্য)
 * @returns স্কিপ লিংক এলিমেন্ট
 */
export function createSkipLink(): HTMLAnchorElement {
  const skipLink = document.createElement("a");
  skipLink.href = "#main-content";
  skipLink.textContent = "মূল কন্টেন্টে যান";
  skipLink.style.position = "absolute";
  skipLink.style.top = "-40px";
  skipLink.style.left = "0";
  skipLink.style.background = "#000";
  skipLink.style.color = "#fff";
  skipLink.style.padding = "8px";
  skipLink.style.zIndex = "100";

  skipLink.addEventListener("focus", () => {
    skipLink.style.top = "0";
  });

  skipLink.addEventListener("blur", () => {
    skipLink.style.top = "-40px";
  });

  return skipLink;
}

/**
 * ফর্ম ভ্যালিডেশন এরর ঘোষণা করে
 * @param fieldName - ফিল্ডের নাম
 * @param error - এরর বার্তা
 */
export function announceFormError(fieldName: string, error: string): void {
  announceToScreenReader(
    `${fieldName} ফিল্ডে ত্রুটি: ${error}`,
    "assertive"
  );
}
