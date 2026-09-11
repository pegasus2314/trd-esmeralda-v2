"use client";

import { useRef } from "react";

export function QrButton({ name, qrDataUrl }: { name: string; qrDataUrl: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-lg border border-cyan/30 bg-cyan/10 px-2.5 py-1.5 text-[10px] font-black text-cyan hover:bg-cyan/20"
      >
        QR
      </button>
      <dialog
        ref={dialogRef}
        className="w-[min(360px,92vw)] rounded-2xl border border-line-strong bg-navy-800 p-0 text-ink backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="relative p-6 text-center">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="absolute right-3 top-2 text-2xl text-muted hover:text-ink"
            aria-label="Cerrar"
          >
            ×
          </button>
          <span className="block text-[11px] font-extrabold uppercase tracking-wide text-cyan">
            Acreditación
          </span>
          <h2 className="mt-1 text-2xl font-bold">{name}</h2>
          <img src={qrDataUrl} alt={`QR de acreditación de ${name}`} className="mx-auto my-4 h-54 w-54 rounded-lg bg-white p-2" />
          <p className="text-xs text-muted">
            Solo personal autorizado puede consultar y procesar esta ficha.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <a
              href={qrDataUrl}
              download={`QR-${name.replace(/[^a-z0-9áéíóúñü]+/gi, "-")}.png`}
              className="rounded-lg border border-line-strong px-4 py-2 text-sm font-bold hover:bg-cyan/10"
            >
              Descargar
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
