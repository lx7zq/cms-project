export const RESERVED_SLUGS = new Set([
  "admin",
  "dashboard",
  "login",
  "logout",
  "signup",
  "register",
  "auth",
  "api",
  "docs",
  "health",
  "settings",
  "users",
  "roles",
  "permissions",
  "media",
  "files",
  "analytics",
  "logs",
  "blog",
  "landing-pages",
  "landing-pages",
  "checkout",
  "cart",
  "promotion",
  "promo",
  "search",
  "profile",
  "account",
]);

export function normalizeSlugInput(input: string) {
  return (input ?? "")
    .trim()
    .toLowerCase()
    .replace(/^\/+/, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isReservedSlug(slug: string) {
  return RESERVED_SLUGS.has(slug.replace(/^\/+/, ""));
}

export function generateSlug(input: string | undefined, fallback = "page") {
  const normalized = normalizeSlugInput(input ?? "");
  const base = normalized || fallback;
  return isReservedSlug(base) ? `${base}-page` : base;
}
