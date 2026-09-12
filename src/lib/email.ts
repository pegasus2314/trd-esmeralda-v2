import "server-only";
import { Resend } from "resend";

// Perezoso por la misma razón que src/lib/db.ts: no crear nada a nivel
// de módulo que dependa de variables de entorno, para que un problema
// de configuración nunca tumbe el build completo — solo falle, con un
// mensaje claro, si de verdad se intenta enviar un correo.
let resendClient: Resend | null = null;
function getResend(): Resend {
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}
const FROM = () => process.env.EMAIL_FROM ?? "TRD La Regional Esmeralda <onboarding@resend.dev>";

function escapeHtml(v: string): string {
  return v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]!));
}

export type AccreditationEmailInput = {
  to: string;
  fullName: string;
  teamName: string;
  eventName: string;
  eventDate: string | null;
  venue: string | null;
  accreditationUrl: string;
  qrCid: string;
};

function accreditationEmailHtml(input: AccreditationEmailInput): string {
  const name = escapeHtml(input.fullName);
  const team = escapeHtml(input.teamName);
  const event = escapeHtml(input.eventName);

  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:#071522;font-family:Arial,Helvetica,sans-serif;color:#eef6fa;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#071522;padding:32px 0;">
<tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#0b2032;border-radius:20px;overflow:hidden;border:1px solid #1c3a4d;">
  <tr><td style="padding:28px 32px 0;">
    <span style="display:block;color:#19dce5;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">${event}</span>
    <h1 style="margin:8px 0 4px;font-size:26px;line-height:1.1;color:#fff;">Tu credencial digital</h1>
    <p style="margin:0;color:#90a8b6;font-size:13px;">Presenta este código QR para tu acreditación el día del evento.</p>
  </td></tr>
  <tr><td style="padding:20px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#122c40;border-radius:12px;">
      <tr><td style="padding:14px 16px;">
        <span style="display:block;color:#6f8996;font-size:10px;text-transform:uppercase;">Nombre</span>
        <strong style="font-size:15px;color:#eef6fa;">${name}</strong>
      </td></tr>
      <tr><td style="padding:0 16px 14px;">
        <span style="display:block;color:#6f8996;font-size:10px;text-transform:uppercase;">Equipo</span>
        <strong style="font-size:15px;color:#eef6fa;">${team}</strong>
      </td></tr>
    </table>
  </td></tr>
  <tr><td align="center" style="padding:8px 32px 28px;">
    <img src="cid:${input.qrCid}" width="240" height="240" alt="Código QR de acreditación" style="display:block;background:#fff;border-radius:12px;padding:10px;" />
    <p style="margin:16px 0 0;color:#90a8b6;font-size:11px;line-height:1.5;">
      Este QR es personal e intransferible. No lo compartas — es tu credencial individual para acreditarte.
    </p>
  </td></tr>
  <tr><td style="padding:0 32px 28px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(25,220,229,.06);border:1px solid rgba(25,220,229,.16);border-radius:12px;">
      <tr><td style="padding:16px;">
        <strong style="display:block;color:#19dce5;font-size:12px;margin-bottom:6px;">Instrucciones</strong>
        <p style="margin:0;color:#c7d9e3;font-size:12.5px;line-height:1.6;">
          Al llegar a la sede, muestra este correo (o el QR) en tu teléfono al personal de
          acreditación${input.eventDate ? ` el ${escapeHtml(input.eventDate)}` : ""}${input.venue ? ` en ${escapeHtml(input.venue)}` : ""}.
          Ellos escanearán tu código y confirmarán tu identidad para completar tu acreditación.
        </p>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:0 32px 28px;border-top:1px solid #1c3a4d;padding-top:20px;">
    <p style="margin:0;color:#6f8996;font-size:10.5px;">TRD La Regional Esmeralda · Regional 17</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export type SendResult = { ok: true } | { ok: false; error: string };

export async function sendAccreditationEmail(
  input: AccreditationEmailInput & { qrBuffer: Buffer }
): Promise<SendResult> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: "RESEND_API_KEY no está configurada." };
  }

  try {
    const { error } = await getResend().emails.send({
      from: FROM(),
      to: input.to,
      subject: `Tu credencial de acreditación · ${input.eventName}`,
      html: accreditationEmailHtml(input),
      attachments: [
        {
          filename: "qr-acreditacion.png",
          content: input.qrBuffer,
          contentId: input.qrCid,
        },
      ],
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error enviando el correo." };
  }
}
