/**
 * Form where visitors send their own market photos (moderated before use).
 * Set NEXT_PUBLIC_PHOTO_FORM_URL; without it the button is hidden.
 * `npm run dev` uses a placeholder on example.com.
 */
export const PHOTO_FORM_URL: string | null = process.env.NEXT_PUBLIC_PHOTO_FORM_URL || null;
