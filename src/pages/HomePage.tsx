import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../lib/i18n";

/*
 * Home: a parallax landing page explaining what Maydan does.
 *
 * Parallax approach: one rAF-throttled scroll listener on the app's scrolling
 * <main> writes the scroll offset to a CSS variable (--sy) on the page root.
 * Decorative layers translate at different multiples of --sy, so they drift at
 * different speeds while the content scrolls normally. Sections fade up as
 * they enter the viewport via IntersectionObserver. Both effects are skipped
 * for prefers-reduced-motion.
 */

const T = {
  heroPill: { en: "Made for Muscat", ar: "صُنع لمسقط" },
  heroTitle1: { en: "Where sport meets", ar: "حيث تلتقي الرياضة" },
  heroTitle2: { en: "simplicity", ar: "بالبساطة" },
  heroSub: {
    en: "Discover and book football pitches across Muscat in seconds. Maydan brings players, teams and pitch owners together in one place.",
    ar: "اكتشف واحجز ملاعب كرة القدم في مسقط خلال ثوانٍ. ميدان يجمع اللاعبين والفرق وأصحاب الملاعب في مكان واحد.",
  },
  ctaDiscover: { en: "Explore pitches", ar: "استكشف الملاعب" },
  ctaAI: { en: "Ask Maydan AI", ar: "اسأل ميدان AI" },
  soon: { en: "The iOS app is coming soon to iPhone", ar: "تطبيق iOS قادم قريباً إلى الآيفون" },

  s1Kicker: { en: "Discover", ar: "اكتشف" },
  s1Title: { en: "Every pitch in Muscat, on one map", ar: "كل ملاعب مسقط على خريطة واحدة" },
  s1Body: {
    en: "Browse live pitches near you, compare prices in OMR, and filter by size, surface, indoor or outdoor. Real venues, real availability, straight from the same database as the app.",
    ar: "تصفح الملاعب القريبة منك، قارن الأسعار بالريال العماني، وصفِّ حسب الحجم ونوع الأرضية وداخلي أو خارجي. ملاعب حقيقية وتوفر حقيقي من نفس قاعدة بيانات التطبيق.",
  },
  s2Kicker: { en: "Book", ar: "احجز" },
  s2Title: { en: "Pick a time. Confirm in seconds.", ar: "اختر وقتاً وأكد خلال ثوانٍ" },
  s2Body: {
    en: "See open time slots for the next seven days, choose your court, and confirm instantly. Your booking shows up live for the pitch owner the moment you tap.",
    ar: "شاهد الأوقات المتاحة للأيام السبعة القادمة، اختر ملعبك، وأكد فوراً. يظهر حجزك مباشرة لصاحب الملعب لحظة التأكيد.",
  },
  s3Kicker: { en: "Play together", ar: "العبوا معاً" },
  s3Title: { en: "Split the cost with a 6-digit code", ar: "اقسم التكلفة برمز من 6 أرقام" },
  s3Body: {
    en: "Every booking gets a short join code. Share it with your teammates so everyone pays their share, not just the one who booked.",
    ar: "كل حجز يحصل على رمز انضمام قصير. شاركه مع زملائك ليدفع كل واحد حصته، وليس من حجز فقط.",
  },
  s4Kicker: { en: "For owners", ar: "لأصحاب الملاعب" },
  s4Title: { en: "Run your venue from anywhere", ar: "أدر ملعبك من أي مكان" },
  s4Body: {
    en: "Live bookings, revenue charts, prices and court availability, all in an owner dashboard that syncs with the Maydan app in real time.",
    ar: "حجوزات مباشرة ورسوم بيانية للإيرادات وأسعار وتوفر الملاعب، كلها في لوحة تحكم تتزامن مع تطبيق ميدان لحظياً.",
  },
  s5Kicker: { en: "Maydan AI", ar: "ميدان AI" },
  s5Title: { en: "An assistant that knows the pitches", ar: "مساعد يعرف الملاعب" },
  s5Body: {
    en: "Ask in Arabic or English. Maydan AI reads live pitch data, so it recommends real venues, real prices and real times, never guesses.",
    ar: "اسأل بالعربية أو الإنجليزية. يقرأ ميدان AI بيانات الملاعب المباشرة، فيرشّح ملاعب وأسعاراً وأوقاتاً حقيقية دون تخمين.",
  },

  bottomTitle: { en: "Ready to play?", ar: "جاهز للعب؟" },
  bottomBody: {
    en: "Find your pitch and get on the grass. It takes less than a minute.",
    ar: "اعثر على ملعبك وانزل إلى أرض الملعب. يستغرق الأمر أقل من دقيقة.",
  },
  rights: { en: "Maydan. All rights reserved.", ar: "ميدان. جميع الحقوق محفوظة." },
  privacy: { en: "Privacy", ar: "الخصوصية" },
  terms: { en: "Terms", ar: "الشروط" },
  support: { en: "Support", ar: "الدعم" },
};

