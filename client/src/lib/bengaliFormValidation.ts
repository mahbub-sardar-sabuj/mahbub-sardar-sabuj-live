import type { FormEvent } from "react";

type ValidatableField = HTMLInputElement | HTMLTextAreaElement;

/**
 * Keeps browser constraint validation available while presenting messages that
 * match the Bengali user interface.
 */
export function showBengaliValidation(event: FormEvent<ValidatableField>) {
  const field = event.currentTarget;

  if (field.validity.valueMissing) {
    field.setCustomValidity("এই ঘরটি পূরণ করুন।");
    return;
  }

  if (field.validity.typeMismatch && field instanceof HTMLInputElement && field.type === "email") {
    field.setCustomValidity("সঠিক ইমেইল ঠিকানা লিখুন।");
    return;
  }

  if (field.validity.tooShort) {
    field.setCustomValidity(`কমপক্ষে ${field.minLength} অক্ষর লিখুন।`);
    return;
  }

  field.setCustomValidity("");
}

/** Clears a previously supplied custom message as soon as the user edits. */
export function clearBengaliValidation(event: FormEvent<ValidatableField>) {
  event.currentTarget.setCustomValidity("");
}
