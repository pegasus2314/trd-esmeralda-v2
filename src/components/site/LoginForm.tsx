"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth-actions";
import { Field, FormMessage, inputClass } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="grid gap-3.5">
      <Field label="Correo">
        <input className={inputClass} type="email" name="email" autoComplete="username" required />
      </Field>
      <Field label="Contraseña">
        <input
          className={inputClass}
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <FormMessage tone="error">{state?.error}</FormMessage>
      <Button type="submit" variant="primary" disabled={pending} className="w-full">
        {pending ? "Verificando…" : "Entrar a administración"}
      </Button>
    </form>
  );
}