type Feature = {
  kicker: keyof typeof T | string;
  icon: string;
  k: { en: string; ar: string };
  title: { en: string; ar: string };
  body: { en: string; ar: string };
  to: string;
  cta: { en: string; ar: string };
  flip?: boolean;
  visual: "map" | "slots" | "code" | "owner" | "ai";
};

const FEATURES: Feature[] = [
  { kicker: "s1", icon: "M12 2C7.6 2 4 5.6 4 10c0 5.2 8 12 8 12s8-6.8 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z", k: T.s1Kicker, title: T.s1Title, body: T.s1Body, to: "/discover", cta: { en: "Open the map", ar: "افتح الخريطة" }, visual: "map" },
  { kicker: "s2", icon: "M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z", k: T.s2Kicker, title: T.s2Title, body: T.s2Body, to: "/discover", cta: { en: "Find a slot", ar: "ابحث عن وقت" }, flip: true, visual: "slots" },
  { kicker: "s3", icon: "M17 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9.5 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75", k: T.s3Kicker, title: T.s3Title, body: T.s3Body, to: "/bookings", cta: { en: "Join with a code", ar: "انضم برمز" }, visual: "code" },
  { kicker: "s4", icon: "M4 20V10M10 20V4M16 20v-8M22 20H2", k: T.s4Kicker, title: T.s4Title, body: T.s4Body, to: "/owner", cta: { en: "Open the dashboard", ar: "افتح لوحة التحكم" }, flip: true, visual: "owner" },
  { kicker: "s5", icon: "M3 6a1 1 0 011-1h16a1 1 0 011 1v10a1 1 0 01-1 1H7l-4 4V6zM8 9.5h8M8 12.5h5", k: T.s5Kicker, title: T.s5Title, body: T.s5Body, to: "/ai", cta: { en: "Start a chat", ar: "ابدأ محادثة" }, visual: "ai" },
];

