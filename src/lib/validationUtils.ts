const RESERVED_WORDS = [

  'settings',
  'login',
  'dashboard',
  'profile',
  'projects',
  'publications',
  'settings',
  'public',
  'private',
  'about',
  'contact',
  'terms',
  'privacy',
  'api',
  'auth',
  'login',
  'logout',
  'register',
  'signup',
  'signin',
  'site',
];

export function checkInvalidWebsiteName(name: string): boolean {
  // Check for reserved words. Return true if the name is reserved.
  if (RESERVED_WORDS.includes(name.toLowerCase())) {
    return true;
  }

  // Check for URL safe characters.
  // Only allow letters, numbers, and hyphens. Return true if the name contains invalid characters.
  return !/^[a-z0-9-]+$/i.test(name);
}

// Check for invalid email. Return true if the email is invalid.
export function checkInvalidEmail(email: string): boolean {
  return (email.includes(' ') || !email.includes('@'));
}
