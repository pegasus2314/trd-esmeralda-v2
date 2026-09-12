import { z } from "zod";

const idNumberRegex = /^\d{3}-?\d{7}-?\d{1}$/;
const idNumberField = (label: string) =>
  z
    .string()
    .trim()
    .regex(idNumberRegex, `${label} inválida. Formato: 000-0000000-0.`);

export const SUBJECT_AREAS = [
  { value: "lengua_espanola", label: "Lengua Española" },
  { value: "matematicas", label: "Matemáticas" },
  { value: "ciencias_naturales", label: "Ciencias Naturales" },
  { value: "ciencias_sociales", label: "Ciencias Sociales" },
  { value: "formacion_humana", label: "Formación Humana" },
  { value: "artes", label: "Artes" },
  { value: "educacion_fisica", label: "Educación Física" },
  { value: "coordinador_docente", label: "Coordinador Docente" },
  { value: "otra", label: "Otra" },
] as const;

export const DebaterInputSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio."),
  lastName: z.string().trim().min(1, "El apellido es obligatorio."),
  grade: z.string().trim().min(1, "El curso/grado es obligatorio."),
  email: z.email("Correo del integrante inválido u obligatorio (se usa para enviarle su QR de acreditación)."),
  phone: z.string().trim().min(6, "El teléfono del integrante es obligatorio."),
  idNumber: idNumberField("La cédula del integrante"),
  allergies: z.string().trim().optional().or(z.literal("")),
  medications: z.string().trim().optional().or(z.literal("")),
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
  coachIdNumber: idNumberField("La cédula del coach"),
  coachSubjectArea: z.enum(
    SUBJECT_AREAS.map((a) => a.value) as [string, ...string[]],
    "Selecciona el área curricular del coach."
  ),
  coachSchool: z.string().trim().min(2, "El centro del coach es obligatorio."),
  coachDistrict: z.string().trim().optional().or(z.literal("")),
  consent: z.literal("on", { error: "Debes confirmar el consentimiento de datos." }),
  coachConsent: z.literal("on", { error: "Debes confirmar la autorización del coach." }),
  debaters: z
    .array(DebaterInputSchema)
    .min(3, "Cada equipo necesita un mínimo de 3 debatientes.")
    .max(5, "Cada equipo puede tener un máximo de 5 debatientes."),
});

export type RegistrationInput = z.infer<typeof RegistrationSchema>;
