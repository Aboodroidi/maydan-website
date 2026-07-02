import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { openaiKey } from "../lib/firebase";
import { fetchPitches } from "../lib/data";
import type { Pitch } from "../lib/types";
import { useLang } from "../lib/i18n";
import { streamReply, type ChatTurn } from "../lib/openai";
import { SetupNotice } from "../components/SetupNotice";

// NOTE: Maydan AI currently calls OpenAI straight from the browser with
// VITE_OPENAI_KEY (dev only). The key must move behind a server proxy
// before launch; see src/lib/openai.ts.

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

/** Sentinel id so the greeting re-renders in the active language. */
const GREETING_ID = "greeting";

const COPY = {
  en: {
    title: "Maydan AI",
    beta: "Beta v1.0",
    newChat: "New chat",
    greeting: "Hey! I'm your Maydan assistant. Looking for a pitch, a time, or help with a booking?",
    placeholder: "Ask Maydan anything",
    send: "Send message",
    empty: "Sorry, I didn't catch that. Try again?",
    error: "Sorry, I couldn't reach the assistant right now. Try again in a moment.",
    setupTitle: "Maydan AI is not configured",
    setupBody: "Add VITE_OPENAI_KEY for local dev; production will use a server proxy.",
  },
  ar: {
    title: "ميدان AI",
    beta: "تجريبي 1.0",
    newChat: "محادثة جديدة",
    greeting: "مرحباً! أنا مساعد ميدان. تبحث عن ملعب، أو وقت، أو مساعدة في حجز؟",
    placeholder: "اسأل ميدان أي شيء",
    send: "إرسال",
    empty: "عذراً، لم أفهم ذلك. حاول مرة أخرى؟",
    error: "عذراً، تعذر الوصول إلى المساعد الآن. حاول بعد قليل.",
    setupTitle: "ميدان AI غير مفعل",
    setupBody: "أضف VITE_OPENAI_KEY للتطوير المحلي؛ النسخة النهائية ستستخدم وسيطاً على الخادم.",
  },
} as const;

const initialMessages = (): Message[] => [{ id: GREETING_ID, text: "", isUser: false }];

/**
 * Compact LIVE PITCH DATA block for the system prompt, mirroring the iOS
 * ChatView.pitchContext: closest first, price, size/surface, available
 * future slot times today, "call to book" for non-pro tiers.
 */
function buildPitchContext(pitches: Pitch[]): string {
  if (pitches.length === 0) return "";
  const fmt = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" });
  const now = Date.now();
  const dayEnd = new Date();
  dayEnd.setHours(24, 0, 0, 0);

  const lines = ["LIVE PITCH DATA (closest first). Prices in OMR."];
  const sorted = [...pitches].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 20);
  for (const p of sorted) {
    const parts = [
      p.area ? `${p.name}, ${p.area}` : p.name,
      `${p.distanceKm.toFixed(1)} km`,
      `${Math.round(p.pricePerHour)} OMR/hr`,
      `${p.size}, ${p.surface}${p.isIndoor ? ", indoor" : ""}`,
    ];
    // Only plus/pro tiers surface slots; pro alone is bookable in-app.
    if (p.tier === "plus" || p.tier === "pro") {
      const times = p.slots
        .filter((s) => s.isAvailable && s.startMs > now && s.startMs < dayEnd.getTime())
        .sort((a, b) => a.startMs - b.startMs)
        .map((s) => fmt.format(new Date(s.startMs)));
      parts.push(times.length ? `${times.length} slots today: ${times.join(", ")}` : "no slots left today");
      parts.push(p.tier === "pro" ? "bookable in-app" : "call to book");
    } else {
      parts.push("call to book");
    }
    lines.push("- " + parts.join(" · "));
  }
  return lines.join("\n");
}

/** Inline markdown: **bold** only. */
function inline(text: string): ReactNode {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

/** Basic markdown block: bold + "-"/"*" bullets, line breaks preserved. */
function Markdown({ text }: { text: string }) {
  return (
    <div className="space-y-1.5">
      {text.split("\n").map((raw, i) => {
        const line = raw.trimStart();
        if (!line) return <div key={i} className="h-1.5" />;
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={i} className="flex gap-2.5">
              <span className="text-electric-bright">•</span>
              <span className="min-w-0">{inline(line.slice(2))}</span>
            </div>
          );
        }
        return <div key={i}>{inline(line)}</div>;
      })}
    </div>
  );
}

