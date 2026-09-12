"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/primitives";
import type QrScanner from "qr-scanner";

/** Saca el token de acreditación de cualquier URL /admin/acreditar/<token>. */
function extractToken(scanned: string): string | null {
  const match = scanned.match(/\/admin\/acreditar\/([^/?#]+)/);
  if (match) return match[1];
  // Si alguien apunta la cámara a un QR que es solo el token en texto plano.
  if (/^[0-9a-fA-F-]{20,}$/.test(scanned.trim())) return scanned.trim();
  return null;
}

export function QrScannerView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const router = useRouter();
  const [status, setStatus] = useState<"starting" | "scanning" | "found" | "error">("starting");
  const [error, setError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const { default: QrScanner } = await import("qr-scanner");

      if (cancelled || !videoRef.current) return;

      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          const token = extractToken(result.data);
          if (!token) return;
          setStatus("found");
          scanner.stop();
          router.push(`/admin/acreditar/${token}`);
        },
        {
          preferredCamera: "environment",
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 10,
        }
      );

      scannerRef.current = scanner;

      try {
        await scanner.start();
        if (cancelled) {
          scanner.stop();
          return;
        }
        setStatus("scanning");
        QrScanner.listCameras(true).then((cams) => {
          if (!cancelled) setHasMultipleCameras(cams.length > 1);
        });
      } catch (e) {
        if (!cancelled) {
          setStatus("error");
          setError(
            e instanceof Error
              ? e.message
              : "No se pudo acceder a la cámara. Revisa los permisos del navegador."
          );
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      scannerRef.current?.stop();
      scannerRef.current?.destroy();
    };
  }, [router]);

  function flipCamera() {
    scannerRef.current?.setCamera("environment").catch(() => {
      // Si no hay cámara trasera disponible, intenta con la frontal.
      scannerRef.current?.setCamera("user").catch(() => {});
    });
  }

  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-line bg-black">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
        {status === "starting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy-900/80 text-sm text-muted">
            Solicitando acceso a la cámara…
          </div>
        )}
        {status === "found" && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy-900/80 text-sm font-bold text-cyan">
            ✓ QR detectado, abriendo ficha…
          </div>
        )}
      </div>

      {status === "error" && (
        <div className="mx-auto mt-4 max-w-md">
          <FormMessage tone="error">{error}</FormMessage>
          <p className="mt-2 text-xs text-muted">
            Si el navegador bloqueó el permiso de cámara, habilítalo desde el ícono de candado en
            la barra de direcciones y recarga la página.
          </p>
        </div>
      )}

      {status === "scanning" && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-xs text-muted">Apunta la cámara al código QR del participante.</p>
          {hasMultipleCameras && (
            <Button size="sm" variant="outline" onClick={flipCamera}>
              🔄 Cambiar cámara
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
