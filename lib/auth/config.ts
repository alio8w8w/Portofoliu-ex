// Simple single-owner auth. Values can be overridden from .env without touching code.
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "ilinaboclinca@gmil.com").trim().toLowerCase()
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "ilinca1234"

/** Stable id stored in the `userId` column of every content row. */
export const OWNER_ID = process.env.SITE_OWNER_ID ?? "ilina-owner"

export const SESSION_COOKIE = "admin_session"
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

/** Used to sign the session cookie. Set AUTH_SECRET in .env for production. */
export const AUTH_SECRET = process.env.AUTH_SECRET ?? "dev-only-portfolio-secret-change-me"