/** Three staggered dots shown before the first token arrives. */
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-[7px] w-[7px] animate-pulse rounded-full bg-muted"
          style={{ animationDelay: `${i * 200}ms` }}
        />
      ))}
    </div>
  );
}

export default function ChatPage() {
  const { ar } = useLang();
  const t = COPY[ar ? "ar" : "en"];
  const enabled = Boolean(openaiKey);

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [pitchContext, setPitchContext] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  // Load live pitch data once so the assistant can answer with real
  // availability, prices and distances.
  useEffect(() => {
    let alive = true;
    fetchPitches()
      .then((pitches) => {
        if (alive) setPitchContext(buildPitchContext(pitches));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Keep the newest message in view as tokens stream in.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const displayText = (m: Message) => (m.id === GREETING_ID ? t.greeting : m.text);

  const newChat = () => {
    setMessages(initialMessages());
    setDraft("");
  };

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || sending || !enabled) return;

    const next = [...messages, { id: crypto.randomUUID(), text, isUser: true }];
    const assistantId = crypto.randomUUID();
    setMessages([...next, { id: assistantId, text: "", isUser: false }]);
    setDraft("");
    setSending(true);

    const history: ChatTurn[] = next.map((m) => ({
      role: m.isUser ? "user" : "assistant",
      content: displayText(m),
    }));
    const patch = (updater: (text: string) => string) =>
      setMessages((cur) => cur.map((m) => (m.id === assistantId ? { ...m, text: updater(m.text) } : m)));

    try {
      let received = false;
      await streamReply(history, pitchContext, (delta) => {
        received = true;
        patch((cur) => cur + delta);
      });
      if (!received) patch(() => t.empty);
    } catch {
      patch(() => t.error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-5 py-4 lg:px-8">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-[1.5px] border-electric bg-surface">
            <img src="/assets/img/logo_electric_blue.svg" alt="" className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-black leading-tight tracking-tight">{t.title}</h1>
            <p className="text-[11px] font-semibold text-muted">{t.beta}</p>
          </div>
          <button
            onClick={newChat}
            className="ms-auto grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-electric/10 hover:text-electric"
            aria-label={t.newChat}
            title={t.newChat}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H5a1 1 0 00-1 1v14a1 1 0 001 1h14a1 1 0 001-1v-6" />
              <path d="M17.7 3.3a2 2 0 013 3L12 15l-4 1 1-4 8.7-8.7z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto scroll-thin">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-6 lg:px-8">
          {messages.map((m) => {
            if (m.isUser) {
              return (
                <div key={m.id} className="flex justify-end fade-up">
                  <div className="max-w-[82%] rounded-[20px] bg-electric px-4 py-2.5 text-[15px] leading-relaxed text-white shadow-[0_2px_10px_rgba(37,99,235,0.28)]">
                    {m.text}
                  </div>
                </div>
              );
            }
            const text = displayText(m);
            if (!text) return <TypingDots key={m.id} />;
            return (
              <div key={m.id} className="text-[15px] leading-relaxed fade-up">
                <Markdown text={text} />
              </div>
            );
          })}

          {!enabled && <SetupNotice title={t.setupTitle} body={t.setupBody} />}
        </div>
      </div>

      {/* Input bar */}
      <div className="px-5 pb-5 pt-1 lg:px-8">
        <form
          onSubmit={send}
          className="card mx-auto flex w-full max-w-3xl items-center gap-2 py-2 ps-5 pe-2 focus-within:border-electric/40 focus-within:shadow-[0_2px_6px_rgba(13,27,50,0.04),0_12px_32px_rgba(37,99,235,0.14)]"
          style={{ borderRadius: 999 }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t.placeholder}
            disabled={!enabled || sending}
            className="min-w-0 flex-1 bg-transparent py-1.5 text-[15px] outline-none placeholder:text-muted disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!enabled || sending || !draft.trim()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-electric text-white hover:bg-electric-bright disabled:opacity-35"
            aria-label={t.send}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
