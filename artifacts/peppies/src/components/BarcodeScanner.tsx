import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Camera, Keyboard, Loader2 } from "lucide-react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

const FORMATS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
  BarcodeFormat.ITF,
];

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const detectedRef = useRef(false);
  const onDetectedRef = useRef(onDetected);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const [manual, setManual] = useState("");
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    if (showManual) return;
    let cancelled = false;

    const hints = new Map<DecodeHintType, unknown>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, FORMATS);
    hints.set(DecodeHintType.TRY_HARDER, true);
    const reader = new BrowserMultiFormatReader(hints, {
      delayBetweenScanAttempts: 120,
      delayBetweenScanSuccess: 600,
    });

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera not supported on this device.");
        }
        const videoEl = videoRef.current;
        if (!videoEl) return;

        const onResult = (
          controls: IScannerControls,
          result: { getText: () => string } | undefined,
        ) => {
          if (cancelled || detectedRef.current) return;
          if (result) {
            detectedRef.current = true;
            const text = result.getText();
            try {
              controls.stop();
            } catch {
              // ignore
            }
            onDetectedRef.current(text);
          }
        };

        // Samsung Internet and some Android browsers throw OverconstrainedError
        // when `facingMode: { exact: ... }` is used. Use `ideal` first, and if
        // that still fails for any reason, fall back to default camera.
        let controls: IScannerControls;
        try {
          controls = await reader.decodeFromConstraints(
            {
              audio: false,
              video: {
                facingMode: { ideal: "environment" },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
            },
            videoEl,
            (result) => onResult(controls, result ?? undefined),
          );
        } catch (innerErr) {
          if (cancelled) return;
          // Retry with no facingMode hint — any camera is better than none.
          controls = await reader.decodeFromConstraints(
            { audio: false, video: true },
            videoEl,
            (result) => onResult(controls, result ?? undefined),
          );
          void innerErr;
        }

        if (cancelled) {
          controls.stop();
          return;
        }

        // Samsung Internet occasionally doesn't honor implicit autoplay even
        // when the video is muted+playsInline — kick it explicitly.
        try {
          await videoEl.play();
        } catch {
          // play() rejection is non-fatal; the user can tap to start.
        }

        controlsRef.current = controls;
        setStarting(false);
      } catch (e) {
        const name = e instanceof Error ? e.name : "";
        const msg =
          name === "NotAllowedError" || name === "SecurityError"
            ? "Camera permission was denied. Allow camera access in your browser settings, or enter the barcode manually."
            : name === "NotFoundError" || name === "OverconstrainedError"
              ? "No camera found on this device. You can enter the barcode manually."
              : name === "NotReadableError"
                ? "Camera is in use by another app. Close it and try again, or enter the barcode manually."
                : e instanceof Error
                  ? e.message
                  : "Couldn't start the camera.";
        if (!cancelled) {
          setError(msg);
          setStarting(false);
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      try {
        controlsRef.current?.stop();
      } catch {
        // ignore
      }
      controlsRef.current = null;
    };
  }, [showManual]);

  const handleManualSubmit = () => {
    const v = manual.trim();
    if (!/^\d{6,14}$/.test(v)) {
      setError("Enter a 6–14 digit barcode.");
      return;
    }
    onDetected(v);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black flex flex-col"
      data-testid="barcode-scanner"
    >
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3"
        style={{ paddingTop: "max(12px, env(safe-area-inset-top, 12px))" }}
      >
        <div className="flex items-center gap-2 text-white">
          <Camera size={16} strokeWidth={2.2} />
          <span className="text-[14px] font-semibold">Scan barcode</span>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white"
          data-testid="button-close-scanner"
        >
          <X size={17} strokeWidth={2.4} />
        </button>
      </div>

      {!showManual ? (
        <div className="relative flex-1 overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            {...({ "webkit-playsinline": "true" } as Record<string, string>)}
            className="absolute inset-0 w-full h-full object-cover bg-black"
          />

          {/* Targeting frame */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-[78%] max-w-[320px] aspect-[3/2] rounded-2xl">
              <div className="absolute inset-0 rounded-2xl border-2 border-white/30" />
              <div className="absolute -top-px -left-px w-10 h-10 border-t-[3px] border-l-[3px] border-primary rounded-tl-2xl" />
              <div className="absolute -top-px -right-px w-10 h-10 border-t-[3px] border-r-[3px] border-primary rounded-tr-2xl" />
              <div className="absolute -bottom-px -left-px w-10 h-10 border-b-[3px] border-l-[3px] border-primary rounded-bl-2xl" />
              <div className="absolute -bottom-px -right-px w-10 h-10 border-b-[3px] border-r-[3px] border-primary rounded-br-2xl" />
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: ["0%", "100%", "0%"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-3 right-3 h-[2px] bg-primary/80 shadow-[0_0_12px_rgba(20,184,166,0.7)] rounded-full"
              />
            </div>
          </div>

          {starting && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40">
              <Loader2 size={26} className="animate-spin text-white" />
              <p className="text-[13px] text-white/80">Starting camera…</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 px-6 text-center">
              <p className="text-[14px] text-white font-semibold">Camera unavailable</p>
              <p className="text-[12.5px] text-white/70 leading-relaxed max-w-[280px]">
                {error}
              </p>
              <button
                onClick={() => {
                  setError(null);
                  setShowManual(true);
                }}
                className="mt-2 bg-white text-black font-semibold text-[13px] px-5 py-2.5 rounded-2xl"
                data-testid="button-enter-manually-from-error"
              >
                Enter manually
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white">
            <Keyboard size={22} strokeWidth={1.8} />
          </div>
          <h3 className="text-white text-[16px] font-bold">Enter barcode</h3>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={manual}
            onChange={(e) => {
              setError(null);
              setManual(e.target.value.replace(/\D/g, ""));
            }}
            placeholder="e.g. 0123456789012"
            className="w-full max-w-[300px] bg-white/10 text-white rounded-2xl px-4 py-3.5 text-center text-[16px] outline-none focus:ring-2 focus:ring-primary/60 tracking-widest"
            data-testid="input-manual-barcode"
            autoFocus
          />
          {error && (
            <p className="text-[12.5px] text-red-300" data-testid="text-manual-error">
              {error}
            </p>
          )}
          <button
            onClick={handleManualSubmit}
            className="w-full max-w-[300px] bg-primary text-primary-foreground font-semibold text-[14px] py-3.5 rounded-2xl"
            data-testid="button-submit-manual-barcode"
          >
            Look up
          </button>
          <button
            onClick={() => {
              setError(null);
              setShowManual(false);
            }}
            className="text-[12.5px] text-white/60 underline"
            data-testid="button-back-to-camera"
          >
            Back to camera
          </button>
        </div>
      )}

      {!showManual && !error && (
        <div
          className="absolute bottom-0 left-0 right-0 z-10 px-5"
          style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom, 20px))" }}
        >
          <p className="text-center text-[12px] text-white/70 mb-3">
            Center the barcode in the frame
          </p>
          <button
            onClick={() => setShowManual(true)}
            className="w-full bg-white/15 backdrop-blur text-white font-semibold text-[13px] py-3 rounded-2xl flex items-center justify-center gap-2"
            data-testid="button-enter-manually"
          >
            <Keyboard size={14} strokeWidth={2.2} />
            Enter barcode manually
          </button>
        </div>
      )}
    </motion.div>
  );
}
