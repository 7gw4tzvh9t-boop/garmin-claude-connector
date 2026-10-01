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
        {
          fps: 10,
          qrbox: { width: 280, height: 160 },
          videoConstraints: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            // Non-standard but supported on Chrome/Android: without it some
            // phones lock focus once at start and never re-focus on a
            // close-up barcode, which is the "won't focus" symptom.
            advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet],
          },
        },
        (decodedText) => {
          if (detectedRef.current) return;
          detectedRef.current = true;
          onDetected(decodedText);
        },
        () => {
          // per-frame decode miss - expected while aiming the camera
        },
      )
      .then(() => {
        // Best effort: not all browsers/devices accept this constraint.
        scanner.applyVideoConstraints({
          advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet],
        }).catch(() => {
          /* continuous autofocus not supported on this device/browser */
        });
      })
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

  function refocus() {
    // Re-applying the constraint nudges some devices into re-focusing
    // immediately instead of waiting for their own autofocus cycle.
    scannerRef.current?.applyVideoConstraints({
      advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet],
    }).catch(() => {
      /* continuous autofocus not supported on this device/browser */
    });
  }

  return (
    <div>
      <div id={ELEMENT_ID} className="scanner-box" onClick={refocus} />
      {error && <p className="error-box">{error}</p>}
      <p className="muted" style={{ fontSize: "0.8rem" }}>
        Barcode mittig im Rahmen platzieren, 10-15 cm Abstand halten. Bild unscharf? Kurz auf das
        Kamerabild tippen, um neu zu fokussieren.
      </p>
    </div>
  );
}
