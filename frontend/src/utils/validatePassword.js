const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email) => {
  if (!email.trim()) return "Email is required";
  if (!EMAIL_REGEX.test(email.trim())) return "Enter a valid email address";
  return "";
};

export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push("Password is required");
    return errors;
  }

  if (password.length < 6) errors.push("At least 6 characters");
  if (password.length > 128) errors.push("Must be 128 characters or fewer");

  return errors;
};

export const getPasswordHints = (password) => {
  const hints = [];
  if (!password) return hints;
  if (!/[a-z]/.test(password)) hints.push("Add a lowercase letter for stronger security");
  if (!/[A-Z]/.test(password)) hints.push("Add an uppercase letter for stronger security");
  if (!/[0-9]/.test(password)) hints.push("Add a number for stronger security");
  return hints;
};

export const getPasswordStrength = (password) => {
  if (!password) return { label: "", level: 0 };

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { label: "Weak", level: 1 };
  if (score <= 3) return { label: "Fair", level: 2 };
  if (score <= 4) return { label: "Good", level: 3 };
  return { label: "Strong", level: 4 };
};
