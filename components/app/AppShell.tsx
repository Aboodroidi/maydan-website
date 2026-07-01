"use client";

import { useState } from "react";
import { Sidebar, type AppView } from "./Sidebar";
import { DiscoverView } from "./DiscoverView";
import { useLang } from "@/components/LangProvider";

function ComingNext({ title, note }: { title: string; note: string }) {
  return (
    <div className="grid h-full place-items-center p-8 text-center">
      <div>
        <h2 className="text-2xl font-black">{title}</h2>
        <p className="mt-2 max-w-md text-muted">{note}</p>
      </div>
    </div>
  );
}

export function AppShell() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const [view, setView] = useState<AppView>("discover");

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar view={view} onSelect={setView} />
      <main className="min-w-0 flex-1 overflow-hidden">
        <div key={view} className="fade-up h-full">
          {view === "discover" && <DiscoverView />}
          {view === "bookings" && (
            <ComingNext
              title={ar ? "الحجوزات" : "Bookings"}
              note={ar ? "قريبًا: عرض وإدارة حجوزاتك." : "Coming next: view and manage your bookings."}
            />
          )}
          {view === "owner" && (
            <ComingNext
              title={ar ? "لوحة المالك" : "Owner dashboard"}
              note={ar ? "قريبًا: الإيرادات والحجوزات وإدارة الملاعب." : "Coming next: earnings, schedule and pitch management."}
            />
          )}
          {view === "profile" && (
            <ComingNext
              title={ar ? "الملف الشخصي" : "Profile"}
              note={ar ? "قريبًا: تسجيل الدخول والحساب." : "Coming next: sign in and account."}
            />
          )}
        </div>
      </main>
    </div>
  );
}
