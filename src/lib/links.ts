/**
 * Form where visitors send their own market photos (moderated before use).
 * Set NEXT_PUBLIC_PHOTO_FORM_URL; without it the button is hidden.
 * `npm run dev` uses a placeholder on example.com.
 */
export const PHOTO_FORM_URL: string | null = process.env.NEXT_PUBLIC_PHOTO_FORM_URL || null;

/**
 * Painted banner behind the title on the markets page, a file in /public
 * (e.g. "/images/hero.webp"). Decorative: no alt text, no AI label. Without it
 * our own SVG scene is drawn instead.
 */
export const HERO_IMAGE: string | null = null;
