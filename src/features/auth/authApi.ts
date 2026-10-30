import type { AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type AuthResult =
  | { ok: true; needsEmailConfirmation?: boolean }
  | { ok: false; message: string };

function toMessage(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return "Incorrect email or password.";
    case "email_not_confirmed":
      return "Please confirm your email first. Check your inbox for the link.";
    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists. Try signing in instead.";
    case "weak_password":
      return "That password is too weak. Try a longer or less common one.";
    case "same_password":
      return "Your new password must be different from the old one.";
    case "reauthentication_needed":
      return "For security, please sign out, sign back in, and try again.";
    case "session_expired":
    case "session_not_found":
      return "Your session expired. Please sign in again.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Too many attempts. Please wait a few minutes and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? { ok: false, message: toMessage(error) } : { ok: true };
}

export async function signUp(
  fullName: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) return { ok: false, message: toMessage(error) };
  return { ok: true, needsEmailConfirmation: data.session === null };
}

export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();
  return error
    ? { ok: false, message: "Could not sign out. Please try again." }
    : { ok: true };
}

// Supabase answers the same way whether or not the email has an account,
// so this never reveals who is registered.
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return error ? { ok: false, message: toMessage(error) } : { ok: true };
}

// Works for a signed-in user, including the temporary session from a reset-email link.
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, message: toMessage(error) };

  // Sign out every other device. A failure here must not hide the successful change.
  try {
    await supabase.auth.signOut({ scope: "others" });
  } catch {
    // ignore
  }
  return { ok: true };
}

// Verifies the current password first, so someone at an unlocked laptop can't change it.
export async function changePassword(
  email: string,
  currentPassword: string,
  newPassword: string,
): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });
  if (error) {
    return {
      ok: false,
      message:
        error.code === "invalid_credentials"
          ? "Your current password is incorrect."
          : toMessage(error),
    };
  }
  return updatePassword(newPassword);
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });

  if (error) {
    console.error("Google OAuth error:", error);

    return {
      ok: false,
      message: error.message,
    };
  }

  return { ok: true };
}
