import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentStaff } from "@/lib/dal/auth";
import { LoginForm } from "@/components/site/LoginForm";
import { Eyebrow } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Acceso" };

export default async function AccesoPage() {
  const staff = await getCurrentStaff();
  if (staff) redirect("/admin");

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <main className="w-full max-w-[900px]">
        <header className="mb-8 flex flex-col items-center gap-2 text-center">
          <img src="/logo-regional17.svg" alt="Regional 17" className="h-[74px] w-[74px]" />
          <Eyebrow>TRD LA REGIONAL ESMERALDA</Eyebrow>
          <h1 className="font-display text-5xl">Acceso</h1>
          <p className="text-sm text-muted">Selecciona cómo deseas entrar al sistema.</p>
        </header>
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-line bg-navy-800 p-7">
            <div className="flex h-13 w-13 items-center justify-center rounded-xl border border-cyan/25 bg-cyan/10 text-2xl text-cyan">
              ♟
            </div>
            <h2 className="mt-4 text-2xl font-bold">Debatientes</h2>
            <p className="mt-1.5 mb-5 text-[12.5px] leading-relaxed text-muted">
              Accede sin crear una cuenta. Aquí encontrarás únicamente la inscripción y la
              consulta pública de equipos y participantes.
            </p>
            <Link
              href="/inscripcion"
              className="flex w-full items-center justify-center rounded-xl border border-cyan bg-cyan px-4 py-3 font-bold text-cyan-ink"
            >
              Entrar como debatiente →
            </Link>
          </article>
          <article className="rounded-2xl border border-line bg-navy-800 p-7">
            <div className="flex h-13 w-13 items-center justify-center rounded-xl border border-cyan/25 bg-cyan/10 text-2xl text-cyan">
              ⚙
            </div>
            <h2 className="mt-4 text-2xl font-bold">Administración</h2>
            <p className="mt-1.5 mb-5 text-[12.5px] leading-relaxed text-muted">
              Área privada para cuentas administrativas autorizadas. El acceso requiere iniciar
              sesión y verificar los permisos.
            </p>
            <LoginForm />
          </article>
        </section>
      </main>
    </div>
  );
}
