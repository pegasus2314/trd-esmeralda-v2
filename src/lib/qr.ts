import "server-only";
import QRCode from "qrcode";

/**
 * Genera el QR como data URL (PNG) en el servidor. No depende de ningún
 * servicio externo (a diferencia del sistema anterior, que mandaba el
 * enlace de acreditación —con el UUID real del participante— a
 * api.qrserver.com). El identificador nunca sale de nuestra propia
 * infraestructura para generar el código.
 */
export async function generateAccreditationQr(debaterId: string, origin: string): Promise<string> {
  const url = `${origin}/admin/acreditar/${debaterId}`;
  return QRCode.toDataURL(url, { width: 320, margin: 2, errorCorrectionLevel: "M" });
}
