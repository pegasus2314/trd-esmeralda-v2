import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/primitives";
import { RegistrationForm } from "@/components/site/RegistrationForm";

export const metadata: Metadata = { title: "Inscripción" };

export default function InscripcionPage() {
  return (
    <section className="mx-auto w-[92vw] max-w-4xl py-13">
      <SectionHeading
        eyebrow="INSCRIPCIÓN"
        title="Registra tu equipo"
        description="Completa la información solicitada para registrar el equipo. La organización revisará la solicitud antes de aprobarla."
      />
      <RegistrationForm />
    </section>
  );
}
