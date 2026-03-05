// IS_VERCEL is an internal derived constant — not exported intentionally.
// Consumers should import USE_SYNC_EMAILS, not the raw detection logic.
const IS_VERCEL: boolean = !!(
  process.env.VERCEL_ENV ||
  process.env.VERCEL ||
  process.env.VERCEL_URL
);

export const USE_SYNC_EMAILS: boolean = IS_VERCEL;
