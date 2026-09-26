// The site password itself now lives in Supabase (app_settings.site_password_hash,
// salted + hashed — see src/lib/password.ts) instead of here, so it never ends up
// in the git repo. Change it from Settings once the app is running.
export type Profile = "jagadesh" | "harshita";

export const PROFILES: Profile[] = ["jagadesh", "harshita"];

export const PROFILE_LABELS: Record<Profile, string> = {
  jagadesh: "Jagadesh",
  harshita: "Harshita",
};
