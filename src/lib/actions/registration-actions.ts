"use server";

import { createRegistration } from "@/lib/dal/registration";
import { getOrigin } from "@/lib/origin";
import type { RegistrationInput } from "@/lib/validation";

export type RegisterFormState = { ok: boolean; error?: string; emailsFailed?: number } | undefined;

export async function registerTeamAction(
  _prev: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const debaterCount = Number(formData.get("debaterCount") ?? 0);
  const debaters: RegistrationInput["debaters"] = [];
  for (let i = 0; i < debaterCount; i++) {
    const firstName = formData.get(`debater_first_${i}`);
    const lastName = formData.get(`debater_last_${i}`);
    if (!firstName || !lastName) continue;
    debaters.push({
      firstName: String(firstName),
      lastName: String(lastName),
      email: String(formData.get(`debater_email_${i}`) ?? ""),
      role: (formData.get(`debater_role_${i}`) as "captain" | "debater" | "alternate") ?? "debater",
    });
  }

  const input: RegistrationInput = {
    teamName: String(formData.get("teamName") ?? ""),
    schoolName: String(formData.get("schoolName") ?? ""),
    district: String(formData.get("district") ?? ""),
    contactName: String(formData.get("contactName") ?? ""),
    contactEmail: String(formData.get("contactEmail") ?? ""),
    contactPhone: String(formData.get("contactPhone") ?? ""),
    coachName: String(formData.get("coachName") ?? ""),
    coachEmail: String(formData.get("coachEmail") ?? ""),
    coachPhone: String(formData.get("coachPhone") ?? ""),
    coachSchool: String(formData.get("coachSchool") ?? ""),
    coachDistrict: String(formData.get("coachDistrict") ?? ""),
    consent: formData.get("consent") === "on" ? "on" : ("" as "on"),
    coachConsent: formData.get("coachConsent") === "on" ? "on" : ("" as "on"),
    debaters,
  };

  const origin = await getOrigin();
  const result = await createRegistration(input, origin);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, emailsFailed: result.emailsFailed };
}
