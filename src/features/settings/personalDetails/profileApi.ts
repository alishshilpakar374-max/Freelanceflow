import type { PostgrestError } from "@supabase/supabase-js";
import { ApiError } from "@/features/leads/leadsApi";
import type { ProfileFormValues } from "@/features/settings/personalDetails/profileSchema";
import { supabase } from "@/lib/supabase";

interface ProfileRow {
  full_name: string;
  phone: string | null;
  business_name: string | null;
  website: string | null;
  location: string | null;
}

function toApiError(error: PostgrestError, fallback: string): ApiError {
  if (import.meta.env.DEV) console.error("[profileApi]", error);

  if (error.code === "42501")
    return new ApiError("You don't have permission to do that.");
  if (error.code === "23514")
    return new ApiError(
      "Some values are too long. Check the form and try again.",
    );
  if (/fetch|network/i.test(error.message)) {
    return new ApiError(
      "Network problem. Check your connection and try again.",
    );
  }
  return new ApiError(fallback);
}

// null = the profile row doesn't exist yet (it will be created on first save).
export async function getProfile(
  userId: string,
): Promise<ProfileFormValues | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, phone, business_name, website, location")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw toApiError(error, "Could not load your profile.");
  if (!data) return null;

  const row = data as ProfileRow;
  return {
    fullName: row.full_name,
    phone: row.phone ?? "",
    businessName: row.business_name ?? "",
    website: row.website ?? "",
    location: row.location ?? "",
  };
}

export async function saveProfile(
  userId: string,
  values: ProfileFormValues,
  syncAuthName: boolean,
): Promise<void> {
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: values.fullName,
    phone: values.phone,
    business_name: values.businessName,
    website: values.website,
    location: values.location,
  });

  if (error) throw toApiError(error, "Could not save your profile.");

  // Keeps the name in the login session too, so the header updates.
  if (syncAuthName) {
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: values.fullName },
    });
    if (authError) {
      if (import.meta.env.DEV) console.error("[profileApi]", authError);
      throw new ApiError(
        "Could not update your account name. Please try again.",
      );
    }
  }
}
