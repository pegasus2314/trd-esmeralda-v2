import { z } from "zod";

export const DebaterInputSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio."),
  lastName: z.string().trim().min(1, "El apellido es obligatorio."),
  email: z.email("Correo inválido.").optional().or(z.literal("")),
  role: z.enum(["captain", "debater", "alternate"]).default("debater"),
});

export const RegistrationSchema = z.object({
  teamName: z.string().trim().min(2, "El nombre del equipo es obligatorio."),
  schoolName: z.string().trim().min(2, "El centro educativo es obligatorio."),
  district: z.string().trim().optional().or(z.literal("")),
  contactName: z.string().trim().min(2, "El nombre del responsable es obligatorio."),
  contactEmail: z.email("Correo de contacto inválido."),
  contactPhone: z.string().trim().optional().or(z.literal("")),
  coachName: z.string().trim().min(2, "El nombre del coach es obligatorio."),
  coachEmail: z.email("Correo del coach inválido."),
  coachPhone: z.string().trim().min(6, "El teléfono del coach es obligatorio."),
  coachSchool: z.string().trim().min(2, "El centro del coach es obligatorio."),
  coachDistrict: z.string().trim().optional().or(z.literal("")),
  consent: z.literal("on", { error: "Debes confirmar el consentimiento de datos." }),
  coachConsent: z.literal("on", { error: "Debes confirmar la autorización del coach." }),
  debaters: z
    .array(DebaterInputSchema)
    .min(1, "Añade al menos un integrante."),
});

export type RegistrationInput = z.infer<typeof RegistrationSchema>;