export default function HomePage() {
  const { ar } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);

  // Parallax: mirror the scrolling <main>'s offset into --sy on the page root.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scroller = root.closest("main");
    if (!scroller) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        root.style.setProperty("--sy", String(scroller.scrollTop));
      });
    };
    onScroll();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Reveal sections as they scroll into view.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("!opacity-100", "!translate-y-0"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("!opacity-100", "!translate-y-0");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.18 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const px = (f: number) => `translateY(calc(var(--sy, 0) * ${f}px))`;

  return (
    <div ref={rootRef} className="relative overflow-x-clip" style={{ ["--sy" as string]: 0 }}>
      {/* ---------- Hero ---------- */}
      <section className="relative flex min-h-[calc(100dvh-64px)] items-center overflow-hidden">
        {/* Parallax decorative layers (slowest in back) */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* big soft glows */}
          <div className="absolute -top-40 start-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-electric/15 blur-3xl" style={{ transform: px(0.06) }} />
          <div className="absolute top-40 -start-40 h-[420px] w-[420px] rounded-full bg-electric/10 blur-3xl" style={{ transform: px(0.12) }} />
          {/* giant drifting logo watermark */}
          <img
            src="/assets/img/logo_electric_blue.svg"
            alt=""
            className="absolute -end-24 top-10 w-[420px] opacity-[0.06] sm:w-[560px]"
            style={{ transform: px(-0.08) }}
          />
          {/* floating mini cards, faster drift */}
          <div className="absolute end-[12%] top-[22%] hidden rotate-3 lg:block" style={{ transform: px(-0.22) }}>
            <div className="card flex items-center gap-3 px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-electric/10 text-electric">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
              </span>
              <div className="text-start">
                <p className="text-[13px] font-black text-ink">{ar ? "تم تأكيد الحجز" : "Booking confirmed"}</p>
                <p className="text-[11.5px] text-muted">{ar ? "الخميس 6 مساءً" : "Thu, 6:00 PM"} · OMR 12.0</p>
              </div>
            </div>
          </div>
          <div className="absolute end-[28%] top-[64%] hidden -rotate-2 lg:block" style={{ transform: px(-0.3) }}>
            <div className="card flex items-center gap-3 px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-electric text-white text-[12px] font-black">5v5</span>
              <div className="text-start">
                <p className="text-[13px] font-black text-ink">{ar ? "رمز الانضمام" : "Join code"}</p>
                <p className="font-mono text-[13px] font-bold tracking-[0.2em] text-electric">A7K2MD</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-electric/25 bg-electric/8 px-4 py-1.5 text-[13px] font-bold text-electric">
              <span aria-hidden>🇴🇲</span> {ar ? T.heroPill.ar : T.heroPill.en}
            </span>
            <h1 className="mt-6 text-[44px] font-black leading-[1.04] tracking-tight text-ink sm:text-[64px]">
              {ar ? T.heroTitle1.ar : T.heroTitle1.en}
              <span className="block text-electric">{ar ? T.heroTitle2.ar : T.heroTitle2.en}</span>
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted sm:text-[18px]">
              {ar ? T.heroSub.ar : T.heroSub.en}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/discover" className="btn btn-primary !px-7 !py-3.5 !text-[16px]">
                {ar ? T.ctaDiscover.ar : T.ctaDiscover.en}
              </Link>
              <Link to="/ai" className="btn btn-ghost !px-7 !py-3.5 !text-[16px]">
                {ar ? T.ctaAI.ar : T.ctaAI.en}
              </Link>
            </div>
            <p className="mt-5 text-[13.5px] font-semibold text-muted">{ar ? T.soon.ar : T.soon.en}</p>
          </div>
        </div>
      </section>

      {/* ---------- Feature sections ---------- */}
      <div className="relative mx-auto max-w-[1200px] px-4 pb-8 sm:px-6">
        {FEATURES.map((f, i) => (
          <section
            key={f.to + i}
            data-reveal
            className={`flex translate-y-6 flex-col items-center gap-8 py-14 opacity-0 transition-all duration-700 sm:py-20 lg:flex-row lg:gap-16 ${
              f.flip ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Copy */}
            <div className="w-full lg:w-1/2">
              <span className="inline-flex items-center gap-2 text-[13.5px] font-black uppercase tracking-[0.14em] text-electric">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon} /></svg>
                {ar ? f.k.ar : f.k.en}
              </span>
              <h2 className="mt-3 text-[30px] font-black leading-tight tracking-tight text-ink sm:text-[38px]">
                {ar ? f.title.ar : f.title.en}
              </h2>
              <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-muted">{ar ? f.body.ar : f.body.en}</p>
              <Link to={f.to} className="mt-6 inline-flex items-center gap-2 text-[15px] font-bold text-electric hover:text-electric-bright">
                {ar ? f.cta.ar : f.cta.en}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={ar ? "rotate-180" : ""}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
            </div>

            {/* Visual with its own slight parallax drift */}
            <div className="w-full lg:w-1/2" style={{ transform: px(i % 2 ? 0.015 : -0.015) }}>
              <FeatureVisual kind={f.visual} ar={ar} />
            </div>
          </section>
        ))}
      </div>

      {/* ---------- Bottom CTA ---------- */}
      <section data-reveal className="relative translate-y-6 opacity-0 transition-all duration-700">
        <div className="mx-auto max-w-[1200px] px-4 pb-20 sm:px-6">
          <div className="relative overflow-hidden rounded-[28px] bg-electric px-6 py-14 text-center sm:py-16" style={{ background: "linear-gradient(135deg, #3b76f6, #1d4ed8)" }}>
            <img src="/assets/img/logo_white.svg" alt="" aria-hidden className="pointer-events-none absolute -end-10 -top-10 w-64 opacity-10" />
            <h2 className="text-[32px] font-black tracking-tight text-white sm:text-[40px]">{ar ? T.bottomTitle.ar : T.bottomTitle.en}</h2>
            <p className="mx-auto mt-3 max-w-md text-[16px] text-white/85">{ar ? T.bottomBody.ar : T.bottomBody.en}</p>
            <Link to="/discover" className="btn mt-8 !bg-white !px-8 !py-3.5 !text-[16px] !text-electric hover:!bg-white/90">
              {ar ? T.ctaDiscover.ar : T.ctaDiscover.en}
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-border bg-surface/60">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-3">
            <img src="/assets/img/logo_electric_blue.svg" alt="Maydan" className="h-7 w-7" />
            <p className="text-[13px] text-muted">© {new Date().getFullYear()} {ar ? T.rights.ar : T.rights.en}</p>
          </div>
          <nav className="flex items-center gap-5 text-[13.5px] font-semibold text-muted">
            <Link to="/privacy" className="hover:text-electric">{ar ? T.privacy.ar : T.privacy.en}</Link>
            <Link to="/terms" className="hover:text-electric">{ar ? T.terms.ar : T.terms.en}</Link>
            <Link to="/support" className="hover:text-electric">{ar ? T.support.ar : T.support.en}</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Decorative feature visuals (pure CSS/SVG mockups) ---------- */

function FeatureVisual({ kind, ar }: { kind: Feature["visual"]; ar: boolean }) {
  if (kind === "map") {
    return (
      <Frame>
        <div className="relative h-64 overflow-hidden rounded-2xl bg-bg-soft sm:h-72">
          {/* stylized roads */}
          <svg className="absolute inset-0 h-full w-full text-ink/8" viewBox="0 0 400 300" fill="none" stroke="currentColor">
            <path d="M-20 80 C120 60 180 140 420 110" strokeWidth="14" />
            <path d="M-20 190 C140 210 260 150 420 210" strokeWidth="10" />
            <path d="M120 -20 C110 100 170 200 150 320" strokeWidth="10" />
            <path d="M280 -20 C300 80 260 220 300 320" strokeWidth="14" />
          </svg>
          {/* price markers */}
          {[
            { top: "22%", start: "18%", p: "OMR 10" },
            { top: "48%", start: "52%", p: "OMR 12", active: true },
            { top: "68%", start: "28%", p: "OMR 8" },
            { top: "30%", start: "72%", p: "OMR 15" },
          ].map((m) => (
            <span
              key={m.p + m.top}
              className={`absolute rounded-full px-3 py-1 text-[12px] font-black shadow-md ${
                m.active ? "bg-electric text-white" : "border border-electric/30 bg-white text-electric"
              }`}
              style={{ top: m.top, insetInlineStart: m.start }}
            >
              {m.p}
            </span>
          ))}
        </div>
      </Frame>
    );
  }
  if (kind === "slots") {
    const slots = ["4:00", "5:00", "6:00", "7:00", "8:00", "9:00"];
    return (
      <Frame>
        <p className="mb-3 text-[13px] font-black uppercase tracking-wider text-muted">{ar ? "اليوم" : "Today"}</p>
        <div className="grid grid-cols-3 gap-2.5">
          {slots.map((s, i) => (
            <span
              key={s}
              className={`rounded-xl border px-3 py-3 text-center text-[14px] font-bold ${
                i === 2
                  ? "border-electric bg-electric text-white shadow-md shadow-electric/30"
                  : i === 4
                    ? "border-border bg-bg-soft text-muted/50 line-through"
                    : "border-border bg-white text-ink"
              }`}
            >
              {s} PM
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-bg-soft px-4 py-3">
          <span className="text-[14px] font-bold text-ink">{ar ? "ملعب 6 لاعبين" : "6-a-side court"}</span>
          <span className="text-[14px] font-black text-electric">OMR 12.0</span>
        </div>
      </Frame>
    );
  }
  if (kind === "code") {
    return (
      <Frame>
        <div className="flex flex-col items-center py-4">
          <p className="text-[13px] font-black uppercase tracking-wider text-muted">{ar ? "رمز الانضمام" : "Join code"}</p>
          <div className="mt-4 flex gap-2" dir="ltr">
            {"A7K2MD".split("").map((c, i) => (
              <span key={i} className="flex h-12 w-10 items-center justify-center rounded-xl border border-electric/30 bg-white text-[20px] font-black text-electric shadow-sm">
                {c}
              </span>
            ))}
          </div>
          <div className="mt-6 flex -space-x-2" dir="ltr">
            {["bg-electric", "bg-electric/80", "bg-electric/60", "bg-electric/40"].map((b, i) => (
              <span key={i} className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white ${b} text-[12px] font-black text-white`}>
                {["A", "S", "M", "+2"][i]}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[13.5px] text-muted">{ar ? "دفع 4 من 5 لاعبين" : "4 of 5 players paid"}</p>
        </div>
      </Frame>
    );
  }
  if (kind === "owner") {
    const bars = [34, 52, 40, 68, 58, 82, 74];
    return (
      <Frame>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[13px] font-black uppercase tracking-wider text-muted">{ar ? "هذا الأسبوع" : "This week"}</p>
          <span className="rounded-full bg-electric/10 px-3 py-1 text-[12.5px] font-black text-electric">OMR 486.0</span>
        </div>
        <div className="flex h-40 items-end gap-2.5" dir="ltr">
          {bars.map((h, i) => (
            <span key={i} className={`flex-1 rounded-t-lg ${i === 5 ? "bg-electric" : "bg-electric/25"}`} style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-bg-soft px-4 py-3">
            <p className="text-[12px] font-bold text-muted">{ar ? "حجوزات اليوم" : "Bookings today"}</p>
            <p className="text-[20px] font-black text-ink">9</p>
          </div>
          <div className="rounded-xl bg-bg-soft px-4 py-3">
            <p className="text-[12px] font-bold text-muted">{ar ? "نسبة الإشغال" : "Occupancy"}</p>
            <p className="text-[20px] font-black text-ink">72%</p>
          </div>
        </div>
      </Frame>
    );
  }
  // ai
  return (
    <Frame>
      <div className="space-y-3 py-2">
        <div className="ms-auto max-w-[75%] rounded-2xl rounded-ee-md bg-electric px-4 py-2.5 text-[14px] font-semibold text-white shadow-md shadow-electric/25">
          {ar ? "أبحث عن ملعب 5 لاعبين الليلة قريب مني" : "Find me a 5-a-side pitch tonight near me"}
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-es-md border border-border bg-white px-4 py-2.5 text-[14px] text-ink shadow-sm">
          {ar
            ? "أقرب خيار متاح: أزيبة فيلدز الساعة 8 مساءً بـ 12 ريال. أرسل لك الرابط؟"
            : "Closest open option: Azaiba Fields at 8 PM for OMR 12.0. Want the link?"}
        </div>
        <div className="flex items-center gap-1.5 ps-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-muted/50" style={{ animation: `pulse 1.2s ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="card card-hover mx-auto w-full max-w-md p-5 sm:p-6">
      {children}
    </div>
  );
}
