export type Lang = "en" | "ar";

export interface Dict {
  dir: "ltr" | "rtl";
  nav: { about: string; features: string; download: string; langLabel: string };
  hero: { pill: string; title: string; subtitle: string; cta: string; soon: string };
  about: { title: string; body: string };
  features: {
    title: string;
    subtitle: string;
    items: { icon: string; title: string; body: string }[];
  };
  download: { title: string; body: string; badgeSmall: string; badgeStore: string };
  footer: { rights: string; privacy: string; terms: string; support: string };
  legal: { back: string; updated: string };
}

export const dict: Record<Lang, Dict> = {
  en: {
    dir: "ltr",
    nav: { about: "About", features: "Features", download: "Download", langLabel: "العربية" },
    hero: {
      pill: "🇴🇲 Made for Muscat",
      title: "Where sport meets simplicity",
      subtitle:
        "Discover and book football pitches across Muscat — in seconds. Maydan brings players and pitches together.",
      cta: "Get the app",
      soon: "Coming soon to iPhone",
    },
    about: {
      title: "About Maydan",
      body: "Maydan is Oman's easiest way to find and book football pitches. Whether you're organising a five-a-side with friends or running a venue, Maydan puts the whole experience in one app — in Arabic and English.",
    },
    features: {
      title: "What you can do",
      subtitle: "Everything you need to play, from finding a pitch to splitting the bill.",
      items: [
        { icon: "🗺️", title: "Discover pitches", body: "Browse pitches near you on a map and filter by size, surface and price." },
        { icon: "⚡", title: "Book in seconds", body: "Pick a slot and confirm instantly, with secure payment in Omani Rial." },
        { icon: "🤝", title: "Split the cost", body: "Pay only your share and invite teammates to pay theirs with a simple code." },
        { icon: "📊", title: "For pitch owners", body: "Manage bookings, availability and earnings from one simple dashboard." },
      ],
    },
    download: {
      title: "Coming soon",
      body: "Maydan launches soon on iPhone. The pitches of Muscat, a tap away.",
      badgeSmall: "Coming soon on the",
      badgeStore: "App Store",
    },
    footer: {
      rights: "© 2026 Maydan · Muscat, Oman",
      privacy: "Privacy",
      terms: "Terms",
      support: "Support",
    },
    legal: {
      back: "Back to home",
      updated: "Last updated",
    },
  },
  ar: {
    dir: "rtl",
    nav: { about: "عن ميدان", features: "المميزات", download: "التطبيق", langLabel: "English" },
    hero: {
      pill: "🇴🇲 صُنع لمسقط",
      title: "حيث تلتقي الرياضة بالبساطة",
      subtitle:
        "اكتشف واحجز ملاعب كرة القدم في مسقط — في ثوانٍ. يجمع ميدان بين اللاعبين والملاعب في مكان واحد.",
      cta: "حمّل التطبيق",
      soon: "قريبًا على آيفون",
    },
    about: {
      title: "عن ميدان",
      body: "ميدان هو أسهل طريقة في عُمان للعثور على ملاعب كرة القدم وحجزها. سواء كنت تنظّم مباراة خماسية مع أصدقائك أو تدير ملعبًا، يجمع ميدان التجربة كاملة في تطبيق واحد — بالعربية والإنجليزية.",
    },
    features: {
      title: "ماذا يمكنك أن تفعل",
      subtitle: "كل ما تحتاجه للعب، من إيجاد ملعب إلى تقسيم الفاتورة.",
      items: [
        { icon: "🗺️", title: "اكتشف الملاعب", body: "تصفّح الملاعب القريبة منك على الخريطة وصفِّ حسب الحجم والأرضية والسعر." },
        { icon: "⚡", title: "احجز في ثوانٍ", body: "اختر موعدًا وأكّد فورًا، مع دفع آمن بالريال العُماني." },
        { icon: "🤝", title: "قسّم التكلفة", body: "ادفع حصتك فقط وادعُ زملاءك لدفع أنصبتهم برمز بسيط." },
        { icon: "📊", title: "لأصحاب الملاعب", body: "أدِر الحجوزات والأوقات المتاحة والأرباح من لوحة تحكّم واحدة بسيطة." },
      ],
    },
    download: {
      title: "قريبًا",
      body: "ينطلق ميدان قريبًا على آيفون. ملاعب مسقط على بُعد لمسة.",
      badgeSmall: "قريبًا على",
      badgeStore: "App Store",
    },
    footer: {
      rights: "© 2026 ميدان · مسقط، عُمان",
      privacy: "الخصوصية",
      terms: "الشروط",
      support: "الدعم",
    },
    legal: {
      back: "العودة للرئيسية",
      updated: "آخر تحديث",
    },
  },
};
