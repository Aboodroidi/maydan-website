import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  type ConfirmationResult,
} from "firebase/auth";
import { auth, firebaseReady } from "../lib/firebase";
import { useAuth } from "../lib/auth";
import { useLang } from "../lib/i18n";
import { SetupNotice } from "../components/SetupNotice";

const CODE_LENGTH = 6;

function friendlyError(code: string, ar: boolean): string {
  switch (code) {
    case "auth/invalid-phone-number":
    case "auth/missing-phone-number":
      return ar
        ? "الرقم غير صحيح. أدخل الرقم العماني المكون من 8 أرقام."
        : "That number does not look right. Enter your 8 digit Omani number.";
    case "auth/invalid-verification-code":
      return ar ? "الرمز غير صحيح. تحقق من الرسالة وحاول مجددا." : "Wrong code. Check the SMS and try again.";
    case "auth/code-expired":
      return ar ? "انتهت صلاحية الرمز. أرسل رمزا جديدا." : "That code expired. Send a new one.";
    case "auth/too-many-requests":
      return ar ? "محاولات كثيرة. انتظر قليلا ثم حاول مجددا." : "Too many attempts. Wait a bit and try again.";
    case "auth/network-request-failed":
      return ar ? "تعذر الاتصال. تحقق من الإنترنت وحاول مجددا." : "Connection problem. Check your internet and try again.";
    case "auth/popup-blocked":
      return ar ? "المتصفح منع النافذة المنبثقة. اسمح بها وحاول مجددا." : "Your browser blocked the popup. Allow popups and try again.";
    default:
      return ar ? "حدث خطأ ما. حاول مجددا." : "Something went wrong. Try again.";
  }
}

function errorCode(e: unknown): string {
  if (e && typeof e === "object" && "code" in e) return String((e as { code: unknown }).code);
  return "";
}

