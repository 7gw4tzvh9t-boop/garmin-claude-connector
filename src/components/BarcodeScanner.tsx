import { useEffect, useRef, useState } from "react";
import {
  Html5Qrcode,
  Html5QrcodeScannerState,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

const BARCODE_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
];

const ELEMENT_ID = "barcode-scanner-viewport";

export default function BarcodeScanner({
  onDetected,
}: {
  onDetected: (code: string) => void;
}) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const detectedRef = useRef(false);

  useEffect(() => {
    detectedRef.current = false;
    const scanner = new Html5Qrcode(ELEMENT_ID, {
      formatsToSupport: BARCODE_FORMATS,
      verbose: false,
    });
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 140 } },
        (decodedText) => {
          if (detectedRef.current) return;
          detectedRef.current = true;
          onDetected(decodedText);
        },
        () => {
          // per-frame decode miss - expected while aiming the camera
        },
      )
      .catch((err) => {
        setError(
          err?.message?.includes("NotAllowedError") || String(err).includes("Permission")
            ? "Kamerazugriff wurde verweigert. Bitte in den Browser-Einstellungen erlauben."
            : "Kamera konnte nicht gestartet werden.",
        );
      });

    return () => {
      if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {
            /* already stopped */
          });
      } else {
        scanner.clear();
      }
    };
  }, [onDetected]);

  return (
    <div>
      <div id={ELEMENT_ID} className="scanner-box" />
      {error && <p className="error-box">{error}</p>}
      <p className="muted" style={{ fontSize: "0.8rem" }}>
        Barcode mittig im Rahmen platzieren – Fokus etwas Abstand halten (10-15 cm).
      </p>
    </div>
  );
}
