import "server-only";
import QRCode from "qrcode";

/**
 * Genera el QR como data URL (PNG) en el servidor. No depende de ningún
 * servicio externo. El QR codifica la URL de acreditación con el TOKEN
 * de acreditación del participante (no su id real de base de datos) —
 * ver trd.debaters.accreditation_token.
 */
export function accreditationUrl(token: string, origin: string): string {
  return `${origin}/admin/acreditar/${token}`;
}

export async function generateAccreditationQr(token: string, origin: string): Promise<string> {
  return QRCode.toDataURL(accreditationUrl(token, origin), {
    width: 320,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}

/** Buffer PNG (para adjuntar en el correo, en vez de un data URL). */
export async function generateAccreditationQrBuffer(token: string, origin: string): Promise<Buffer> {
  return QRCode.toBuffer(accreditationUrl(token, origin), {
    width: 480,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}