export default function SignInPage() {
  const { ar } = useLang();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const rawNext = params.get("next");
  const next = rawNext && rawNext.startsWith("/") ? rawNext : "/";

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [local, setLocal] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmRef = useRef<ConfirmationResult | null>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaHostRef = useRef<HTMLDivElement | null>(null);
  const codeRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Already signed in (or just finished), head to the destination.
  useEffect(() => {
    if (!loading && user) navigate(next, { replace: true });
  }, [user, loading, next, navigate]);

  // Tear the reCAPTCHA widget down when leaving the page.
  useEffect(() => {
    return () => {
      verifierRef.current?.clear();
      verifierRef.current = null;
    };
  }, []);

  if (!firebaseReady) {
    return (
      <SetupNotice
        title={ar ? "تسجيل الدخول غير مفعل" : "Sign in is not configured"}
        body={
          ar
            ? "أضف مفاتيح Firebase في متغيرات البيئة (VITE_FIREBASE_*) لتفعيل تسجيل الدخول."
            : "Add the Firebase web keys (VITE_FIREBASE_*) to the environment to enable sign in."
        }
      />
    );
  }

  const dropVerifier = () => {
    verifierRef.current?.clear();
    verifierRef.current = null;
  };

  const sendCode = async () => {
    const a = auth();
    const host = recaptchaHostRef.current;
    if (!a || !host || busy) return;
    if (local.length !== 8) {
      setError(friendlyError("auth/invalid-phone-number", ar));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (!verifierRef.current) {
        verifierRef.current = new RecaptchaVerifier(a, host, { size: "invisible" });
      }
      confirmRef.current = await signInWithPhoneNumber(a, `+968${local}`, verifierRef.current);
      setCode("");
      setStep("code");
      setTimeout(() => codeRefs.current[0]?.focus(), 50);
    } catch (e) {
      dropVerifier();
      setError(friendlyError(errorCode(e), ar));
    } finally {
      setBusy(false);
    }
  };

  const confirmCode = async (value: string) => {
    const result = confirmRef.current;
    if (!result || busy || value.length !== CODE_LENGTH) return;
    setBusy(true);
    setError(null);
    try {
      await result.confirm(value);
      navigate(next, { replace: true });
    } catch (e) {
      const codeStr = errorCode(e);
      setError(friendlyError(codeStr, ar));
      if (codeStr === "auth/code-expired") {
        confirmRef.current = null;
        dropVerifier();
        setStep("phone");
      }
      setCode("");
      setTimeout(() => codeRefs.current[0]?.focus(), 50);
    } finally {
      setBusy(false);
    }
  };

  const signInGoogle = async () => {
    const a = auth();
    if (!a || busy) return;
    setBusy(true);
    setError(null);
    try {
      await signInWithPopup(a, new GoogleAuthProvider());
      navigate(next, { replace: true });
    } catch (e) {
      const codeStr = errorCode(e);
      // Closing the popup is not an error worth shouting about.
      if (codeStr !== "auth/popup-closed-by-user" && codeStr !== "auth/cancelled-popup-request") {
        setError(friendlyError(codeStr, ar));
      }
    } finally {
      setBusy(false);
    }
  };

  const setCodeDigit = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const chars = code.split("");
    if (!digit) {
      chars[index] = "";
      setCode(chars.join("").slice(0, index));
      return;
    }
    while (chars.length < index) chars.push("");
    chars[index] = digit;
    const nextValue = chars.join("").slice(0, CODE_LENGTH);
    setCode(nextValue);
    if (index < CODE_LENGTH - 1) codeRefs.current[index + 1]?.focus();
    if (nextValue.length === CODE_LENGTH) void confirmCode(nextValue);
  };

  const onCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      e.preventDefault();
      setCode(code.slice(0, index - 1));
      codeRefs.current[index - 1]?.focus();
    }
  };

  const onCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!digits) return;
    setCode(digits);
    codeRefs.current[Math.min(digits.length, CODE_LENGTH - 1)]?.focus();
    if (digits.length === CODE_LENGTH) void confirmCode(digits);
  };

  const prettyPhone = `+968 ${local.slice(0, 4)} ${local.slice(4)}`;

  return (
    <div className="mx-auto grid min-h-full w-full max-w-[1400px] place-items-center px-4 py-10 sm:px-6">
      <div className="card fade-up w-full max-w-md p-8 sm:p-10">
        <img src="/assets/img/wordmark_electric_blue.svg" alt="Maydan" className="mx-auto mb-2 h-8 w-auto" />
        <p className="mb-7 text-center text-sm text-muted">
          {ar ? "سجل الدخول للحجز ومتابعة مبارياتك." : "Sign in to book pitches and follow your matches."}
        </p>

        {step === "phone" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendCode();
            }}
          >
            <label className="mb-2 block text-sm font-semibold text-muted" htmlFor="phone">
              {ar ? "رقم الهاتف" : "Phone number"}
            </label>
            <div
              dir="ltr"
              className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 focus-within:border-electric focus-within:ring-4 focus-within:ring-electric/15"
            >
              <span className="text-[15px] font-bold text-muted">+968</span>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="9XXX XXXX"
                value={local}
                onChange={(e) => setLocal(e.target.value.replace(/\D/g, "").slice(0, 8))}
                className="w-full bg-transparent text-[15px] font-semibold text-ink outline-none placeholder:text-muted/50"
              />
            </div>

            {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

            <div className="mt-5">
              <div ref={recaptchaHostRef} />
              <button type="submit" disabled={busy || local.length !== 8} className="btn btn-primary w-full disabled:opacity-50">
                {busy ? (ar ? "جاري الإرسال..." : "Sending...") : ar ? "أرسل الرمز" : "Send code"}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p className="text-center text-sm text-muted">
              {ar ? "أدخل الرمز المرسل إلى" : "Enter the code we sent to"}{" "}
              <span dir="ltr" className="font-bold text-ink">
                {prettyPhone}
              </span>
            </p>

            <div dir="ltr" className="mt-5 flex justify-center gap-2">
              {Array.from({ length: CODE_LENGTH }, (_, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    codeRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={code[i] ?? ""}
                  onChange={(e) => setCodeDigit(i, e.target.value)}
                  onKeyDown={(e) => onCodeKeyDown(i, e)}
                  onPaste={onCodePaste}
                  disabled={busy}
                  aria-label={`Digit ${i + 1}`}
                  className="h-13 w-11 rounded-xl border border-border bg-surface text-center text-lg font-bold text-ink outline-none focus:border-electric focus:ring-4 focus:ring-electric/15 disabled:opacity-50"
                />
              ))}
            </div>

            {error && <p className="mt-3 text-center text-sm font-semibold text-red-600">{error}</p>}

            <button
              type="button"
              onClick={() => void confirmCode(code)}
              disabled={busy || code.length !== CODE_LENGTH}
              className="btn btn-primary mt-5 w-full disabled:opacity-50"
            >
              {busy ? (ar ? "جاري التحقق..." : "Verifying...") : ar ? "تأكيد" : "Confirm"}
            </button>

            <button
              type="button"
              onClick={() => {
                confirmRef.current = null;
                dropVerifier();
                setCode("");
                setError(null);
                setStep("phone");
              }}
              className="mt-3 w-full text-center text-sm font-semibold text-muted hover:text-ink"
            >
              {ar ? "تغيير الرقم" : "Change number"}
            </button>
          </div>
        )}

        {step === "phone" && (
          <>
            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold text-muted">{ar ? "أو" : "or"}</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <button type="button" onClick={() => void signInGoogle()} disabled={busy} className="btn btn-ghost w-full disabled:opacity-50">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 01-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.96-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.14-4.06 1.14-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A12 12 0 0012 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.29 14.28A7.2 7.2 0 014.91 12c0-.79.14-1.56.38-2.28v-3.1H1.29a12 12 0 000 10.76l4-3.1z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44A11.98 11.98 0 0012 0 12 12 0 001.29 6.62l4 3.1C6.23 6.88 8.88 4.77 12 4.77z"
                />
              </svg>
              {ar ? "المتابعة عبر Google" : "Continue with Google"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
