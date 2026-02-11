/**
 * Content Sanitization
 * Prevents XSS, prompt injection, and other content-based attacks
 */

// Control characters and zero-width characters to strip
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const ZERO_WIDTH_CHARS = /[\u200B-\u200D\uFEFF\u2060\u180E]/g;

// Potential prompt injection patterns
const PROMPT_INJECTION_WARNING = 'Potential prompt injection detected';

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions?/i,
  /disregard\s+(all\s+)?previous/i,
  /forget\s+(all\s+)?previous/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /human\s*:\s*/i,
  /assistant\s*:\s*/i,
  /BEGININSTRUCTION/i,
  /ENDINSTRUCTION/i,
  /###\s*instruction/i,
];

export interface SanitizeResult {
  clean: string;
  modified: boolean;
  warnings: string[];
}

/**
 * Strip HTML tags from a string
 */
function stripHtmlTags(str: string): string {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '');
}

/**
 * Sanitize a string with configurable options
 */
export function sanitizeString(
  input: string | null | undefined,
  options: {
    maxLength?: number;
    stripHtml?: boolean;
    allowNewlines?: boolean;
  } = {}
): SanitizeResult {
  const { maxLength = 10000, stripHtml = true, allowNewlines = true } = options;
  const warnings: string[] = [];
  
  if (input == null) {
    return { clean: '', modified: false, warnings: [] };
  }
  
  let clean = String(input);
  let modified = false;
  
  // Strip control characters
  const beforeControl = clean;
  clean = clean.replace(CONTROL_CHARS, '');
  if (!allowNewlines) {
    clean = clean.replace(/[\r\n]/g, ' ');
  }
  if (clean !== beforeControl) {
    modified = true;
    warnings.push('Stripped control characters');
  }
  
  // Strip zero-width characters
  const beforeZeroWidth = clean;
  clean = clean.replace(ZERO_WIDTH_CHARS, '');
  if (clean !== beforeZeroWidth) {
    modified = true;
    warnings.push('Stripped zero-width characters');
  }

  // Strip HTML tags
  if (stripHtml) {
    const beforeHtml = clean;
    clean = stripHtmlTags(clean);
    if (clean !== beforeHtml) {
      modified = true;
      warnings.push('Stripped HTML tags');
    }
  }
  
  // Check for prompt injection (warn but don't strip)
  if (PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(clean))) {
    warnings.push(PROMPT_INJECTION_WARNING);
  }
  
  // Truncate if too long
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
    modified = true;
    warnings.push(`Truncated to ${maxLength} characters`);
  }
  
  // Trim whitespace
  const trimmed = clean.trim();
  if (trimmed !== clean) {
    clean = trimmed;
    modified = true;
  }
  
  return { clean, modified, warnings };
}

/**
 * Sanitize a title (single line, stricter limits)
 */
export function sanitizeTitle(input: string | null | undefined): SanitizeResult {
  return sanitizeString(input, {
    maxLength: 200,
    stripHtml: true,
    allowNewlines: false,
  });
}

/**
 * Sanitize a description (multi-line, moderate limits)
 */
export function sanitizeDescription(input: string | null | undefined): SanitizeResult {
  return sanitizeString(input, {
    maxLength: 2000,
    stripHtml: true,
    allowNewlines: true,
  });
}

/**
 * Sanitize scraped HTML content (from external sites)
 */
export function sanitizeScrapedContent(input: string | null | undefined): SanitizeResult {
  return sanitizeString(input, {
    maxLength: 500,
    stripHtml: true,
    allowNewlines: false,
  });
}

/**
 * Sanitize an agent handle
 */
export function sanitizeHandle(input: string | null | undefined): SanitizeResult {
  if (!input) {
    return { clean: '', modified: false, warnings: ['Empty handle'] };
  }
  
  const clean = input
    .replace(/^@/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .substring(0, 32)
    .toLowerCase();
  
  return {
    clean,
    modified: clean !== input.replace(/^@/, '').toLowerCase(),
    warnings: [],
  };
}

/**
 * Check if content appears to contain prompt injection
 */
export function detectPromptInjection(input: string): string[] {
  const detected: string[] = [];
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      detected.push(pattern.toString());
    }
  }
  return detected;
}

/**
 * Simple text sanitizer - strips dangerous content, returns clean string
 */
export function sanitizeText(input: string | null | undefined, maxLength = 1000): string {
  const result = sanitizeString(input, {
    maxLength,
    stripHtml: true,
    allowNewlines: true,
  });
  return result.clean;
}
