export type ContactInput = {
  name: string;
  email: string;
  message: string;
};

export type ContactValidationResult = {
  valid: boolean;
  errors: Partial<Record<keyof ContactInput, string>>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactSubmission(input: ContactInput): ContactValidationResult {
  const errors: ContactValidationResult["errors"] = {};

  if (!input.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!input.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(input.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!input.message.trim()) {
    errors.message = "Message is required.";
  } else if (input.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
